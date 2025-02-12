import { useState, useEffect, useCallback } from 'react'
import { polygonWebSocket } from '@/lib/api/polygon-websocket'
import { QuoteMessage, AggregateMessage } from '@/types/polygon'

interface UseStockWebSocketParams {
  symbols: string[]
  onQuote?: (data: QuoteMessage) => void
  onAggregate?: (data: AggregateMessage) => void
  onError?: (error: Error) => void
}

interface UseStockWebSocketReturn {
  isConnected: boolean
  error: Error | null
  reconnect: () => void
}

export function useStockWebSocket({
  symbols,
  onQuote,
  onAggregate,
  onError
}: UseStockWebSocketParams): UseStockWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleQuote = useCallback((quote: QuoteMessage) => {
    if (onQuote) {
      onQuote(quote)
    }
  }, [onQuote])

  const handleAggregate = useCallback((agg: AggregateMessage) => {
    if (onAggregate) {
      onAggregate(agg)
    }
  }, [onAggregate])

  const handleError = useCallback((err: Error) => {
    setError(err)
    if (onError) {
      onError(err)
    }
  }, [onError])

  useEffect(() => {
    // Set up event listeners
    polygonWebSocket.on('quote', handleQuote)
    polygonWebSocket.on('aggregate', handleAggregate)
    polygonWebSocket.on('error', handleError)
    polygonWebSocket.on('max_reconnects', () => {
      handleError(new Error('Maximum reconnection attempts reached'))
    })

    // Connect and subscribe
    polygonWebSocket.connect()
    if (symbols.length > 0) {
      polygonWebSocket.subscribe(symbols)
    }

    // Update connection status
    setIsConnected(true)

    return () => {
      // Clean up event listeners
      polygonWebSocket.off('quote', handleQuote)
      polygonWebSocket.off('aggregate', handleAggregate)
      polygonWebSocket.off('error', handleError)
      polygonWebSocket.off('max_reconnects')

      // Unsubscribe and disconnect
      if (symbols.length > 0) {
        polygonWebSocket.unsubscribe(symbols)
      }
    }
  }, [symbols, handleQuote, handleAggregate, handleError])

  const reconnect = useCallback(() => {
    polygonWebSocket.disconnect()
    polygonWebSocket.connect()
    if (symbols.length > 0) {
      polygonWebSocket.subscribe(symbols)
    }
    setIsConnected(true)
    setError(null)
  }, [symbols])

  return {
    isConnected,
    error,
    reconnect
  }
} 