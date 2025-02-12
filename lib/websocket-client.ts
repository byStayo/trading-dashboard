type MessageCallback = (data: any) => void
type ErrorCallback = (error: Error) => void
type StatusCallback = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void

interface WebSocketOptions {
  onMessage?: MessageCallback
  onError?: ErrorCallback
  onStatusChange?: StatusCallback
  reconnectAttempts?: number
  reconnectDelay?: number
}

export class PolygonWebSocket {
  private ws: WebSocket | null = null
  private token: string | null = null
  private subscriptions: Set<string> = new Set()
  private reconnectAttempts: number
  private reconnectDelay: number
  private reconnectCount: number = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private pingInterval: NodeJS.Timeout | null = null
  private onMessage?: MessageCallback
  private onError?: ErrorCallback
  private onStatusChange?: StatusCallback

  constructor(options: WebSocketOptions = {}) {
    this.reconnectAttempts = options.reconnectAttempts || 5
    this.reconnectDelay = options.reconnectDelay || 5000
    this.onMessage = options.onMessage
    this.onError = options.onError
    this.onStatusChange = options.onStatusChange
  }

  async connect(): Promise<void> {
    try {
      this.updateStatus('connecting')

      // Get WebSocket connection details from our API
      const response = await fetch('/api/polygon-stocks/websocket')
      if (!response.ok) {
        throw new Error('Failed to get WebSocket connection details')
      }

      const { wsUrl, token } = await response.json()
      this.token = token

      // Create WebSocket connection
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.authenticate()
        this.startPingInterval()
        this.reconnectCount = 0
        this.updateStatus('connected')
      }

      this.ws.onclose = () => {
        this.cleanup()
        this.updateStatus('disconnected')
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        this.handleError(new Error('WebSocket error occurred'))
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.ev === 'status') {
            // Handle status messages
            console.log('Status:', data)
          } else if (this.onMessage) {
            this.onMessage(data)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
    } catch (error) {
      this.handleError(error as Error)
    }
  }

  private authenticate(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.token) {
      this.ws.send(JSON.stringify({ action: 'auth', params: this.token }))
    }
  }

  subscribe(symbols: string[]): void {
    const newSymbols = symbols.filter(s => !this.subscriptions.has(s))
    if (newSymbols.length === 0) return

    newSymbols.forEach(s => this.subscriptions.add(s))

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        params: `T.${newSymbols.join(',T.')}`
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
        params: `T.${existingSymbols.join(',T.')}`
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

  private handleError(error: Error): void {
    this.updateStatus('error')
    if (this.onError) {
      this.onError(error)
    }
  }

  private updateStatus(status: 'connecting' | 'connected' | 'disconnected' | 'error'): void {
    if (this.onStatusChange) {
      this.onStatusChange(status)
    }
  }

  disconnect(): void {
    this.cleanup()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
} 