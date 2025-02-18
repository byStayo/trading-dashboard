import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { StateCreator } from 'zustand'
import { useCallback, useRef, useEffect, useState } from 'react'
import { apiClient } from '../api/api-client'

// Enhanced market data interface with metadata
interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  lastUpdated: number
  metadata: {
    source: 'websocket' | 'rest' | 'cache'
    reliability: number // 0-1 score of data reliability
    staleness: number // milliseconds since last update
  }
}

// Configuration for data freshness
const DATA_FRESHNESS = {
  REAL_TIME: 1000, // 1 second for websocket data
  RECENT: 60000, // 1 minute for REST API data
  STALE: 300000, // 5 minutes for considering data stale
  EXPIRED: 900000 // 15 minutes for considering data expired
}

interface MarketDataState {
  data: Record<string, MarketData>
  isLoading: boolean
  error: string | null
  pendingUpdates: Set<string> // Tracks symbols waiting for updates
  batchQueue: Record<string, MarketData> // Queue for batch updates
  lastBatchUpdate: number
  updateData: (symbol: string, data: Partial<MarketData>, source: MarketData['metadata']['source']) => void
  updateBatchData: (updates: Record<string, Partial<MarketData>>, source: MarketData['metadata']['source']) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  invalidateData: (symbol: string) => void
  clearStaleData: () => void
}

type MarketDataStore = StateCreator<
  MarketDataState,
  [["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  MarketDataState
>

// Create a centralized store for market data with persistence
const useMarketDataStore = create<MarketDataState>()(
  devtools(
    persist(
      ((set, get) => ({
        data: {},
        isLoading: false,
        error: null,
        pendingUpdates: new Set(),
        batchQueue: {},
        lastBatchUpdate: Date.now(),

        updateData: (symbol: string, newData: Partial<MarketData>, source: MarketData['metadata']['source']) =>
          set((state) => {
            const currentData = state.data[symbol]
            const now = Date.now()
            
            // Calculate reliability based on source and data age
            const reliability = calculateReliability(source, currentData?.lastUpdated, now)
            
            return {
              data: {
                ...state.data,
                [symbol]: {
                  ...currentData,
                  ...newData,
                  lastUpdated: now,
                  metadata: {
                    source,
                    reliability,
                    staleness: 0
                  }
                }
              }
            }
          }),

        updateBatchData: (updates: Record<string, Partial<MarketData>>, source: MarketData['metadata']['source']) =>
          set((state) => {
            const now = Date.now()
            const updatedData = { ...state.data }

            Object.entries(updates).forEach(([symbol, newData]) => {
              const currentData = state.data[symbol]
              const reliability = calculateReliability(source, currentData?.lastUpdated, now)

              updatedData[symbol] = {
                ...currentData,
                ...newData,
                lastUpdated: now,
                metadata: {
                  source,
                  reliability,
                  staleness: 0
                }
              }
            })

            return {
              data: updatedData,
              lastBatchUpdate: now
            }
          }),

        setLoading: (loading: boolean) => set({ isLoading: loading }),
        setError: (error: string | null) => set({ error }),
        
        invalidateData: (symbol: string) =>
          set((state) => ({
            data: {
              ...state.data,
              [symbol]: {
                ...state.data[symbol],
                metadata: {
                  ...state.data[symbol].metadata,
                  reliability: 0
                }
              }
            }
          })),

        clearStaleData: () =>
          set((state) => {
            const now = Date.now()
            const freshData = Object.entries(state.data).reduce((acc, [symbol, data]) => {
              const staleness = now - data.lastUpdated
              if (staleness < DATA_FRESHNESS.EXPIRED) {
                acc[symbol] = {
                  ...data,
                  metadata: {
                    ...data.metadata,
                    staleness
                  }
                }
              }
              return acc
            }, {} as Record<string, MarketData>)

            return { data: freshData }
          })
      })) as MarketDataStore,
      {
        name: 'market-data-store',
        partialize: (state) => ({
          data: state.data // Only persist the data, not loading states or errors
        })
      }
    ),
    {
      name: 'market-data-store'
    }
  )
)

// Helper function to calculate data reliability
function calculateReliability(
  source: MarketData['metadata']['source'],
  lastUpdate: number | undefined,
  currentTime: number
): number {
  if (!lastUpdate) return 1 // New data is considered reliable

  const age = currentTime - lastUpdate
  
  // Base reliability by source
  const baseReliability = {
    websocket: 1,
    rest: 0.9,
    cache: 0.8
  }[source]

  // Decay reliability based on age
  if (age < DATA_FRESHNESS.REAL_TIME) return baseReliability
  if (age < DATA_FRESHNESS.RECENT) return baseReliability * 0.9
  if (age < DATA_FRESHNESS.STALE) return baseReliability * 0.7
  if (age < DATA_FRESHNESS.EXPIRED) return baseReliability * 0.5
  return 0
}

interface QuoteResponse {
  price: number
  change: number
  changePercent: number
  volume: number
}

interface UseMarketDataOptions {
  refreshInterval?: number
  useWebSocket?: boolean
  onUpdate?: (data: MarketData) => void
  onError?: (error: Error) => void
}

export function useMarketData(
  symbols: string[],
  options: UseMarketDataOptions = {}
) {
  const {
    refreshInterval = 5000,
    useWebSocket = true,
    onUpdate,
    onError,
  } = options

  const [data, setData] = useState<Record<string, MarketData>>({})
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const wsRef = useRef<WebSocket | null>(null)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getMarketData(symbols)
      setData(response.data)
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch market data')
      setError(error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [symbols, onError])

  // Set up WebSocket connection
  const setupWebSocket = useCallback(() => {
    if (!useWebSocket) return

    wsRef.current = apiClient.connectWebSocket(symbols)

    wsRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'marketData') {
          setData(prevData => ({
            ...prevData,
            [message.symbol]: {
              ...message.data,
              metadata: {
                source: 'websocket',
                reliability: 1,
                staleness: 0,
              },
            },
          }))
          onUpdate?.(message.data)
        }
      } catch (err) {
        console.error('WebSocket message error:', err)
      }
    }

    wsRef.current.onerror = (event) => {
      console.error('WebSocket error:', event)
      const error = new Error('WebSocket connection error')
      setError(error)
      onError?.(error)
    }

    wsRef.current.onclose = () => {
      // Fallback to polling if WebSocket fails
      setupPolling()
    }
  }, [symbols, useWebSocket, onUpdate, onError])

  // Set up polling fallback
  const setupPolling = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current)
    }

    refreshTimerRef.current = setInterval(fetchData, refreshInterval)
  }, [fetchData, refreshInterval])

  // Initialize data fetching
  useEffect(() => {
    fetchData()

    if (useWebSocket) {
      setupWebSocket()
    } else {
      setupPolling()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
    }
  }, [fetchData, setupWebSocket, setupPolling, useWebSocket])

  // Utility functions
  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  const getSymbolData = useCallback((symbol: string) => {
    return data[symbol]
  }, [data])

  return {
    data,
    error,
    isLoading,
    refresh,
    getSymbolData,
  }
}

// Enhanced fetcher with batching and error handling
export function useMarketDataFetcher(symbols: string[]) {
  const { updateBatchData, setError } = useMarketData(symbols)
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingUpdates = useRef<Record<string, Partial<MarketData>>>({})

  const fetchData = useCallback(async (targetSymbols?: string[]) => {
    try {
      const symbolsToFetch = targetSymbols || symbols
      if (!symbolsToFetch.length) return

      const response = await fetch(`/api/stock/quotes?symbols=${encodeURIComponent(symbolsToFetch.join(','))}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.status}`)
      }

      const data = await response.json()
      const updates: Record<string, Partial<MarketData>> = {}

      Object.entries(data).forEach(([symbol, quote]) => {
        if (isQuoteResponse(quote)) {
          updates[symbol] = {
            symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume
          }
        }
      })

      // Queue updates for batching
      pendingUpdates.current = { ...pendingUpdates.current, ...updates }

      // Clear existing timeout
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
      }

      // Set new timeout for batch update
      batchTimeoutRef.current = setTimeout(() => {
        if (Object.keys(pendingUpdates.current).length > 0) {
          updateBatchData(pendingUpdates.current, 'rest')
          pendingUpdates.current = {}
        }
      }, 100) // Batch updates within 100ms window

    } catch (error) {
      console.error('Error fetching market data:', error)
      setError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }, [symbols, updateBatchData, setError])

  // Cleanup batch timeout on unmount
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current)
      }
    }
  }, [])

  return { fetchData }
}

function isQuoteResponse(quote: unknown): quote is QuoteResponse {
  return (
    typeof quote === 'object' &&
    quote !== null &&
    'price' in quote &&
    'change' in quote &&
    'changePercent' in quote &&
    'volume' in quote
  )
} 