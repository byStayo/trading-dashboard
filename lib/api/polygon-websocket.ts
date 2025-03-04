// Custom EventEmitter implementation for browser
class BrowserEventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, listener: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  off(event: string, listener: Function): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

import { WebSocketMessage, TradeMessage, QuoteMessage, AggregateMessage } from '@/types/polygon';
import { logger } from '@/lib/utils/logger';

interface PolygonEvents {
  'quote': (quote: QuoteMessage) => void;
  'trade': (trade: TradeMessage) => void;
  'aggregate': (agg: AggregateMessage) => void;
  'error': (error: Error) => void;
  'max_reconnects': () => void;
  'status': (status: string) => void;
}

// WebSocket connection states
enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  AUTHENTICATING = 'AUTHENTICATING',
  AUTHENTICATED = 'AUTHENTICATED',
  RECONNECTING = 'RECONNECTING',
}

// WebSocket configuration
const WS_CONFIG = {
  INITIAL_RECONNECT_DELAY: 1000,
  MAX_RECONNECT_DELAY: 30000,
  RECONNECT_BACKOFF_MULTIPLIER: 1.5,
  MAX_RECONNECT_ATTEMPTS: 10,
  PING_INTERVAL: 15000,
  SUBSCRIPTION_BATCH_SIZE: 20,
  SUBSCRIPTION_BATCH_DELAY: 500,
};

export class PolygonWebSocket extends BrowserEventEmitter {
  private static instance: PolygonWebSocket | null = null;
  private static isInitializing: boolean = false;
  private static activeConnections: number = 0;
  private static readonly MAX_CONNECTIONS = 1;
  private static connectionQueue: (() => void)[] = [];
  private static isProcessingQueue: boolean = false;

  private ws: WebSocket | null = null;
  private apiKey: string = '';
  private subscriptions: Set<string> = new Set();
  private pendingSubscriptions: Set<string> = new Set();
  private reconnectAttempts: number = 0;
  private reconnectDelay: number = WS_CONFIG.INITIAL_RECONNECT_DELAY;
  private pingInterval: NodeJS.Timeout | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private messageQueue: { action: string, params: string }[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private wsUrl: string = 'wss://delayed.polygon.io/stocks';
  private lastMessageTime: number = Date.now();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscriptionBacklog: Set<string> = new Set();
  private connectionPromise: Promise<void> | null = null;

  constructor(apiKey?: string) {
    if (PolygonWebSocket.instance) {
      logger.warn('Returning existing PolygonWebSocket instance');
      return PolygonWebSocket.instance;
    }
    super();
    PolygonWebSocket.instance = this;
    if (!PolygonWebSocket.isInitializing) {
      this.initializeConnection();
    }
  }

  public static getInstance(): PolygonWebSocket {
    if (!PolygonWebSocket.instance) {
      PolygonWebSocket.isInitializing = true;
      PolygonWebSocket.instance = new PolygonWebSocket();
      PolygonWebSocket.isInitializing = false;
    }
    return PolygonWebSocket.instance;
  }

  private async initializeConnection() {
    if (this.connectionState !== ConnectionState.DISCONNECTED) {
      logger.warn(`Attempting to initialize while in ${this.connectionState} state`);
      return;
    }

    if (PolygonWebSocket.activeConnections >= PolygonWebSocket.MAX_CONNECTIONS) {
      return new Promise<void>((resolve) => {
        PolygonWebSocket.connectionQueue.push(resolve);
      });
    }

    try {
      PolygonWebSocket.activeConnections++;
      logger.info('Initializing WebSocket connection');
      
      // Use window.location.origin instead of hardcoded localhost
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/polygon-stocks/websocket`);
      
      if (!response.ok) {
        logger.error(`WebSocket initialization failed with status: ${response.status}`);
        throw new Error('Failed to get WebSocket authentication');
      }
      const { token, wsUrl } = await response.json();
      this.apiKey = token;
      if (wsUrl) {
        this.wsUrl = wsUrl;
      }
      logger.info(`WebSocket initialized with URL: ${this.wsUrl}`);
      await this.connect();
    } catch (error) {
      logger.error('Failed to initialize WebSocket connection:', error);
      this.emit('error', new Error('WebSocket initialization failed'));
      PolygonWebSocket.activeConnections--;
      this.processConnectionQueue();
    }
  }

  private async processConnectionQueue() {
    if (PolygonWebSocket.isProcessingQueue) return;
    PolygonWebSocket.isProcessingQueue = true;

    while (PolygonWebSocket.connectionQueue.length > 0 && 
           PolygonWebSocket.activeConnections < PolygonWebSocket.MAX_CONNECTIONS) {
      const nextConnection = PolygonWebSocket.connectionQueue.shift();
      if (nextConnection) {
        await this.initializeConnection();
        nextConnection();
      }
    }

    PolygonWebSocket.isProcessingQueue = false;
  }

  private async connect() {
    if (this.connectionState !== ConnectionState.DISCONNECTED) {
      logger.warn(`Attempting to connect while in ${this.connectionState} state`);
      return;
    }

    if (!this.apiKey) {
      this.emit('error', new Error('Polygon API key is not set'));
      return;
    }

    try {
      this.connectionState = ConnectionState.CONNECTING;
      this.ws = new WebSocket(this.wsUrl);

      this.connectionPromise = new Promise((resolve, reject) => {
        if (!this.ws) return reject(new Error('WebSocket not initialized'));

        this.ws.onopen = () => {
          logger.info('WebSocket connected');
          this.connectionState = ConnectionState.CONNECTED;
          this.authenticate();
          this.emit('status', 'connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.lastMessageTime = Date.now();
          try {
            const messages: WebSocketMessage[] = JSON.parse(event.data);
            messages.forEach(msg => this.handleMessage(msg));
          } catch (error) {
            logger.error('Error parsing WebSocket message:', error);
            this.emit('error', new Error('Failed to parse WebSocket message'));
          }
        };

        this.ws.onclose = (event) => {
          logger.info(`WebSocket disconnected: ${event.code} ${event.reason}`);
          this.handleDisconnect();
          reject(new Error('WebSocket closed'));
        };

        this.ws.onerror = (error) => {
          logger.error('WebSocket error:', error);
          this.emit('error', new Error('WebSocket connection error'));
          this.handleDisconnect();
          reject(error);
        };
      });

      await this.connectionPromise;
      this.setupHeartbeat();
    } catch (error) {
      logger.error('Error creating WebSocket:', error);
      this.emit('error', new Error('Failed to create WebSocket connection'));
      this.handleDisconnect();
    }
  }

  private setupHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (Date.now() - this.lastMessageTime > WS_CONFIG.PING_INTERVAL * 2) {
        console.log('No messages received recently, reconnecting...');
        this.handleDisconnect();
      }
    }, WS_CONFIG.PING_INTERVAL);
  }

  private handleDisconnect() {
    logger.info(`Handling disconnect. Current state: ${this.connectionState}, Reconnect attempts: ${this.reconnectAttempts}`);
    this.cleanup();
    this.connectionState = ConnectionState.DISCONNECTED;
    this.emit('status', 'disconnected');
    PolygonWebSocket.activeConnections--;

    // Save current subscriptions to backlog
    this.subscriptionBacklog = new Set([...this.subscriptions, ...this.pendingSubscriptions]);
    logger.debug(`Saved ${this.subscriptionBacklog.size} subscriptions to backlog`);
    this.subscriptions.clear();
    this.pendingSubscriptions.clear();

    this.attemptReconnect();
    this.processConnectionQueue();
  }

  private attemptReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      this.emit('max_reconnects');
      return;
    }

    this.connectionState = ConnectionState.RECONNECTING;
    this.reconnectAttempts++;
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting reconnection ${this.reconnectAttempts}/${WS_CONFIG.MAX_RECONNECT_ATTEMPTS}`);
      this.connect();
      this.reconnectDelay = Math.min(
        this.reconnectDelay * WS_CONFIG.RECONNECT_BACKOFF_MULTIPLIER,
        WS_CONFIG.MAX_RECONNECT_DELAY
      );
    }, this.reconnectDelay);
  }

  private authenticate() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.connectionState = ConnectionState.AUTHENTICATING;
      this.ws.send(JSON.stringify({
        action: 'auth',
        params: this.apiKey
      }));
    }
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.ev) {
      case 'status':
        this.handleStatus(message);
        break;
      case 'T':
        this.emit('trade', message as TradeMessage);
        break;
      case 'Q':
        this.emit('quote', message as QuoteMessage);
        break;
      case 'AM':
        this.emit('aggregate', message as AggregateMessage);
        break;
      default:
        console.log('Unhandled message type:', message.ev);
    }
  }

  private handleStatus(message: any) {
    logger.info(`Received status message: ${JSON.stringify(message)}`);
    if (message.status === 'auth_success') {
      logger.info('Authentication successful');
      this.connectionState = ConnectionState.AUTHENTICATED;
      this.emit('status', 'authenticated');
      this.reconnectAttempts = 0;
      this.reconnectDelay = WS_CONFIG.INITIAL_RECONNECT_DELAY;
      this.resubscribeAll();
    } else if (message.status === 'auth_failed') {
      logger.error(`Authentication failed: ${message.message}`);
      this.emit('error', new Error(`Authentication failed: ${message.message}`));
      this.handleDisconnect();
    }
  }

  private resubscribeAll() {
    if (this.subscriptionBacklog.size > 0) {
      const symbols = Array.from(this.subscriptionBacklog);
      this.subscriptionBacklog.clear();
      this.subscribe(symbols);
    }
  }

  subscribe(symbols: string | string[]) {
    const symbolList = Array.isArray(symbols) ? symbols : [symbols];
    let hasNewSubscriptions = false;

    symbolList.forEach(symbol => {
      ['AM', 'T', 'Q'].forEach(channel => {
        const sub = `${channel}.${symbol}`;
        if (!this.subscriptions.has(sub)) {
          this.pendingSubscriptions.add(sub);
          hasNewSubscriptions = true;
        }
      });
    });

    if (hasNewSubscriptions) {
      this.batchSubscribe();
    }
  }

  private batchSubscribe() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      if (this.pendingSubscriptions.size > 0) {
        logger.info(`Processing batch subscription for ${this.pendingSubscriptions.size} symbols`);
        const pendingSubs = Array.from(this.pendingSubscriptions);
        
        // Process subscriptions in batches
        for (let i = 0; i < pendingSubs.length; i += WS_CONFIG.SUBSCRIPTION_BATCH_SIZE) {
          const batch = pendingSubs.slice(i, i + WS_CONFIG.SUBSCRIPTION_BATCH_SIZE);
          
          setTimeout(() => {
            if (this.connectionState === ConnectionState.AUTHENTICATED) {
              logger.debug(`Sending subscription batch ${Math.floor(i / WS_CONFIG.SUBSCRIPTION_BATCH_SIZE) + 1}, size: ${batch.length}`);
              this.messageQueue.push({
                action: 'subscribe',
                params: batch.join(',')
              });
              batch.forEach(sub => {
                this.pendingSubscriptions.delete(sub);
                this.subscriptions.add(sub);
              });
              logger.debug(`Message queue size after batch: ${this.messageQueue.length}`);
              this.processMessageQueue();
            } else {
              logger.warn(`Attempted to subscribe while not authenticated. Current state: ${this.connectionState}`);
            }
          }, Math.floor(i / WS_CONFIG.SUBSCRIPTION_BATCH_SIZE) * WS_CONFIG.SUBSCRIPTION_BATCH_DELAY);
        }
      }
    }, 100);
  }

  private processMessageQueue() {
    const queueSize = this.messageQueue.length;
    if (queueSize > 0) {
      logger.debug(`Processing message queue, size: ${queueSize}`);
    }

    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        logger.debug(`Sending message: ${JSON.stringify(message)}`);
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  unsubscribe(symbols: string | string[]) {
    const symbolList = Array.isArray(symbols) ? symbols : [symbols];
    const unsubList: string[] = [];

    symbolList.forEach(symbol => {
      ['AM', 'T', 'Q'].forEach(channel => {
        const sub = `${channel}.${symbol}`;
        if (this.subscriptions.has(sub)) {
          this.subscriptions.delete(sub);
          unsubList.push(sub);
        }
      });
    });

    if (unsubList.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'unsubscribe',
        params: unsubList.join(',')
      }));
    }
  }

  private cleanup() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      this.ws = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  disconnect() {
    this.cleanup();
    this.connectionState = ConnectionState.DISCONNECTED;
    this.subscriptions.clear();
    this.pendingSubscriptions.clear();
    this.subscriptionBacklog.clear();
    this.messageQueue = [];
    this.reconnectAttempts = 0;
    this.reconnectDelay = WS_CONFIG.INITIAL_RECONNECT_DELAY;
    PolygonWebSocket.activeConnections--;
    this.processConnectionQueue();
  }
}

// Export singleton instance
export const polygonWebSocket = PolygonWebSocket.getInstance(); 