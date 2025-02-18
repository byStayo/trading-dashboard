import axios, { AxiosError, AxiosInstance } from 'axios';
import { z } from 'zod';
import { PolygonWebSocket } from './polygon-websocket';
import { AggregateMessage } from '@/types/polygon';
import { RateLimiter } from '../utils/rate-limiter';
import { cacheManager, CACHE_KEYS } from '../utils/cache-manager';
import { DataTransformer, ValidationError, NewsItemSchema } from '../utils/data-validator';

const POLYGON_BASE_URL = 'https://api.polygon.io';
const POLYGON_WS_URL = 'wss://delayed.polygon.io/stocks';

// Rate limiting configuration
const RATE_LIMIT = {
  REST: {
    REQUESTS_PER_MINUTE: 5,
    BURST_SIZE: 10,
  },
  WEBSOCKET: {
    MAX_SUBSCRIPTIONS: 100,
    SUBSCRIPTION_BATCH_SIZE: 20,
    SUBSCRIPTION_BATCH_DELAY: 1000, // 1 second between batches
  },
};

// Retry configuration
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_FACTOR: 2,
};

// Error types for better error handling
export class PolygonError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'PolygonError';
  }
}

export class RateLimitError extends PolygonError {
  constructor(message: string) {
    super(message, 429, true);
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends PolygonError {
  constructor(message: string) {
    super(message, 401, false);
    this.name = 'AuthenticationError';
  }
}

// Validation schemas for API responses
const AggregateBarSchema = z.object({
  c: z.number(), // close price
  h: z.number(), // high price
  l: z.number(), // low price
  o: z.number(), // open price
  v: z.number(), // volume
  vw: z.number(), // volume weighted average price
  t: z.number(), // timestamp
});

const AggregatesResponseSchema = z.object({
  ticker: z.string(),
  queryCount: z.number(),
  resultsCount: z.number(),
  adjusted: z.boolean(),
  results: z.array(AggregateBarSchema),
  status: z.string(),
  request_id: z.string(),
  count: z.number(),
});

// Types based on validation schemas
export type AggregateBar = z.infer<typeof AggregateBarSchema>;
export type AggregatesResponse = z.infer<typeof AggregatesResponseSchema>;

export interface TimeRange {
  from: Date;
  to: Date;
}

// Helper interface for market data properties
interface MarketData {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  vw: number;
}

interface SnapshotTicker {
  ticker: string;
  day?: MarketData;
  lastTrade?: {
    p: number;
    s: number;
    t: number;
    c: number[];
  };
  min?: {
    av: number;
    vw: number;
    o: number;
    c: number;
    h: number;
    l: number;
    v: number;
    t: number;
  };
  prevDay?: MarketData;
  todaysChange?: number;
  todaysChangePerc?: number;
  updated: number;
}

interface SnapshotResponse {
  status: string;
  tickers: SnapshotTicker[];
}

export interface TechnicalIndicatorsResponse {
  status: string;
  results: {
    underlying: {
      aggregates: AggregatesResponse['results'];
    };
    values: {
      timestamp: number;
      value: number;
    }[];
  };
}

export class PolygonService {
  private static instance: PolygonService;
  private apiKey: string;
  private baseUrl: string;
  private wsUrl: string;
  private webSocket: PolygonWebSocket;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private axiosInstance: AxiosInstance;
  private rateLimiter: RateLimiter;
  private retryCount: Map<string, number> = new Map();

  private constructor() {
    if (typeof window !== 'undefined') {
      throw new Error('PolygonService cannot be instantiated on the client side');
    }

    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      throw new Error('POLYGON_API_KEY environment variable is not set');
    }

    this.apiKey = apiKey;
    this.baseUrl = POLYGON_BASE_URL;
    this.wsUrl = POLYGON_WS_URL;
    this.webSocket = new PolygonWebSocket();
    
    // Initialize axios instance with interceptors
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });

    // Initialize rate limiter
    this.rateLimiter = new RateLimiter({
      tokensPerInterval: RATE_LIMIT.REST.REQUESTS_PER_MINUTE,
      interval: 60000, // 1 minute
      burstSize: RATE_LIMIT.REST.BURST_SIZE,
    });

    this.setupAxiosInterceptors();
    this.setupWebSocket();
  }

  public static getInstance(): PolygonService {
    if (!PolygonService.instance) {
      PolygonService.instance = new PolygonService();
    }
    return PolygonService.instance;
  }

  private setupAxiosInterceptors() {
    // Request interceptor for API key and rate limiting
    this.axiosInstance.interceptors.request.use(async (config) => {
      // Wait for rate limiter token
      await this.rateLimiter.waitForToken();

      // Add API key to query parameters
      const params = new URLSearchParams(config.params || {});
      params.append('apiKey', this.apiKey);
      config.params = params;

      return config;
    });

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<{ message?: string }>) => {
        if (!error.config) throw error;

        const endpoint = error.config.url || 'unknown';
        const retryCount = this.retryCount.get(endpoint) || 0;

        // Handle different error types
        if (error.response?.status === 429) {
          throw new RateLimitError('Rate limit exceeded');
        }

        if (error.response?.status === 401) {
          throw new AuthenticationError('Invalid API key');
        }

        // Determine if we should retry
        const shouldRetry = 
          retryCount < RETRY_CONFIG.MAX_RETRIES &&
          (error.response?.status === 503 || // Service unavailable
           error.response?.status === 504 || // Gateway timeout
           !error.response); // Network error

        if (shouldRetry) {
          this.retryCount.set(endpoint, retryCount + 1);
          const delay = Math.min(
            RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, retryCount),
            RETRY_CONFIG.MAX_DELAY
          );

          await new Promise(resolve => setTimeout(resolve, delay));
          return this.axiosInstance(error.config);
        }

        throw new PolygonError(
          `Polygon API error: ${error.response?.data?.message || error.message}`,
          error.response?.status
        );
      }
    );
  }

  private setupWebSocket() {
    this.webSocket.on('aggregate', (data: AggregateMessage) => {
      const subscribers = this.subscribers.get(data.sym);
      if (subscribers) {
        subscribers.forEach(callback => callback(data));
      }
    });

    this.webSocket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      // Notify all subscribers about the error
      this.subscribers.forEach(subscribers => {
        subscribers.forEach(callback => callback({ type: 'error', error }));
      });
    });

    this.webSocket.on('status', (status: string) => {
      // Notify all subscribers about the status change
      this.subscribers.forEach(subscribers => {
        subscribers.forEach(callback => callback({ type: 'status', status }));
      });
    });
  }

  public subscribe(symbol: string, callback: (data: any) => void) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      this.webSocket.subscribe(symbol);
    }
    this.subscribers.get(symbol)?.add(callback);
  }

  public unsubscribe(symbol: string, callback: (data: any) => void) {
    const subscribers = this.subscribers.get(symbol);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(symbol);
        this.webSocket.unsubscribe(symbol);
      }
    }
  }

  public connect() {
    this.webSocket.connect();
  }

  public disconnect() {
    this.webSocket.disconnect();
  }

  public isConnected(): boolean {
    return this.webSocket.isConnected();
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    try {
      const response = await this.axiosInstance.get(endpoint, { params });
      return response.data;
    } catch (error) {
      if (error instanceof PolygonError) {
        throw error;
      }
      throw new PolygonError('Unknown error occurred while fetching data');
    }
  }

  private async fetchWithCache<T>(
    endpoint: string,
    cacheKey: string,
    cachePrefix: keyof typeof CACHE_KEYS,
    params: Record<string, string> = {},
    options: {
      ttl?: number;
      tags?: string[];
      transform?: (data: unknown) => T;
    } = {}
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cachedData = await cacheManager.get<T>(cacheKey, cachePrefix);
      if (cachedData) {
        return cachedData;
      }

      // If not in cache, fetch from API
      const response = await this.fetch<unknown>(endpoint, params);

      // Transform data if transformer provided
      const data = options.transform ? options.transform(response) : (response as T);

      // Cache the result
      await cacheManager.set(cacheKey, data, cachePrefix, {
        ttl: options.ttl,
        source: 'rest',
        tags: options.tags,
      });

      return data;
    } catch (error) {
      if (error instanceof ValidationError) {
        // If validation fails, invalidate cache and throw
        await cacheManager.invalidate(cacheKey, cachePrefix);
      }
      throw error;
    }
  }

  async getAggregates(
    ticker: string,
    multiplier: number,
    timespan: string,
    from: string,
    to: string,
    adjusted: boolean = true
  ): Promise<AggregatesResponse> {
    const endpoint = `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`;
    const cacheKey = `${ticker}:${multiplier}:${timespan}:${from}:${to}:${adjusted}`;
    
    return this.fetchWithCache<AggregatesResponse>(
      endpoint,
      cacheKey,
      'AGGREGATE_DATA',
      { adjusted: adjusted.toString() },
      {
        ttl: 60000, // 1 minute cache for aggregates
        tags: ['aggregates', ticker],
        transform: (data) => AggregatesResponseSchema.parse(data),
      }
    );
  }

  async getSnapshots(tickers: string[]): Promise<SnapshotResponse> {
    // Split large requests into batches
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < tickers.length; i += batchSize) {
      const batch = tickers.slice(i, i + batchSize);
      const endpoint = `/v2/snapshot/locale/us/markets/stocks/tickers`;
      const cacheKey = `snapshot:${batch.join(',')}`;
      
      batches.push(
        this.fetchWithCache<unknown>(
          endpoint,
          cacheKey,
          'SNAPSHOT_DATA',
          { tickers: batch.join(',') },
          {
            ttl: 5000, // 5 seconds cache for snapshots
            tags: ['snapshots', ...batch],
          }
        )
      );
    }

    try {
      const responses = await Promise.all(batches);
      // Merge and validate responses
      const mergedResponse = responses.reduce((acc: SnapshotResponse, curr: any) => ({
        status: curr.status,
        tickers: [...acc.tickers, ...curr.tickers],
      }), { status: 'OK', tickers: [] });

      // Transform and validate each ticker in the response
      mergedResponse.tickers = mergedResponse.tickers.map(ticker => 
        DataTransformer.normalizeMarketData(ticker, 'polygon')
      );

      return mergedResponse;
    } catch (error) {
      if (error instanceof ValidationError) {
        // Invalidate all batch caches on validation error
        await Promise.all(
          tickers.map(ticker =>
            cacheManager.invalidateByTag(ticker)
          )
        );
      }
      throw error;
    }
  }

  async getSMA(
    ticker: string,
    timespan: string,
    window: number,
    from: string,
    to: string
  ): Promise<TechnicalIndicatorsResponse> {
    const endpoint = `/v1/indicators/sma/${ticker}`;
    return this.fetch<TechnicalIndicatorsResponse>(endpoint, {
      timespan,
      window: window.toString(),
      from,
      to,
    });
  }

  async getRSI(
    ticker: string,
    timespan: string,
    window: number,
    from: string,
    to: string
  ): Promise<TechnicalIndicatorsResponse> {
    const endpoint = `/v1/indicators/rsi/${ticker}`;
    return this.fetch<TechnicalIndicatorsResponse>(endpoint, {
      timespan,
      window: window.toString(),
      from,
      to,
    });
  }

  static formatDateRange(from: Date, to: Date): TimeRange {
    return { from, to };
  }

  // Get company details
  async getTickerDetails(ticker: string) {
    const endpoint = `/v3/reference/tickers/${ticker}`;
    return this.fetchWithCache(
      endpoint,
      ticker,
      'COMPANY_INFO',
      {},
      {
        ttl: 24 * 60 * 60 * 1000, // 24 hours cache for company info
        tags: ['company', ticker],
        transform: (data) => DataTransformer.validateCompanyInfo(data),
      }
    );
  }

  // Get real-time quotes
  async getLastQuote(ticker: string) {
    const url = `${this.baseUrl}/v2/last/nbbo/${ticker}`;
    return this.fetch<any>(url);
  }

  // Get market news
  async getMarketNews(ticker?: string, limit: number = 10) {
    const endpoint = `/v2/reference/news`;
    const cacheKey = `news:${ticker || 'market'}:${limit}`;
    
    return this.fetchWithCache(
      endpoint,
      cacheKey,
      'NEWS',
      {
        ...(ticker ? { ticker } : {}),
        limit: limit.toString(),
      },
      {
        ttl: 300000, // 5 minutes cache for news
        tags: ['news', ...(ticker ? [ticker] : [])],
        transform: (data) => {
          const items = (data as any).results || [];
          const { valid, errors } = DataTransformer.validateBatch(
            items,
            NewsItemSchema,
            { stopOnFirst: false }
          );
          if (errors.length > 0) {
            console.warn('Some news items failed validation:', errors);
          }
          return valid;
        },
      }
    );
  }

  // Get market status
  async getMarketStatus() {
    const url = `${this.baseUrl}/v1/marketstatus/now`;
    return this.fetch<any>(url);
  }

  // Search tickers
  async searchTickers(search: string, limit: number = 10) {
    const url = `${this.baseUrl}/v3/reference/tickers`;
    return this.fetch<any>(url, {
      search,
      limit: limit.toString(),
      active: 'true'
    });
  }

  // Helper method to reset retry count
  private resetRetryCount(endpoint: string) {
    this.retryCount.delete(endpoint);
  }

  // Helper method to check rate limit status
  public getRateLimitStatus() {
    return {
      remainingTokens: this.rateLimiter.getTokenCount(),
      isRateLimited: this.rateLimiter.getTokenCount() === 0,
    };
  }

  // Cache warming method
  async warmCache(symbols: string[]) {
    try {
      // Warm up snapshots
      await this.getSnapshots(symbols);

      // Warm up company info
      await Promise.all(
        symbols.map(symbol => this.getTickerDetails(symbol))
      );

      // Warm up news
      await this.getMarketNews();

      console.log('Cache warming completed successfully');
    } catch (error) {
      console.error('Error warming cache:', error);
      throw error;
    }
  }

  // Cache cleanup method
  async cleanupStaleData() {
    try {
      const stats = await cacheManager.getStats();
      console.log('Cache stats before cleanup:', stats);

      // Invalidate old news
      await cacheManager.invalidateByTag('news');

      // Invalidate stale market data
      const now = Date.now();
      const staleThreshold = 15 * 60 * 1000; // 15 minutes

      // Get all cached market data
      const marketData = await this.getAllCachedMarketData();
      
      // Invalidate stale entries
      await Promise.all(
        marketData
          .filter(entry => now - entry.lastUpdated > staleThreshold)
          .map(entry => cacheManager.invalidate(entry.symbol, 'MARKET_DATA'))
      );

      const newStats = await cacheManager.getStats();
      console.log('Cache stats after cleanup:', newStats);
    } catch (error) {
      console.error('Error cleaning up stale data:', error);
      throw error;
    }
  }

  private async getAllCachedMarketData(): Promise<Array<{ symbol: string; lastUpdated: number }>> {
    // Implementation would depend on your cache manager's capabilities
    // This is a placeholder that would need to be implemented based on your specific needs
    return [];
  }
}

export const polygonService = PolygonService.getInstance(); 