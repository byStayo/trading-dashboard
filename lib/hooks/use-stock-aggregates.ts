import { useState, useEffect } from 'react'
import { AggregatesResponse } from '@/lib/services/polygon-service'

interface UseStockAggregatesParams {
  ticker: string
  multiplier: number
  timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
  from: Date
  to: Date
  adjusted?: boolean
}

interface UseStockAggregatesReturn {
  data: AggregatesResponse | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useStockAggregates({
  ticker,
  multiplier,
  timespan,
  from,
  to,
  adjusted = true,
}: UseStockAggregatesParams): UseStockAggregatesReturn {
  const [data, setData] = useState<AggregatesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        ticker,
        multiplier: multiplier.toString(),
        timespan,
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
        adjusted: adjusted.toString(),
      })

      const response = await fetch(`/api/polygon/aggregates?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch aggregates data')
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
  }, [ticker, multiplier, timespan, from, to, adjusted])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
} 