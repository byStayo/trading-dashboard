'use client';

import { useCallback, useRef, useEffect, useState, useMemo } from 'react'
import { apiClient } from '../api/api-client'
import { PolygonTrade, PolygonQuote } from '@/lib/api/polygon-types'
import { MarketDataService, type MarketData } from '@/lib/services/market-data-service'
import { useMarketDataStore as useStore } from '../store/market-data-store'
import type { MarketDataState } from '../store/market-data-store'

// Configuration for data freshness
const DATA_FRESHNESS = {
  REAL_TIME: 1000, // 1 second for websocket data
  RECENT: 60000, // 1 minute for REST API data
  STALE: 300000, // 5 minutes for considering data stale
  EXPIRED: 900000 // 15 minutes for considering data expired
}

// Helper functions and interfaces used by the exported hooks

// Function to validate quote responses
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

interface QuoteResponse {
  price: number
  change: number
  changePercent: number
  volume: number
}

export interface UseMarketDataResult {
  data: Record<string, MarketData>
  isLoading: boolean
  error: string | null
  needsUpdate: boolean
}

export interface UseMarketDataOptions {
  refreshInterval?: number
  onUpdate?: (data: MarketData) => void
  onError?: (error: Error) => void
}

export function useMarketData(
  symbols: string | string[],
  options: UseMarketDataOptions = {}
): UseMarketDataResult {
  const symbolArray = Array.isArray(symbols) ? symbols : [symbols]
  const { refreshInterval = 0, onUpdate, onError } = options
  
  const store = useStore()

  // Subscribe to symbols and handle refresh interval
  useEffect(() => {
    // Initial subscription
    symbolArray.forEach(symbol => {
      store.subscribeToSymbol(symbol)
    })

    // Set up refresh interval if specified
    let refreshTimer: NodeJS.Timeout | null = null
    if (refreshInterval > 0) {
      refreshTimer = setInterval(() => {
        symbolArray.forEach(symbol => {
          store.invalidateData(symbol)
        })
      }, refreshInterval)
    }

    // Cleanup subscriptions and timer
    return () => {
      symbolArray.forEach(symbol => {
        store.unsubscribeFromSymbol(symbol)
      })
      if (refreshTimer) {
        clearInterval(refreshTimer)
      }
    }
  }, [symbolArray, refreshInterval, store])

  // Handle updates
  useEffect(() => {
    if (onUpdate) {
      symbolArray.forEach(symbol => {
        const data = store.data[symbol]
        if (data) {
          onUpdate(data)
        }
      })
    }
  }, [symbolArray, store.data, onUpdate])

  // Handle errors
  useEffect(() => {
    if (store.error && onError) {
      onError(new Error(store.error))
    }
  }, [store.error, onError])

  // Calculate aggregated state
  const aggregatedState = useMemo(() => {
    const relevantData: Record<string, MarketData> = {}
    let anyLoading = false
    let anyStale = false
    const now = Date.now()

    symbolArray.forEach(symbol => {
      if (store.data[symbol]) {
        relevantData[symbol] = store.data[symbol]
        
        // Check data staleness
        const staleness = now - store.data[symbol].lastUpdated
        if (staleness > DATA_FRESHNESS.STALE) {
          anyStale = true
        }
      }
      if (store.isLoading[symbol]) {
        anyLoading = true
      }
    })

    return {
      data: relevantData,
      isLoading: anyLoading,
      error: store.error,
      needsUpdate: anyStale || symbolArray.some(symbol => store.pendingUpdates.has(symbol))
    }
  }, [symbolArray, store.data, store.isLoading, store.error, store.pendingUpdates])

  return aggregatedState
}

export function useMarketDataSnapshot(symbols: string | string[]): UseMarketDataResult {
  const store = useStore()
  const symbolArray = Array.isArray(symbols) ? symbols : [symbols]

  return useMemo(() => {
    const relevantData: Record<string, MarketData> = {}
    symbolArray.forEach(symbol => {
      if (store.data[symbol]) {
        relevantData[symbol] = store.data[symbol]
      }
    })

    return {
      data: relevantData,
      isLoading: false,
      error: store.error,
      needsUpdate: false
    }
  }, [symbolArray, store.data, store.error])
}

export function useMarketDataFetcher(symbols: string[]) {
  const store = useStore()

  const fetchData = useCallback(() => {
    symbols.forEach(symbol => {
      store.invalidateData(symbol)
    })
  }, [symbols, store])

  return {
    fetchData,
    clearStaleData: store.clearStaleData
  }
} 