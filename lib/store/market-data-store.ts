import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { StateCreator } from 'zustand'
import { MarketData } from '../services/market-data-service'
import { MarketDataService } from '../services/market-data-service'
import { logger } from '../utils/logger'
import { debounce } from 'lodash'

// Configuration for data freshness
const DATA_FRESHNESS = {
  REAL_TIME: 1000, // 1 second for websocket data
  RECENT: 60000, // 1 minute for REST API data
  STALE: 300000, // 5 minutes for considering data stale
  EXPIRED: 900000 // 15 minutes for considering data expired
}

// Configuration for subscription management
const SUBSCRIPTION_CONFIG = {
  BATCH_WINDOW: 100, // 100ms window for batching subscriptions
  MAX_BATCH_SIZE: 50, // Maximum number of symbols in a batch
  DEBOUNCE_INTERVAL: 250, // 250ms debounce for updates
}

export interface MarketDataState {
  data: Record<string, MarketData>
  isLoading: Record<string, boolean>
  error: string | null
  pendingUpdates: Set<string> // Tracks symbols waiting for updates
  batchQueue: Record<string, MarketData> // Queue for batch updates
  lastBatchUpdate: number
  subscribeToSymbol: (symbol: string) => void
  unsubscribeFromSymbol: (symbol: string) => void
  updateData: (symbol: string, data: Partial<MarketData>, source: MarketData['metadata']['source']) => void
  updateBatchData: (updates: Record<string, Partial<MarketData>>, source: MarketData['metadata']['source']) => void
  setLoading: (symbol: string, loading: boolean) => void
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

const marketDataService = MarketDataService.getInstance()

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

// Create a subscription batch processor
const subscriptionBatchProcessor = debounce((symbols: string[], store: MarketDataState) => {
  const batches: string[][] = []
  for (let i = 0; i < symbols.length; i += SUBSCRIPTION_CONFIG.MAX_BATCH_SIZE) {
    batches.push(symbols.slice(i, i + SUBSCRIPTION_CONFIG.MAX_BATCH_SIZE))
  }

  batches.forEach(batch => {
    batch.forEach(symbol => {
      marketDataService.subscribe(symbol, (data) => {
        store.updateData(symbol, data, data.metadata.source)
      })
    })
  })
}, SUBSCRIPTION_CONFIG.BATCH_WINDOW)

// Create a debounced update processor
const updateProcessor = debounce((updates: Record<string, Partial<MarketData>>, store: MarketDataState) => {
  const firstUpdate = updates[Object.keys(updates)[0]]
  const source = firstUpdate?.metadata?.source || 'rest'
  store.updateBatchData(updates, source)
}, SUBSCRIPTION_CONFIG.DEBOUNCE_INTERVAL)

export const useMarketDataStore = create<MarketDataState>()(
  devtools(
    persist(
      (set, get) => ({
        data: {},
        isLoading: {},
        error: null,
        pendingUpdates: new Set(),
        batchQueue: {},
        lastBatchUpdate: Date.now(),

        subscribeToSymbol: (symbol: string) => {
          const state = get()
          if (!state.data[symbol]) {
            set((state) => ({
              ...state,
              isLoading: { ...state.isLoading, [symbol]: true }
            }))

            // Add to subscription batch
            subscriptionBatchProcessor([symbol], state)
          }
        },

        unsubscribeFromSymbol: (symbol: string) => {
          marketDataService.unsubscribe(symbol, () => {})
          set((state) => {
            const { [symbol]: _, ...remainingData } = state.data
            const { [symbol]: __, ...remainingLoading } = state.isLoading
            return {
              ...state,
              data: remainingData,
              isLoading: remainingLoading
            }
          })
        },

        updateData: (symbol: string, data: Partial<MarketData>, source: MarketData['metadata']['source']) => {
          const state = get()
          const now = Date.now()
          const currentData = state.data[symbol]
          const reliability = calculateReliability(source, currentData?.lastUpdated, now)

          const updatedData = {
            ...data,
            lastUpdated: now,
            metadata: {
              source,
              reliability,
              staleness: 0
            }
          }
          
          const updates = {
            [symbol]: updatedData
          }
          
          // Add to batch queue
          state.batchQueue[symbol] = {
            ...(state.batchQueue[symbol] || {}),
            ...updatedData
          }

          // Process updates with debouncing
          updateProcessor(state.batchQueue, state)
        },

        updateBatchData: (updates: Record<string, Partial<MarketData>>, source: MarketData['metadata']['source']) => {
          set((state) => {
            const now = Date.now()
            const updatedData = { ...state.data }
            
            Object.entries(updates).forEach(([symbol, update]) => {
              const currentData = state.data[symbol]
              const reliability = calculateReliability(source, currentData?.lastUpdated, now)
              
              updatedData[symbol] = { 
                ...state.data[symbol], 
                ...update,
                lastUpdated: now,
                metadata: {
                  source,
                  reliability,
                  staleness: 0
                }
              }
            })

            // Clear processed updates from queue
            const newBatchQueue = { ...state.batchQueue }
            Object.keys(updates).forEach(symbol => {
              delete newBatchQueue[symbol]
            })

            return {
              ...state,
              data: updatedData,
              batchQueue: newBatchQueue,
              isLoading: Object.keys(updates).reduce(
                (acc, symbol) => ({ ...acc, [symbol]: false }),
                { ...state.isLoading }
              ),
              lastBatchUpdate: now,
              pendingUpdates: new Set(
                [...state.pendingUpdates].filter(symbol => !updates[symbol])
              )
            }
          })
        },

        setLoading: (symbol: string, loading: boolean) => {
          set((state) => ({
            ...state,
            isLoading: { ...state.isLoading, [symbol]: loading }
          }))
        },

        setError: (error: string | null) => {
          set((state) => ({
            ...state,
            error
          }))
        },

        invalidateData: (symbol: string) => {
          set((state) => ({
            ...state,
            pendingUpdates: new Set([...state.pendingUpdates, symbol])
          }))
        },

        clearStaleData: () => {
          set((state) => {
            const now = Date.now()
            const updatedData = { ...state.data }
            let hasStaleData = false

            Object.entries(updatedData).forEach(([symbol, data]) => {
              const staleness = now - data.lastUpdated
              if (staleness > DATA_FRESHNESS.EXPIRED) {
                delete updatedData[symbol]
                hasStaleData = true
              }
            })

            if (!hasStaleData) return state

            return {
              ...state,
              data: updatedData
            }
          })
        }
      }),
      {
        name: 'market-data-store',
        partialize: (state) => ({
          data: state.data,
          lastBatchUpdate: state.lastBatchUpdate
        })
      }
    )
  )
) 