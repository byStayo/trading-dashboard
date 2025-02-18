import { useState, useEffect } from 'react'
import { StockData } from '@/types/stock'

interface UseBatchStockDataParams {
  symbols: string[];
  pollingInterval?: number;
}

interface UseBatchStockDataReturn {
  data: Record<string, StockData>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  currentPollingInterval: number;
}

const MIN_POLLING_INTERVAL = 15000; // 15 seconds
const MAX_POLLING_INTERVAL = 60000; // 1 minute
const BACKOFF_MULTIPLIER = 1.5;

export function useBatchStockData({ 
  symbols,
  pollingInterval = MIN_POLLING_INTERVAL
}: UseBatchStockDataParams): UseBatchStockDataReturn {
  const [data, setData] = useState<Record<string, StockData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [currentPollingInterval, setCurrentPollingInterval] = useState(pollingInterval)
  const [consecutiveErrors, setConsecutiveErrors] = useState(0)

  const fetchData = async () => {
    if (!symbols.length) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/polygon-stocks/batch?tickers=${symbols.join(',')}`)
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited - increase backoff
          setConsecutiveErrors(prev => prev + 1)
          const retryAfter = response.headers.get('Retry-After')
          if (retryAfter) {
            setCurrentPollingInterval(Math.min(parseInt(retryAfter) * 1000, MAX_POLLING_INTERVAL))
          } else {
            setCurrentPollingInterval(prev => Math.min(prev * BACKOFF_MULTIPLIER, MAX_POLLING_INTERVAL))
          }
          throw new Error('Rate limit exceeded')
        }
        throw new Error('Failed to fetch batch stock data')
      }

      const jsonData = await response.json()
      
      // Transform array to record for easier lookup
      const stocksRecord = jsonData.results.reduce((acc: Record<string, StockData>, stock: StockData) => {
        acc[stock.symbol] = stock
        return acc
      }, {})

      setData(stocksRecord)
      
      // Reset on success
      setConsecutiveErrors(0)
      setCurrentPollingInterval(MIN_POLLING_INTERVAL)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'))
      
      // Increase backoff on error
      setConsecutiveErrors(prev => prev + 1)
      setCurrentPollingInterval(prev => Math.min(prev * BACKOFF_MULTIPLIER, MAX_POLLING_INTERVAL))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Set up polling if interval is provided
    if (currentPollingInterval > 0) {
      const interval = setInterval(fetchData, currentPollingInterval)
      return () => clearInterval(interval)
    }
  }, [symbols.join(','), currentPollingInterval])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    currentPollingInterval
  }
} 