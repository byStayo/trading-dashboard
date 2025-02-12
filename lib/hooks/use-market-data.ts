import { useState, useEffect } from 'react'
import { polygonService } from '../services/polygon-service'

export interface MarketData {
  indices: {
    symbol: string
    name: string
    price: number | null
    change: number | null
    changePercent: number | null
    volume: number | null
  }[]
  sectors: {
    sector: string
    symbol: string
    price: number | null
    change: number | null
    changePercent: number | null
    volume: number | null
  }[]
  topGainers: {
    symbol: string
    price: number | null
    change: number | null
    changePercent: number | null
  }[]
  topLosers: {
    symbol: string
    price: number | null
    change: number | null
    changePercent: number | null
  }[]
  marketBreadth: {
    advancing: number
    declining: number
    unchanged: number
    total: number
  }
}

interface UseMarketDataReturn {
  data: MarketData | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useMarketData(): UseMarketDataReturn {
  const [data, setData] = useState<MarketData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/polygon-stocks/market')
      if (!response.ok) {
        throw new Error('Failed to fetch market data')
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
    // Set up polling every minute
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
} 