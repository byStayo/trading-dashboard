import { useState, useEffect, useCallback } from 'react'
import { polygonWebSocket } from '@/lib/api/polygon-websocket'
import { AggregateMessage } from '@/types/polygon'

interface MarketIndex {
  name: string
  symbol: string
  value: number
  change: number
  changePercent: number
  lastUpdated: number
}

const INDICES_MAP = {
  'SPY': 'S&P 500',
  'QQQ': 'NASDAQ',
  'DIA': 'DOW',
  'VIX': 'VIX'
}

export function useMarketIndices() {
  const [indices, setIndices] = useState<MarketIndex[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchInitialData = useCallback(async () => {
    try {
      const response = await fetch('/api/stock/tickers/indices')
      if (!response.ok) {
        throw new Error('Failed to fetch initial market data')
      }
      const { tickers } = await response.json()
      
      const initialDataPromises = tickers.map(async (symbol: string) => {
        const response = await fetch(`/api/stock/prev/${symbol}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${symbol}`)
        }
        const data = await response.json()
        
        return {
          name: INDICES_MAP[symbol as keyof typeof INDICES_MAP] || symbol,
          symbol,
          value: data.c,
          change: data.c - data.o,
          changePercent: ((data.c - data.o) / data.o) * 100,
          lastUpdated: Date.now()
        }
      })

      const initialData = await Promise.all(initialDataPromises)
      setIndices(initialData)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching market data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch market data')
      setIsLoading(false)
    }
  }, [])

  const handleUpdate = useCallback((agg: AggregateMessage) => {
    setIndices(prev => {
      const index = prev.findIndex(item => item.symbol === agg.sym)
      if (index === -1) return prev

      const newIndices = [...prev]
      const prevValue = newIndices[index].value
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

    return () => {
      polygonWebSocket.unsubscribe(symbols)
      polygonWebSocket.off('aggregate', handleUpdate)
    }
  }, [fetchInitialData, handleUpdate])

  return {
    indices,
    isLoading,
    error
  }
} 