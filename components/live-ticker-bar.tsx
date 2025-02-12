"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { TickerConfigDialog, TickerConfig } from "./market-status-header/ticker-config-dialog"
import { useStockWebSocket } from "@/lib/hooks/use-stock-websocket"
import { AggregateMessage } from "@/types/polygon"

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  lastUpdated: number
  description?: string
}

interface LiveTickerBarProps {
  config?: TickerConfig
  onConfigUpdate: (config: TickerConfig) => void
  isLoading?: boolean
}

const DEFAULT_CONFIG: TickerConfig = {
  preset: 'trending',
  sector: undefined,
  customTickers: [],
  maxTickers: 20
}

const POLLING_INTERVAL = 30000 // 30 seconds

export function LiveTickerBar({ 
  config = DEFAULT_CONFIG, 
  onConfigUpdate, 
  isLoading = false 
}: LiveTickerBarProps) {
  const [data, setData] = useState<MarketData[]>([])
  const [configOpen, setConfigOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())
  const [viewportWidth, setViewportWidth] = useState(0)
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null)

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth)
    }
    
    window.addEventListener('resize', updateViewportWidth)
    updateViewportWidth()
    
    return () => window.removeEventListener('resize', updateViewportWidth)
  }, [])

  const fetchMarketData = useCallback(async () => {
    if (!config.preset) return;

    console.log(`[${new Date().toISOString()}] Fetching market data for preset: ${config.preset}`)
    try {
      let tickersUrl = `/api/stock/tickers/${config.preset}`
      
      // Add sector parameter if needed
      if (config.preset === 'sector' && config.sector) {
        tickersUrl += `?sector=${encodeURIComponent(config.sector)}`
      }
      
      // Add custom tickers if needed
      if (config.preset === 'custom' && config.customTickers.length > 0) {
        tickersUrl += `?tickers=${encodeURIComponent(config.customTickers.join(','))}`
      }

      console.log(`[${new Date().toISOString()}] Fetching tickers from: ${tickersUrl}`)
      
      const tickersResponse = await fetch(tickersUrl)
      
      if (!tickersResponse.ok) {
        throw new Error(`Failed to fetch tickers: ${tickersResponse.status} ${tickersResponse.statusText}`)
      }

      const { tickers } = await tickersResponse.json()
      console.log(`[${new Date().toISOString()}] Received tickers:`, tickers)

      if (!Array.isArray(tickers) || tickers.length === 0) {
        setData([])
        return
      }

      const batchSize = 10
      const batches = []
      
      for (let i = 0; i < tickers.length; i += batchSize) {
        const batch = tickers.slice(i, i + batchSize)
        batches.push(
          Promise.all(
            batch.map(async (symbol: string) => {
              try {
                const response = await fetch(`/api/stock/prev/${symbol}`)
                if (!response.ok) {
                  throw new Error(`Failed to fetch data for ${symbol}`)
                }
                const quote = await response.json()
                
                return {
                  symbol,
                  price: quote.c,
                  change: quote.c - quote.o,
                  changePercent: ((quote.c - quote.o) / quote.o) * 100,
                  lastUpdated: Date.now(),
                  description: quote.description
                } as MarketData
              } catch (error) {
                console.error(`Error fetching data for ${symbol}:`, error)
                return null
              }
            })
          )
        )
      }

      const results = await Promise.all(batches)
      const initialData = results.flat().filter((item): item is MarketData => item !== null)
      
      setData(initialData)
      setLastUpdate(Date.now())
      setError(null)
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error:`, error)
      setError(error instanceof Error ? error.message : "Failed to fetch market data")
    }
  }, [config])

  const calculateScrollSpeed = useCallback(() => {
    const baseSpeed = 120 // seconds for one complete scroll (reduced from 180 to 120)
    const itemCount = data.length
    const speedFactor = Math.max(1, itemCount / 4) // Adjusted to make it slightly faster
    const viewportFactor = Math.max(1, viewportWidth / 1920)
    return baseSpeed * speedFactor * viewportFactor
  }, [data.length, viewportWidth])

  const handleAggregateUpdate = useCallback((agg: AggregateMessage) => {
    setData(prevData => {
      const index = prevData.findIndex(item => item.symbol === agg.sym)
      if (index === -1) return prevData

      const newData = [...prevData]
      const prevPrice = newData[index].price
      newData[index] = {
        ...newData[index],
        price: agg.c,
        change: agg.c - agg.o,
        changePercent: ((agg.c - agg.o) / agg.o) * 100,
        lastUpdated: Date.now()
      }
      return newData
    })
    
    setLastUpdate(Date.now())
  }, [])

  const handleWebSocketError = useCallback((error: Error) => {
    console.error('WebSocket error:', error)
    setError('WebSocket connection error. Retrying...')
  }, [])

  const { isConnected } = useStockWebSocket({
    symbols: data.map(item => item.symbol),
    onAggregate: handleAggregateUpdate,
    onError: handleWebSocketError
  })

  useEffect(() => {
    if (isLoading) return

    console.log(`[${new Date().toISOString()}] Setting up market data polling`)
    
    fetchMarketData()

    const pollInterval = setInterval(() => {
      console.log(`[${new Date().toISOString()}] Polling market data (${POLLING_INTERVAL}ms interval)`)
      fetchMarketData()
    }, POLLING_INTERVAL)

    return () => {
      console.log(`[${new Date().toISOString()}] Cleaning up polling`)
      clearInterval(pollInterval)
    }
  }, [config, isLoading, fetchMarketData])

  if (error) {
    return (
      <div className="bg-muted/30 p-2 text-sm text-red-500 flex justify-between items-center">
        <span>{error}</span>
        <button 
          onClick={fetchMarketData} 
          className="text-xs underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading || data.length === 0) {
    return (
      <div className="flex space-x-4 h-8 bg-muted/30 items-center px-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    )
  }

  const tickerData = [...data, ...data, ...data]

  return (
    <>
      <div className="relative">
        <div 
          className="h-8 bg-muted/30 cursor-pointer relative overflow-hidden" 
          onDoubleClick={() => setConfigOpen(true)}
        >
          <div className="ticker">
            <div 
              className="ticker-track"
              style={{ 
                '--scroll-speed': calculateScrollSpeed()
              } as React.CSSProperties}
            >
              {tickerData.map((item, index) => (
                <div 
                  key={`${item.symbol}-${index}`} 
                  className="ticker-item"
                  onClick={() => setExpandedSymbol(expandedSymbol === item.symbol ? null : item.symbol)}
                >
                  <span className="font-medium">{item.symbol}</span>
                  <span className="ml-2">${item.price?.toFixed(2) ?? 'N/A'}</span>
                  <span 
                    className={`ml-2 ${
                      item.changePercent >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expanded News View */}
        {expandedSymbol && (
          <div className="absolute top-full left-0 w-full z-50 bg-background/95 backdrop-blur-sm border rounded-b-lg shadow-lg p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">
                  {expandedSymbol}
                  {data.find(item => item.symbol === expandedSymbol)?.description && (
                    <span className="text-muted-foreground ml-2 font-normal">
                      [{data.find(item => item.symbol === expandedSymbol)?.description}]
                    </span>
                  )}
                </h3>
                <div className="text-sm mt-1">
                  <span className="text-muted-foreground">Current Price: </span>
                  <span className="font-medium">
                    ${data.find(item => item.symbol === expandedSymbol)?.price?.toFixed(2) ?? 'N/A'}
                  </span>
                  <span className="ml-2 text-muted-foreground">Change: </span>
                  <span 
                    className={
                      (data.find(item => item.symbol === expandedSymbol)?.changePercent ?? 0) >= 0 
                        ? "text-green-500" 
                        : "text-red-500"
                    }
                  >
                    {(data.find(item => item.symbol === expandedSymbol)?.changePercent ?? 0) >= 0 ? "+" : ""}
                    {data.find(item => item.symbol === expandedSymbol)?.changePercent?.toFixed(2) ?? '0.00'}%
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setExpandedSymbol(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowUpIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <TickerConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        onSave={onConfigUpdate}
        currentConfig={config}
      />
    </>
  )
}

