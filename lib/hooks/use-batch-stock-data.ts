import { useState, useEffect } from 'react'
import { polygonService } from '../services/polygon-service'
import { StockData } from './use-stock-data'

interface UseBatchStockDataParams {
  symbols: string[]
  pollingInterval?: number // in milliseconds
}

interface UseBatchStockDataReturn {
  data: Record<string, StockData>
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useBatchStockData({ 
  symbols,
  pollingInterval = 15000 // Default to 15 seconds
}: UseBatchStockDataParams): UseBatchStockDataReturn {
  const [data, setData] = useState<Record<string, StockData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    if (!symbols.length) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/polygon-stocks/batch?tickers=${symbols.join(',')}`)
      if (!response.ok) {
        throw new Error('Failed to fetch batch stock data')
      }

      const jsonData = await response.json()
      
      // Transform array to record for easier lookup
      const stocksRecord = jsonData.results.reduce((acc: Record<string, StockData>, stock: StockData) => {
        acc[stock.symbol] = stock
        return acc
      }, {})

      setData(stocksRecord)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Set up polling if interval is provided
    if (pollingInterval > 0) {
      const interval = setInterval(fetchData, pollingInterval)
      return () => clearInterval(interval)
    }
  }, [symbols.join(','), pollingInterval])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
} 