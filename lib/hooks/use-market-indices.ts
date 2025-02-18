import { useState, useCallback, useEffect } from 'react'
import { polygonWebSocket } from '@/lib/api/polygon-websocket'
import { AggregateMessage } from '@/types/polygon'
import { MarketIndex } from '@/types/market'

const INDICES_MAP = {
  'SPY': 'S&P 500',
  'QQQ': 'NASDAQ',
  'DIA': 'DOW',
  'VIX': 'VIX'
}

const MIN_POLLING_INTERVAL = 15000; // 15 seconds
const MAX_POLLING_INTERVAL = 60000; // 1 minute
const BACKOFF_MULTIPLIER = 1.5;
const MAX_CONSECUTIVE_ERRORS = 3; // Maximum number of consecutive errors before forcing reset
const BACKOFF_RESET_TIMEOUT = 300000; // Reset backoff after 5 minutes

export function useMarketIndices() {
  const [indices, setIndices] = useState<MarketIndex[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pollingInterval, setPollingInterval] = useState(MIN_POLLING_INTERVAL)
  const [consecutiveErrors, setConsecutiveErrors] = useState(0)
  const [lastBackoffTime, setLastBackoffTime] = useState<number | null>(null)

  const resetBackoff = useCallback(() => {
    setConsecutiveErrors(0)
    setPollingInterval(MIN_POLLING_INTERVAL)
    setLastBackoffTime(null)
  }, [])

  const handleBackoff = useCallback(() => {
    const now = Date.now()
    
    // If we've exceeded MAX_CONSECUTIVE_ERRORS or it's been too long since our last backoff, reset
    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS || 
        (lastBackoffTime && now - lastBackoffTime > BACKOFF_RESET_TIMEOUT)) {
      resetBackoff()
      return
    }

    setConsecutiveErrors(prev => prev + 1)
    setPollingInterval(prev => Math.min(prev * BACKOFF_MULTIPLIER, MAX_POLLING_INTERVAL))
    setLastBackoffTime(now)
  }, [consecutiveErrors, lastBackoffTime, resetBackoff])

  const fetchInitialData = useCallback(async () => {
    try {
      // Get all indices data in a single batch request
      const symbols = Object.keys(INDICES_MAP)
      const response = await fetch(`/api/polygon-stocks/batch?tickers=${symbols.join(',')}`)
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited - increase backoff
          handleBackoff()
          const retryAfter = response.headers.get('Retry-After')
          if (retryAfter) {
            setPollingInterval(Math.min(parseInt(retryAfter) * 1000, MAX_POLLING_INTERVAL))
          }
          throw new Error('Rate limit exceeded')
        }
        throw new Error('Failed to fetch market data')
      }

      const { results, validCount } = await response.json()
      
      // Transform batch results into indices format
      const initialData = Object.keys(INDICES_MAP).map(symbol => {
        const stockData = results.find((r: any) => r.symbol === symbol)
        if (!stockData || stockData.status === 'error') {
          return {
            name: INDICES_MAP[symbol as keyof typeof INDICES_MAP],
            symbol,
            value: 0,
            change: 0,
            changePercent: 0,
            lastUpdated: Date.now(),
            error: stockData?.error || 'No data available'
          }
        }

        return {
          name: INDICES_MAP[symbol as keyof typeof INDICES_MAP],
          symbol,
          value: stockData.price || 0,
          change: stockData.change || 0,
          changePercent: stockData.changePercent || 0,
          lastUpdated: stockData.lastUpdated || Date.now()
        }
      })

      setIndices(initialData)
      setIsLoading(false)
      
      // Only reset if we got at least some valid data
      if (validCount > 0) {
        resetBackoff()
      } else {
        // If no valid data, treat as an error
        handleBackoff()
      }
    } catch (error) {
      console.error('Error fetching market data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch market data')
      setIsLoading(false)
      
      // Increase backoff on error
      handleBackoff()
    }
  }, [handleBackoff, resetBackoff])

  const handleUpdate = useCallback((agg: AggregateMessage) => {
    setIndices(prev => {
      const index = prev.findIndex(item => item.symbol === agg.sym)
      if (index === -1) return prev

      const newIndices = [...prev]
      newIndices[index] = {
        ...newIndices[index],
        value: agg.c,
        change: agg.c - agg.o,
        changePercent: ((agg.c - agg.o) / agg.o) * 100,
        lastUpdated: Date.now()
      }
      return newIndices
    })
  }, [])

  useEffect(() => {
    fetchInitialData()

    // Set up WebSocket connection for real-time updates
    const symbols = Object.keys(INDICES_MAP)
    polygonWebSocket.subscribe(symbols)

    polygonWebSocket.on('aggregate', handleUpdate)
    polygonWebSocket.on('error', (error: Error) => {
      console.error('WebSocket error:', error)
      setError('WebSocket connection error')
    })

    const interval = setInterval(fetchInitialData, pollingInterval)
    return () => {
      polygonWebSocket.unsubscribe(symbols)
      polygonWebSocket.off('aggregate', handleUpdate)
      clearInterval(interval)
    }
  }, [fetchInitialData, handleUpdate, pollingInterval])

  return {
    indices,
    error,
    isLoading,
    pollingInterval,
    refetch: fetchInitialData
  }
} 