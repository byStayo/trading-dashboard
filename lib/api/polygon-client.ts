import { WebSocketMessage, TradeMessage, QuoteMessage, AggregateMessage } from '@/types/polygon';

class PolygonClient {
  private static instance: PolygonClient | null = null;
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private pingInterval: number | null = null;
  private wsUrl: string = 'wss://delayed.polygon.io/stocks';

  private constructor() {
    // Empty constructor
  }

  public static getInstance(): PolygonClient {
    if (typeof window === 'undefined') {
      // Create a proper dummy instance during SSR
      const dummy = new PolygonClient();
      dummy.connected = false;
      return dummy;
    }
    
    if (!PolygonClient.instance) {
      PolygonClient.instance = new PolygonClient();
    }
    return PolygonClient.instance;
  }

  private async initializeWebSocket() {
    try {
      // Get WebSocket authentication details from our server
      const response = await fetch(window.location.origin + '/api/polygon-stocks/websocket');
      if (!response.ok) {
        throw new Error('Failed to get WebSocket authentication');
      }
      const { token, wsUrl } = await response.json();

      // Use the provided wsUrl or fall back to default
      this.wsUrl = wsUrl || this.wsUrl;
      this.ws = new WebSocket(this.wsUrl);
      
      this.setupWebSocketHandlers(token);
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.emit('error', new Error('WebSocket initialization failed'));
    }
  }

  private setupWebSocketHandlers(token: string) {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.connected = true;
      this.authenticate(token);
      this.resetReconnectAttempts();
      this.setupPing();
      this.emit('status', 'connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const messages = JSON.parse(event.data);
        // Handle both single messages and arrays of messages
        const messageArray = Array.isArray(messages) ? messages : [messages];
        messageArray.forEach(msg => {
          if (msg.ev === 'status') {
            this.handleStatus(msg);
          } else {
            this.handleMessage(msg);
          }
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected', event.code, event.reason);
      this.connected = false;
      this.cleanup();
      this.emit('status', 'disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', new Error('WebSocket connection error'));
    };
  }

  private authenticate(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      // Send authentication message
      this.ws.send(JSON.stringify({
        action: 'auth',
        params: token
      }));
    }
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.ev) {
      case 'A':
        // Handle aggregate message
        this.emit('aggregate', {
          ev: 'AM',
          sym: message.sym,
          v: message.v,  // volume
          o: message.o,  // open price
          c: message.c,  // close price
          h: message.h,  // high price
          l: message.l,  // low price
          t: message.t,  // timestamp
          n: message.n   // number of trades
        });
        break;
      case 'T':
        this.emit('trade', message as TradeMessage);
        break;
      case 'Q':
        this.emit('quote', message as QuoteMessage);
        break;
    }
  }

  private handleStatus(message: any) {
    if (message.status === 'auth_success') {
      console.log('Authentication successful');
      this.emit('status', 'authenticated');
      
      // After successful authentication, subscribe to all aggregates
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          action: 'subscribe',
          params: 'A.*'
        }));
      }
    } else if (message.status === 'auth_failed') {
      console.error('Authentication failed:', message.message);
      this.emit('error', new Error(`Authentication failed: ${message.message}`));
    }
  }

  private emit(event: string, data: any) {
    const subscribers = this.subscribers.get(event);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in subscriber callback for event ${event}:`, error);
        }
      });
    }
  }

  public subscribe(event: string, callback: (data: any) => void) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)?.add(callback);

    // Initialize WebSocket if not already connected
    if (!this.connected) {
      this.initializeWebSocket();
    }
  }

  public unsubscribe(event: string, callback: (data: any) => void) {
    const subscribers = this.subscribers.get(event);
    if (subscribers) {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.subscribers.delete(event);
      }
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
      setTimeout(() => this.initializeWebSocket(), delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('error', new Error('Max reconnection attempts reached'));
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

  public disconnect() {
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  public connect() {
    if (!this.connected) {
      this.initializeWebSocket();
    }
  }
}

export const polygonClient = PolygonClient.getInstance(); 