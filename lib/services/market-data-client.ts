import { CacheManager } from '../utils/cache-manager';
import { RateLimiter } from './rate-limiter';
import { metrics } from '../utils/metrics';
import { logger } from '../utils/logger';
import { debounce } from 'lodash';
import { MarketDataSchema } from '../utils/data-validator';

export class MarketDataClient {
  private static instance: MarketDataClient;
  private rateLimiter: RateLimiter;
  private cacheManager: CacheManager;
  private subscriptions: Map<string, Set<string>> = new Map();
  private pendingSubscriptions: Set<string> = new Set();
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly INITIAL_BACKOFF = 1000;
  private readonly MAX_BACKOFF = 30000;
  private readonly BACKOFF_MULTIPLIER = 2;

  private constructor() {
    this.rateLimiter = RateLimiter.getInstance();
    this.cacheManager = CacheManager.getInstance();
    this.setupMetrics();
    this.processPendingSubscriptionsImpl = this.processPendingSubscriptionsImpl.bind(this);
    const debouncedFn = debounce(async () => {
      await this.processPendingSubscriptionsImpl();
    }, 100);
    this.processPendingSubscriptions = () => {
      debouncedFn();
      return Promise.resolve();
    };
  }

  static getInstance(): MarketDataClient {
    if (!MarketDataClient.instance) {
      MarketDataClient.instance = new MarketDataClient();
    }
    return MarketDataClient.instance;
  }

  private setupMetrics(): void {
    metrics.register({
      name: 'market_data_subscriptions',
      help: 'Number of active market data subscriptions',
      type: 'gauge',
      labels: ['action', 'type']
    });
    metrics.register({
      name: 'market_data_cache_hits',
      help: 'Number of market data cache hits',
      type: 'counter',
      labels: ['source', 'type']
    });
    metrics.register({
      name: 'market_data_cache_misses',
      help: 'Number of market data cache misses',
      type: 'counter',
      labels: ['source', 'type']
    });
    metrics.register({
      name: 'market_data_ws_reconnects',
      help: 'Number of WebSocket reconnection attempts',
      type: 'counter',
      labels: ['status', 'type']
    });
    metrics.register({
      name: 'market_data_ws_errors',
      help: 'Number of WebSocket errors',
      type: 'counter',
      labels: ['type', 'status']
    });
  }

  async subscribe(symbol: string, clientId: string): Promise<void> {
    try {
      // Check rate limit
      await this.rateLimiter.consume(clientId, 'API');

      // Add to subscriptions map
      if (!this.subscriptions.has(symbol)) {
        this.subscriptions.set(symbol, new Set());
      }
      this.subscriptions.get(symbol)?.add(clientId);

      // Add to pending subscriptions
      this.pendingSubscriptions.add(symbol);

      // Process pending subscriptions (debounced)
      this.processPendingSubscriptions();

      // Update metrics
      metrics.record('market_data_subscriptions', this.subscriptions.size, { action: 'subscribe', type: 'market_data' });

    } catch (error) {
      logger.error(`Error subscribing to ${symbol}:`, error);
      throw error;
    }
  }

  private processPendingSubscriptions: () => Promise<void>;

  private async processPendingSubscriptionsImpl(): Promise<void> {
    if (this.pendingSubscriptions.size === 0) return;

    try {
      const symbols = Array.from(this.pendingSubscriptions);
      
      // Clear pending subscriptions
      this.pendingSubscriptions.clear();

      // Ensure WebSocket connection
      await this.ensureWebSocketConnection();

      // Get cached data first
      for (const symbol of symbols) {
        const cachedData = await this.cacheManager.get(`market_data:${symbol}`, 'MARKET_DATA');
        if (cachedData) {
          this.handleMarketData(cachedData);
          metrics.record('market_data_cache_hits', 1, { source: 'cache', type: 'market_data' });
        } else {
          metrics.record('market_data_cache_misses', 1, { source: 'cache', type: 'market_data' });
        }
      }

      // Subscribe via WebSocket
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        this.wsConnection.send(JSON.stringify({
          action: 'subscribe',
          symbols
        }));
      }

    } catch (error) {
      logger.error('Error processing pending subscriptions:', error);
      throw error;
    }
  }

  private async ensureWebSocketConnection(): Promise<void> {
    if (this.wsConnection?.readyState === WebSocket.OPEN) return;

    try {
      // Get WebSocket URL and token
      const response = await fetch('/api/polygon-stocks/websocket');
      const { wsUrl, token } = await response.json();

      // Create WebSocket connection
      this.wsConnection = new WebSocket(`${wsUrl}?token=${token}`);
      
      this.wsConnection.onmessage = this.handleWebSocketMessage.bind(this);
      this.wsConnection.onerror = this.handleWebSocketError.bind(this);
      this.wsConnection.onclose = this.handleWebSocketClose.bind(this);

      // Reset reconnect attempts on successful connection
      this.wsConnection.onopen = () => {
        this.reconnectAttempts = 0;
        metrics.record('market_data_ws_reconnects', 1, { status: 'success', type: 'connection' });
      };

    } catch (error) {
      logger.error('Error establishing WebSocket connection:', error);
      this.handleWebSocketError(error as Event);
    }
  }

  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      // Validate data
      const validatedData = MarketDataSchema.parse(data);

      // Cache the data
      this.cacheManager.set(
        `market_data:${validatedData.symbol}`,
        validatedData,
        'MARKET_DATA',
        {
          ttl: 60000, // 1 minute
          tags: ['market_data', validatedData.symbol]
        }
      );

      // Emit to subscribers
      this.handleMarketData(validatedData);

    } catch (error) {
      logger.error('Error handling WebSocket message:', error);
    }
  }

  private handleMarketData(data: any): void {
    const subscribers = this.subscriptions.get(data.symbol);
    if (!subscribers) return;

    // Emit to all subscribers
    subscribers.forEach(clientId => {
      // Emit event to client (implementation depends on your event system)
      this.emit('marketData', clientId, data);
    });
  }

  private handleWebSocketError(error: Event): void {
    logger.error('WebSocket error:', error);
    metrics.record('market_data_ws_errors', 1, { type: 'websocket', status: 'error' });
  }

  private handleWebSocketClose(event: CloseEvent): void {
    logger.warn('WebSocket closed:', event);

    // Attempt to reconnect with exponential backoff
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      const backoff = Math.min(
        this.INITIAL_BACKOFF * Math.pow(this.BACKOFF_MULTIPLIER, this.reconnectAttempts),
        this.MAX_BACKOFF
      );

      this.reconnectAttempts++;
      metrics.record('market_data_ws_reconnects', 1, { status: 'reconnecting', type: 'connection' });

      setTimeout(() => {
        this.ensureWebSocketConnection();
      }, backoff);
    } else {
      logger.error('Max reconnection attempts reached');
      metrics.record('market_data_ws_reconnects', 1, { status: 'failed', type: 'connection' });
    }
  }

  private emit(event: string, clientId: string, data: any): void {
    // Implementation depends on your event system
    // This could be WebSocket, Server-Sent Events, or another mechanism
  }

  async unsubscribe(symbol: string, clientId: string): Promise<void> {
    try {
      const subscribers = this.subscriptions.get(symbol);
      if (!subscribers) return;

      subscribers.delete(clientId);

      if (subscribers.size === 0) {
        this.subscriptions.delete(symbol);
        
        // Unsubscribe from WebSocket
        if (this.wsConnection?.readyState === WebSocket.OPEN) {
          this.wsConnection.send(JSON.stringify({
            action: 'unsubscribe',
            symbols: [symbol]
          }));
        }

        // Invalidate cache
        await this.cacheManager.invalidateByTag(symbol);
      }

      // Update metrics
      metrics.record('market_data_subscriptions', this.subscriptions.size, { action: 'unsubscribe', type: 'market_data' });

    } catch (error) {
      logger.error(`Error unsubscribing from ${symbol}:`, error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      // Close WebSocket connection
      if (this.wsConnection) {
        this.wsConnection.close();
        this.wsConnection = null;
      }

      // Clear all subscriptions
      this.subscriptions.clear();
      this.pendingSubscriptions.clear();

      // Reset reconnect attempts
      this.reconnectAttempts = 0;

      // Update metrics
      metrics.record('market_data_subscriptions', 0, { action: 'cleanup', type: 'market_data' });
      metrics.record('market_data_ws_reconnects', 1, { status: 'cleanup', type: 'connection' });

    } catch (error) {
      logger.error('Error during cleanup:', error);
      throw error;
    }
  }
}

export const marketDataClient = MarketDataClient.getInstance(); 