import { useState, useEffect, useCallback } from 'react'
import { PolygonWebSocket } from '../websocket-client'

interface UseStockWebSocketParams {
  symbols: string[]
  onUpdate?: (data: any) => void
  onError?: (error: Error) => void
}

interface UseStockWebSocketReturn {
  isConnected: boolean
  error: Error | null
  reconnect: () => void
}

export function useStockWebSocket({
  symbols,
  onUpdate,
  onError
}: UseStockWebSocketParams): UseStockWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [ws, setWs] = useState<PolygonWebSocket | null>(null)

  const handleStatusChange = useCallback((status: 'connecting' | 'connected' | 'disconnected' | 'error') => {
    setIsConnected(status === 'connected')
    if (status === 'error') {
      setError(new Error('WebSocket connection error'))
    }
  }, [])

  const handleError = useCallback((err: Error) => {
    setError(err)
    if (onError) {
      onError(err)
    }
  }, [onError])

  const connect = useCallback(() => {
    if (ws) {
      ws.disconnect()
    }

    const newWs = new PolygonWebSocket({
      onMessage: onUpdate,
      onError: handleError,
      onStatusChange: handleStatusChange,
      reconnectAttempts: 5,
      reconnectDelay: 1000
    })

    newWs.connect().then(() => {
      if (symbols.length > 0) {
        newWs.subscribe(symbols)
      }
    })

    setWs(newWs)
  }, [symbols, onUpdate, handleError, handleStatusChange])

  useEffect(() => {
    connect()
    return () => {
      if (ws) {
        ws.disconnect()
      }
    }
  }, [connect])

  useEffect(() => {
    if (ws && isConnected) {
      ws.subscribe(symbols)
    }
  }, [ws, isConnected, symbols])

  const reconnect = useCallback(() => {
    connect()
  }, [connect])

  return {
    isConnected,
    error,
    reconnect
  }
} 