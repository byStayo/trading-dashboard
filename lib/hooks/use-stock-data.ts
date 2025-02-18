import { useState, useEffect } from 'react'
import { polygonService } from '@/lib/api/polygon-service'

export interface StockData {
  symbol: string
  name: string | null
  price: number | null
  previousClose: number | null
  change: number | null
  changePercent: number | null
  volume: number | null
  dayOpen: number | null
  dayHigh: number | null
  dayLow: number | null
  marketCap: number | null
  exchange: string | null
  type: string | null
  lastUpdated: number | null
}

interface UseStockDataParams {
  symbol: string
  pollingInterval?: number // in milliseconds
}

interface UseStockDataReturn {
  data: StockData | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useStockData({ 
  symbol,
  pollingInterval = 15000 // Default to 15 seconds
}: UseStockDataParams): UseStockDataReturn {
  const [data, setData] = useState<StockData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    if (!symbol) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/polygon-stocks?ticker=${symbol}`)
      if (!response.ok) {
        throw new Error('Failed to fetch stock data')
      }

      const jsonData = await response.json()
      setData(jsonData)
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
  }, [symbol, pollingInterval])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
} 