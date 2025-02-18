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

  constructor(apiKey?: string) {
    super();
    this.initializeConnection();
  }

  private async initializeConnection() {
    try {
      const response = await fetch('http://localhost:3000/api/polygon-stocks/websocket');
      if (!response.ok) {
        throw new Error('Failed to get WebSocket authentication');
      }
      const { token, wsUrl } = await response.json();
      this.apiKey = token;
      if (wsUrl) {
        this.wsUrl = wsUrl;
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
      this.emit('error', new Error('WebSocket initialization failed'));
    }
  }

  isConnected(): boolean {
    return this.connectionState === ConnectionState.AUTHENTICATED;
  }

  connect() {
    if (this.connectionState !== ConnectionState.DISCONNECTED) return;

    if (!this.apiKey) {
      this.emit('error', new Error('Polygon API key is not set'));
      return;
    }

    try {
      this.connectionState = ConnectionState.CONNECTING;
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.connectionState = ConnectionState.CONNECTED;
        this.authenticate();
        this.emit('status', 'connected');
      };

      this.ws.onmessage = (event) => {
        this.lastMessageTime = Date.now();
        try {
          const messages: WebSocketMessage[] = JSON.parse(event.data);
          messages.forEach(msg => this.handleMessage(msg));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.emit('error', new Error('Failed to parse WebSocket message'));
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.handleDisconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', new Error('WebSocket connection error'));
        this.handleDisconnect();
      };

      this.setupHeartbeat();
    } catch (error) {
      console.error('Error creating WebSocket:', error);
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
    this.cleanup();
    this.connectionState = ConnectionState.DISCONNECTED;
    this.emit('status', 'disconnected');

    // Save current subscriptions to backlog
    this.subscriptionBacklog = new Set([...this.subscriptions, ...this.pendingSubscriptions]);
    this.subscriptions.clear();
    this.pendingSubscriptions.clear();

    this.attemptReconnect();
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
    if (message.status === 'auth_success') {
      console.log('Authentication successful');
      this.connectionState = ConnectionState.AUTHENTICATED;
      this.emit('status', 'authenticated');
      this.reconnectAttempts = 0;
      this.reconnectDelay = WS_CONFIG.INITIAL_RECONNECT_DELAY;
      this.resubscribeAll();
    } else if (message.status === 'auth_failed') {
      console.error('Authentication failed:', message.message);
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
        const pendingSubs = Array.from(this.pendingSubscriptions);
        
        // Process subscriptions in batches
        for (let i = 0; i < pendingSubs.length; i += WS_CONFIG.SUBSCRIPTION_BATCH_SIZE) {
          const batch = pendingSubs.slice(i, i + WS_CONFIG.SUBSCRIPTION_BATCH_SIZE);
          
          setTimeout(() => {
            if (this.connectionState === ConnectionState.AUTHENTICATED) {
              this.messageQueue.push({
                action: 'subscribe',
                params: batch.join(',')
              });
              batch.forEach(sub => {
                this.pendingSubscriptions.delete(sub);
                this.subscriptions.add(sub);
              });
              this.processMessageQueue();
            }
          }, Math.floor(i / WS_CONFIG.SUBSCRIPTION_BATCH_SIZE) * WS_CONFIG.SUBSCRIPTION_BATCH_DELAY);
        }
      }
    }, 100);
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
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
  }
}

// Export singleton instance
export const polygonWebSocket = new PolygonWebSocket(); 