import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { dataValidationService } from './data-validation-service';

interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  maxRetries?: number;
  retryDelay?: number;
  maxQueueSize?: number;
  batchSize?: number;
  batchInterval?: number;
}

interface WebSocketMessage {
  type: 'trade' | 'quote' | 'aggregate';
  data: unknown;
  timestamp: number;
}

interface WebSocketStats {
  connected: boolean;
  messageCount: number;
  errorCount: number;
  reconnectCount: number;
  queueSize: number;
  lastMessageTime?: number;
  uptime: number;
}

const DEFAULT_CONFIG = {
  maxRetries: 5,
  retryDelay: 1000,
  maxQueueSize: 10000,
  batchSize: 100,
  batchInterval: 100,
} as const;

class WebSocketService extends EventEmitter {
  private static instance: WebSocketService;
  private connections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();
  private messageQueues: Map<string, WebSocketMessage[]> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private batchTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private stats: Map<string, WebSocketStats> = new Map();
  private pingIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    super();
    this.setupMetrics();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private setupMetrics() {
    metrics.register({
      name: 'websocket_connections',
      help: 'Number of active WebSocket connections',
      type: 'gauge',
    });

    metrics.register({
      name: 'websocket_messages',
      help: 'Number of WebSocket messages',
      type: 'counter',
      labels: ['type', 'status'],
    });

    metrics.register({
      name: 'websocket_errors',
      help: 'Number of WebSocket errors',
      type: 'counter',
      labels: ['type'],
    });

    metrics.register({
      name: 'websocket_queue_size',
      help: 'Size of message queues',
      type: 'gauge',
      labels: ['connection'],
    });
  }

  async connect(url: string, config: Partial<WebSocketConfig> = {}): Promise<void> {
    const fullConfig = { ...DEFAULT_CONFIG, ...config, url };
    
    if (this.connections.has(url)) {
      logger.warn(`WebSocket connection to ${url} already exists`);
      return;
    }

    try {
      const ws = new WebSocket(url, fullConfig.protocols);
      this.setupWebSocket(url, ws, fullConfig);
      this.connections.set(url, ws);
      this.messageQueues.set(url, []);
      this.subscriptions.set(url, new Set());
      this.initializeStats(url);

      metrics.record('websocket_connections', this.connections.size);
    } catch (error) {
      logger.error(`Error connecting to WebSocket ${url}:`, error);
      metrics.record('websocket_errors', 1, { type: 'connection' });
      throw error;
    }
  }

  private setupWebSocket(url: string, ws: WebSocket, config: WebSocketConfig) {
    ws.onopen = () => {
      logger.info(`WebSocket connected to ${url}`);
      this.retryAttempts.set(url, 0);
      this.updateStats(url, { connected: true });
      this.setupPingInterval(url, ws);
      this.emit('connect', url);
    };

    ws.onmessage = async (event) => {
      try {
        const rawMessage = JSON.parse(event.data);
        const validatedMessage = await dataValidationService.validateWebSocketMessage({
          ...rawMessage,
          data: rawMessage.data || null, // Ensure data is never undefined
        });
        
        this.queueMessage(url, validatedMessage);
        this.updateStats(url, {
          messageCount: (this.stats.get(url)?.messageCount || 0) + 1,
          lastMessageTime: Date.now(),
        });

        metrics.record('websocket_messages', 1, {
          type: validatedMessage.type,
          status: 'success',
        });
      } catch (error) {
        logger.error(`Error processing WebSocket message from ${url}:`, error);
        metrics.record('websocket_messages', 1, { type: 'error', status: 'error' });
      }
    };

    ws.onerror = (error) => {
      logger.error(`WebSocket error for ${url}:`, error);
      this.updateStats(url, {
        errorCount: (this.stats.get(url)?.errorCount || 0) + 1,
      });
      metrics.record('websocket_errors', 1, { type: 'websocket' });
      this.emit('error', { url, error });
    };

    ws.onclose = () => {
      logger.warn(`WebSocket connection to ${url} closed`);
      this.updateStats(url, { connected: false });
      this.clearPingInterval(url);
      this.emit('close', url);
      this.handleReconnect(url, config);
    };
  }

  private queueMessage(url: string, message: WebSocketMessage & { data: unknown }) {
    const queue = this.messageQueues.get(url);
    if (!queue) return;

    queue.push(message);
    metrics.record('websocket_queue_size', queue.length, { connection: url });

    // Trim queue if it exceeds max size
    const maxSize = DEFAULT_CONFIG.maxQueueSize;
    if (queue.length > maxSize) {
      queue.splice(0, queue.length - maxSize);
    }

    this.scheduleBatchProcessing(url);
  }

  private scheduleBatchProcessing(url: string) {
    const existingTimeout = this.batchTimeouts.get(url);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      this.processBatch(url);
      this.batchTimeouts.delete(url);
    }, DEFAULT_CONFIG.batchInterval);

    this.batchTimeouts.set(url, timeout);
  }

  private processBatch(url: string) {
    const queue = this.messageQueues.get(url);
    if (!queue || queue.length === 0) return;

    const batch = queue.splice(0, DEFAULT_CONFIG.batchSize);
    this.emit('messages', { url, messages: batch });
    metrics.record('websocket_queue_size', queue.length, { connection: url });
  }

  private handleReconnect(url: string, config: WebSocketConfig) {
    const attempts = (this.retryAttempts.get(url) || 0) + 1;
    this.retryAttempts.set(url, attempts);

    if (attempts <= (config.maxRetries || DEFAULT_CONFIG.maxRetries)) {
      const delay = Math.min(
        (config.retryDelay || DEFAULT_CONFIG.retryDelay) * Math.pow(2, attempts - 1),
        30000
      );

      logger.info(`Attempting to reconnect to ${url} in ${delay}ms (attempt ${attempts})`);
      
      setTimeout(() => {
        this.connect(url, config).catch(error => {
          logger.error(`Reconnection attempt to ${url} failed:`, error);
        });
      }, delay);

      this.updateStats(url, {
        reconnectCount: (this.stats.get(url)?.reconnectCount || 0) + 1,
      });
    } else {
      logger.error(`Max reconnection attempts reached for ${url}`);
      this.emit('maxReconnects', url);
    }
  }

  private setupPingInterval(url: string, ws: WebSocket) {
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    this.pingIntervals.set(url, interval);
  }

  private clearPingInterval(url: string) {
    const interval = this.pingIntervals.get(url);
    if (interval) {
      clearInterval(interval);
      this.pingIntervals.delete(url);
    }
  }

  private initializeStats(url: string) {
    this.stats.set(url, {
      connected: false,
      messageCount: 0,
      errorCount: 0,
      reconnectCount: 0,
      queueSize: 0,
      uptime: 0,
    });
  }

  private updateStats(url: string, update: Partial<WebSocketStats>) {
    const current = this.stats.get(url);
    if (current) {
      this.stats.set(url, { ...current, ...update });
    }
  }

  subscribe(url: string, channel: string): void {
    const ws = this.connections.get(url);
    const subs = this.subscriptions.get(url);
    
    if (!ws || !subs) {
      throw new Error(`No WebSocket connection found for ${url}`);
    }

    if (ws.readyState === WebSocket.OPEN && !subs.has(channel)) {
      ws.send(JSON.stringify({ type: 'subscribe', channel }));
      subs.add(channel);
    }
  }

  unsubscribe(url: string, channel: string): void {
    const ws = this.connections.get(url);
    const subs = this.subscriptions.get(url);
    
    if (!ws || !subs) {
      throw new Error(`No WebSocket connection found for ${url}`);
    }

    if (ws.readyState === WebSocket.OPEN && subs.has(channel)) {
      ws.send(JSON.stringify({ type: 'unsubscribe', channel }));
      subs.delete(channel);
    }
  }

  disconnect(url: string): void {
    const ws = this.connections.get(url);
    if (ws) {
      ws.close();
      this.connections.delete(url);
      this.subscriptions.delete(url);
      this.messageQueues.delete(url);
      this.retryAttempts.delete(url);
      this.clearPingInterval(url);
      this.stats.delete(url);

      metrics.record('websocket_connections', this.connections.size);
    }
  }

  disconnectAll(): void {
    for (const url of this.connections.keys()) {
      this.disconnect(url);
    }
  }

  getStats(url: string): WebSocketStats | undefined {
    return this.stats.get(url);
  }

  getAllStats(): Map<string, WebSocketStats> {
    return new Map(this.stats);
  }
}

export const webSocketService = WebSocketService.getInstance(); 