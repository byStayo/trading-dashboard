import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { cacheManager } from '../utils/cache-manager';
import { dataValidationService } from './data-validation-service';
import { webSocketService } from './websocket-service';

interface MarketDataConfig {
  refreshInterval?: number;
  cacheTTL?: number;
  batchSize?: number;
  maxRetries?: number;
  retryDelay?: number;
}

const DEFAULT_CONFIG = {
  refreshInterval: 5000, // 5 seconds
  cacheTTL: 60000, // 1 minute
  batchSize: 100,
  maxRetries: 3,
  retryDelay: 1000,
} as const;

class MarketDataService extends EventEmitter {
  private static instance: MarketDataService;
  private subscriptions: Map<string, Set<(data: any) => void>> = new Map();
  private updateQueue: Set<string> = new Set();
  private updateTimeout: NodeJS.Timeout | null = null;
  private retryAttempts: Map<string, number> = new Map();
  private lastUpdate: Map<string, number> = new Map();

  private constructor() {
    super();
    this.setupMetrics();
    this.setupWebSocket();
  }

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private setupMetrics() {
    metrics.register({
      name: 'market_data_updates',
      help: 'Number of market data updates',
      type: 'counter',
      labels: ['type', 'source'],
    });

    metrics.register({
      name: 'market_data_errors',
      help: 'Number of market data errors',
      type: 'counter',
      labels: ['type'],
    });

    metrics.register({
      name: 'market_data_latency',
      help: 'Market data update latency in milliseconds',
      type: 'histogram',
      labels: ['type'],
    });
  }

  private setupWebSocket() {
    const wsUrl = process.env.MARKET_DATA_WS_URL || 'wss://example.com/market-data';
    
    webSocketService.connect(wsUrl).catch(error => {
      logger.error('Failed to connect to market data WebSocket:', error);
    });

    webSocketService.on('messages', ({ messages }) => {
      for (const message of messages) {
        if (message.type === 'trade' || message.type === 'quote') {
          this.handleWebSocketUpdate(message);
        }
      }
    });
  }

  private async handleWebSocketUpdate(message: any) {
    try {
      const validatedData = await dataValidationService.validateMarketData(message.data);
      
      // Update cache
      await this.updateCache(validatedData.symbol, validatedData);

      // Notify subscribers
      this.notifySubscribers(validatedData.symbol, validatedData);

      metrics.record('market_data_updates', 1, {
        type: message.type,
        source: 'websocket',
      });
    } catch (error) {
      logger.error('Error handling WebSocket update:', error);
      metrics.record('market_data_errors', 1, { type: 'websocket' });
    }
  }

  private async updateCache(symbol: string, data: any) {
    try {
      await cacheManager.set(
        symbol,
        data,
        'MARKET_DATA',
        {
          ttl: DEFAULT_CONFIG.cacheTTL,
          tags: ['market-data', symbol],
        }
      );
      this.lastUpdate.set(symbol, Date.now());
    } catch (error) {
      logger.error(`Error updating cache for symbol ${symbol}:`, error);
      metrics.record('market_data_errors', 1, { type: 'cache' });
    }
  }

  private notifySubscribers(symbol: string, data: any) {
    const subscribers = this.subscriptions.get(symbol);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Error in subscriber callback for symbol ${symbol}:`, error);
        }
      });
    }
  }

  async subscribe(
    symbol: string,
    callback: (data: any) => void,
    config: Partial<MarketDataConfig> = {}
  ): Promise<void> {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };

    // Add to subscribers
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, new Set());
    }
    this.subscriptions.get(symbol)?.add(callback);

    try {
      // Get initial data
      const cachedData = await cacheManager.get(symbol, 'MARKET_DATA');
      if (cachedData) {
        callback(cachedData);
      } else {
        // Queue for update
        this.queueUpdate(symbol);
      }

      // Subscribe to WebSocket updates
      webSocketService.subscribe(
        process.env.MARKET_DATA_WS_URL || 'wss://example.com/market-data',
        symbol
      );

      // Set up polling if requested
      if (fullConfig.refreshInterval) {
        setInterval(() => this.queueUpdate(symbol), fullConfig.refreshInterval);
      }
    } catch (error) {
      logger.error(`Error subscribing to symbol ${symbol}:`, error);
      metrics.record('market_data_errors', 1, { type: 'subscription' });
      throw error;
    }
  }

  async unsubscribe(symbol: string, callback: (data: any) => void): Promise<void> {
    const subscribers = this.subscriptions.get(symbol);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscriptions.delete(symbol);
        webSocketService.unsubscribe(
          process.env.MARKET_DATA_WS_URL || 'wss://example.com/market-data',
          symbol
        );
      }
    }
  }

  private queueUpdate(symbol: string) {
    this.updateQueue.add(symbol);
    this.scheduleUpdate();
  }

  private scheduleUpdate() {
    if (this.updateTimeout) return;

    this.updateTimeout = setTimeout(() => {
      this.processBatchUpdate();
      this.updateTimeout = null;
    }, 100); // Process updates every 100ms
  }

  private async processBatchUpdate() {
    if (this.updateQueue.size === 0) return;

    const symbols = Array.from(this.updateQueue);
    this.updateQueue.clear();

    // Split into batches
    for (let i = 0; i < symbols.length; i += DEFAULT_CONFIG.batchSize) {
      const batch = symbols.slice(i, i + DEFAULT_CONFIG.batchSize);
      await this.fetchBatchUpdate(batch);
    }
  }

  private async fetchBatchUpdate(symbols: string[]) {
    try {
      const startTime = Date.now();
      const response = await fetch('/api/market-data/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Process each symbol's data
      for (const [symbol, marketData] of Object.entries(data)) {
        try {
          const validatedData = await dataValidationService.validateMarketData(marketData);
          await this.updateCache(symbol, validatedData);
          this.notifySubscribers(symbol, validatedData);

          metrics.record('market_data_updates', 1, {
            type: 'batch',
            source: 'rest',
          });
          metrics.record('market_data_latency', Date.now() - startTime, {
            type: 'batch',
          });
        } catch (error) {
          logger.error(`Error processing data for symbol ${symbol}:`, error);
          this.handleUpdateError(symbol);
        }
      }
    } catch (error) {
      logger.error('Error fetching batch update:', error);
      metrics.record('market_data_errors', 1, { type: 'batch' });
      
      // Requeue failed symbols with backoff
      symbols.forEach(symbol => this.handleUpdateError(symbol));
    }
  }

  private handleUpdateError(symbol: string) {
    const attempts = (this.retryAttempts.get(symbol) || 0) + 1;
    this.retryAttempts.set(symbol, attempts);

    if (attempts <= DEFAULT_CONFIG.maxRetries) {
      const delay = Math.min(
        DEFAULT_CONFIG.retryDelay * Math.pow(2, attempts - 1),
        30000
      );

      setTimeout(() => {
        this.queueUpdate(symbol);
      }, delay);
    } else {
      logger.error(`Max retry attempts reached for symbol ${symbol}`);
      this.retryAttempts.delete(symbol);
      this.emit('maxRetries', symbol);
    }
  }

  async getLastUpdate(symbol: string): Promise<number | null> {
    return this.lastUpdate.get(symbol) || null;
  }

  async getSubscriberCount(symbol: string): Promise<number> {
    return this.subscriptions.get(symbol)?.size || 0;
  }
}

export const marketDataService = MarketDataService.getInstance(); 