import { RateLimiter } from '../utils/rate-limiter';
import { PolygonWebSocket } from '../api/polygon-websocket';
import { CONFIG } from '../config';
import { logger } from '../utils/logger';
import { CacheManager } from '../utils/cache-manager';

// Types for market data
export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdated: number;
  metadata: {
    source: 'websocket' | 'rest' | 'cache';
    reliability: number;
    staleness: number;
  };
}

export class MarketDataService {
  private static instance: MarketDataService;
  private webSocket!: PolygonWebSocket;
  private rateLimiter!: RateLimiter;
  private updateInterval: NodeJS.Timeout | null = null;
  private activeSymbols: Set<string> = new Set();
  private subscribers: Map<string, Set<(data: MarketData) => void>> = new Map();
  private batchUpdateInProgress: boolean = false;
  private cacheManager: CacheManager;

  private constructor() {
    // Only initialize WebSocket on the client side
    if (typeof window !== 'undefined') {
      this.webSocket = PolygonWebSocket.getInstance();
      this.rateLimiter = new RateLimiter({
        tokensPerInterval: CONFIG.RATE_LIMIT.REQUESTS_PER_MINUTE,
        interval: 60000,
        burstSize: CONFIG.RATE_LIMIT.BURST_SIZE,
      });
      this.cacheManager = CacheManager.getInstance();

      this.setupWebSocket();
      this.startUpdateInterval();
    }
  }

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private setupWebSocket() {
    this.webSocket.on('message', (data: any) => {
      if (data.ev === 'T') {
        const marketData = this.transformTradeToMarketData(data);
        this.notifySubscribers(marketData.symbol, marketData);
      }
    });

    this.webSocket.on('error', (error: unknown) => {
      logger.error('WebSocket error:', error);
    });
  }

  private transformTradeToMarketData(trade: any): MarketData {
    return {
      symbol: trade.sym,
      price: trade.p,
      change: 0, // Will be calculated in batch updates
      changePercent: 0, // Will be calculated in batch updates
      volume: trade.s,
      lastUpdated: Date.now(),
      metadata: {
        source: 'websocket',
        reliability: 1,
        staleness: 0
      }
    };
  }

  private startUpdateInterval() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateBatchData();
    }, CONFIG.UPDATE_INTERVAL);
  }

  private async updateBatchData() {
    if (this.batchUpdateInProgress || this.activeSymbols.size === 0) {
      return;
    }

    this.batchUpdateInProgress = true;
    try {
      const symbols = Array.from(this.activeSymbols);
      const response = await fetch(`/api/market-data?operation=snapshot&symbols=${symbols.join(',')}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }

      const data = await response.json();
      
      data.tickers.forEach((ticker: any) => {
        const marketData: MarketData = {
          symbol: ticker.ticker,
          price: ticker.lastTrade?.p || ticker.lastQuote?.p || 0,
          change: ticker.todaysChange || 0,
          changePercent: ticker.todaysChangePerc || 0,
          volume: ticker.day?.v || 0,
          lastUpdated: Date.now(),
          metadata: {
            source: 'rest',
            reliability: 0.9,
            staleness: 0
          }
        };
        this.notifySubscribers(ticker.ticker, marketData);
      });
    } catch (error) {
      logger.error('Error updating batch data:', error);
    } finally {
      this.batchUpdateInProgress = false;
    }
  }

  public async getBatchMarketData(symbols: string[]): Promise<Record<string, MarketData>> {
    try {
      const response = await fetch(`/api/market-data?operation=snapshot&symbols=${symbols.join(',')}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }

      const data = await response.json();
      
      return data.tickers.reduce((acc: Record<string, MarketData>, ticker: any) => {
        acc[ticker.ticker] = {
          symbol: ticker.ticker,
          price: ticker.lastTrade?.p || ticker.lastQuote?.p || 0,
          change: ticker.todaysChange || 0,
          changePercent: ticker.todaysChangePerc || 0,
          volume: ticker.day?.v || 0,
          lastUpdated: Date.now(),
          metadata: {
            source: 'rest',
            reliability: 0.9,
            staleness: 0
          }
        };
        return acc;
      }, {});
    } catch (error) {
      logger.error('Error fetching batch market data:', error);
      throw error;
    }
  }

  public subscribe(symbol: string, callback: (data: MarketData) => void) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      this.activeSymbols.add(symbol);
      
      if (typeof window !== 'undefined') {
        this.webSocket.subscribe(symbol);
      }
    }
    this.subscribers.get(symbol)?.add(callback);
  }

  public unsubscribe(symbol: string, callback: (data: MarketData) => void) {
    const symbolSubscribers = this.subscribers.get(symbol);
    if (symbolSubscribers) {
      symbolSubscribers.delete(callback);
      if (symbolSubscribers.size === 0) {
        this.subscribers.delete(symbol);
        this.activeSymbols.delete(symbol);
        
        if (typeof window !== 'undefined') {
          this.webSocket.unsubscribe(symbol);
        }
      }
    }
  }

  private async getMarketData(symbol: string): Promise<MarketData | null> {
    try {
      // Check cache first
      const cacheKey = `market:${symbol}`;
      const cachedData = await this.cacheManager.get<MarketData>(cacheKey, 'MARKET_DATA');
      
      if (cachedData) {
        // Update metadata for cached data
        cachedData.metadata.source = 'cache';
        cachedData.metadata.staleness = (Date.now() - cachedData.lastUpdated) / 1000;
        return cachedData;
      }

      // If not in cache, fetch from API with rate limiting
      const rateLimitInfo = await this.rateLimiter.consume(symbol);
      if (rateLimitInfo.remaining <= 0) {
        logger.warn(`Rate limit exceeded for symbol ${symbol}`);
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      const data = await this.fetchFromPolygon(symbol);
      if (data) {
        // Cache the data with TTL
        await this.cacheManager.set(cacheKey, data, 'MARKET_DATA', {
          ttl: CONFIG.CACHE_TTL.MARKET_DATA
        });
        return data;
      }

      return null;
    } catch (error) {
      logger.error(`Error fetching market data for ${symbol}:`, error);
      throw error;
    }
  }

  private async fetchFromPolygon(symbol: string): Promise<MarketData> {
    try {
      const response = await fetch(`/api/polygon-stocks/snapshot/${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch from Polygon API');
      }

      const data = await response.json();
      return {
        symbol: data.ticker,
        price: data.lastTrade?.p || data.lastQuote?.p || 0,
        change: data.todaysChange || 0,
        changePercent: data.todaysChangePerc || 0,
        volume: data.day?.v || 0,
        lastUpdated: Date.now(),
        metadata: {
          source: 'rest',
          reliability: 1,
          staleness: 0
        }
      };
    } catch (error) {
      logger.error(`Error fetching from Polygon for ${symbol}:`, error);
      throw error;
    }
  }

  private notifySubscribers(symbol: string, data: MarketData) {
    const subscribers = this.subscribers.get(symbol);
    if (subscribers) {
      // Update cache with latest data
      this.cacheManager.set(`market:${symbol}`, data, 'MARKET_DATA', {
        ttl: CONFIG.CACHE_TTL.MARKET_DATA
      }).catch(error => {
        logger.error(`Error updating cache for ${symbol}:`, error);
      });

      // Notify all subscribers
      subscribers.forEach(callback => callback(data));
    }
  }

  public cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    if (typeof window !== 'undefined') {
      this.webSocket.disconnect();
    }
    
    this.subscribers.clear();
    this.activeSymbols.clear();
  }
}

export const marketDataService = MarketDataService.getInstance(); 