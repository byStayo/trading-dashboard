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
}

export class PolygonWebSocket extends BrowserEventEmitter {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private subscriptions: Set<string> = new Set();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private pingInterval: number | null = null;

  constructor() {
    super();
    this.apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY || '';
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket('wss://delayed.polygon.io/stocks');

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.authenticate();
      this.resetReconnectAttempts();
      this.setupPing();
    };

    this.ws.onmessage = (event) => {
      try {
        const messages: WebSocketMessage[] = JSON.parse(event.data);
        messages.forEach(msg => this.handleMessage(msg));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.cleanup();
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.cleanup();
      this.emit('error', new Error('WebSocket connection error'));
    };
  }

  private authenticate() {
    if (this.ws?.readyState === WebSocket.OPEN) {
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
      this.resubscribe();
    } else if (message.status === 'auth_failed') {
      console.error('Authentication failed:', message.message);
    }
  }

  subscribe(symbols: string | string[]) {
    const symbolList = Array.isArray(symbols) ? symbols : [symbols];
    symbolList.forEach(symbol => {
      ['T', 'Q', 'AM'].forEach(channel => {
        const sub = `${channel}.${symbol}`;
        this.subscriptions.add(sub);
      });
    });

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        params: Array.from(this.subscriptions).join(',')
      }));
    }
  }

  unsubscribe(symbols: string | string[]) {
    const symbolList = Array.isArray(symbols) ? symbols : [symbols];
    symbolList.forEach(symbol => {
      ['T', 'Q', 'AM'].forEach(channel => {
        const sub = `${channel}.${symbol}`;
        this.subscriptions.delete(sub);
      });
    });

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'unsubscribe',
        params: symbolList.map(sym => `T.${sym},Q.${sym},AM.${sym}`).join(',')
      }));
    }
  }

  private resubscribe() {
    if (this.subscriptions.size > 0) {
      this.ws?.send(JSON.stringify({
        action: 'subscribe',
        params: Array.from(this.subscriptions).join(',')
      }));
    }
  }

  private resetReconnectAttempts() {
    this.reconnectAttempts = 0;
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connect(), delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnects');
    }
  }

  private setupPing() {
    this.pingInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, 30000);
  }

  private cleanup() {
    if (this.pingInterval) {
      window.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  disconnect() {
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export singleton instance
export const polygonWebSocket = new PolygonWebSocket(); 