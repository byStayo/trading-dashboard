import { EventEmitter } from 'events'
import { MarketDataEvent, MarketSnapshot } from '@/types/market-data'

class PolygonWebSocket extends EventEmitter {
  private static instance: PolygonWebSocket
  private ws: WebSocket | null = null
  private subscriptions = new Set<string>()
  private reconnectAttempts = 5
  private reconnectDelay = 5000
  private reconnectCount = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private pingInterval: NodeJS.Timeout | null = null
  private isConnected = false
  private lastError: Error | null = null

  private constructor() {
    super()
  }

  static getInstance(): PolygonWebSocket {
    if (!PolygonWebSocket.instance) {
      PolygonWebSocket.instance = new PolygonWebSocket()
    }
    return PolygonWebSocket.instance
  }

  async connect(): Promise<void> {
    try {
      // Connect to Polygon's delayed WebSocket endpoint
      this.ws = new WebSocket('wss://delayed.polygon.io/stocks')

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = (event: Event) => {
        if (event instanceof ErrorEvent) {
          this.handleError(new Error(event.message))
        } else {
          this.handleError(new Error('WebSocket error occurred'))
        }
      }
      this.ws.onmessage = this.handleMessage.bind(this)

    } catch (error) {
      this.handleError(error as Error)
    }
  }

  private handleOpen(): void {
    this.authenticate()
    this.startPingInterval()
    this.reconnectCount = 0
    this.isConnected = true
    this.emit('status', { status: 'connected' })

    // Resubscribe to previous subscriptions
    if (this.subscriptions.size > 0) {
      this.subscribe([...this.subscriptions])
    }
  }

  private handleClose(): void {
    this.cleanup()
    this.isConnected = false
    this.emit('status', { status: 'disconnected' })
    this.attemptReconnect()
  }

  private handleError(error: Error): void {
    this.lastError = error
    this.emit('error', error)
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const messages: MarketDataEvent[] = JSON.parse(event.data)
      messages.forEach(message => {
        this.emit('message', message)
      })
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }

  private authenticate(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'auth',
        params: process.env.NEXT_PUBLIC_POLYGON_API_KEY
      }))
    }
  }

  subscribe(symbols: string[]): void {
    const newSymbols = symbols.filter(s => !this.subscriptions.has(s))
    if (newSymbols.length === 0) return

    newSymbols.forEach(s => this.subscriptions.add(s))

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Subscribe to trades, quotes, and minute aggregates
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        params: [
          ...newSymbols.map(s => `T.${s}`),  // Trades
          ...newSymbols.map(s => `Q.${s}`),  // Quotes
          ...newSymbols.map(s => `AM.${s}`)  // Minute aggregates
        ].join(',')
      }))
    }
  }

  unsubscribe(symbols: string[]): void {
    const existingSymbols = symbols.filter(s => this.subscriptions.has(s))
    if (existingSymbols.length === 0) return

    existingSymbols.forEach(s => this.subscriptions.delete(s))

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'unsubscribe',
        params: [
          ...existingSymbols.map(s => `T.${s}`),
          ...existingSymbols.map(s => `Q.${s}`),
          ...existingSymbols.map(s => `AM.${s}`)
        ].join(',')
      }))
    }
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ action: 'ping' }))
      }
    }, 30000) // Send ping every 30 seconds
  }

  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectCount >= this.reconnectAttempts) {
      this.handleError(new Error('Maximum reconnection attempts reached'))
      return
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectCount++
      this.connect()
    }, this.reconnectDelay * Math.pow(2, this.reconnectCount)) // Exponential backoff
  }

  disconnect(): void {
    this.cleanup()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
  }

  getStatus(): { isConnected: boolean; lastError: Error | null } {
    return {
      isConnected: this.isConnected,
      lastError: this.lastError
    }
  }
}

export default PolygonWebSocket 