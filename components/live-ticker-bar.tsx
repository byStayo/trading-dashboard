"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { TickerConfigDialog, TickerConfig } from "./market-status-header/ticker-config-dialog"
import { useStockWebSocket } from "@/lib/hooks/use-stock-websocket"
import { useMarketData, useMarketDataFetcher } from "@/lib/hooks/use-market-data"
import { AggregateMessage } from "@/types/polygon"

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

const calculateScrollSpeed = (itemCount: number, viewportWidth: number) => {
  const baseSpeed = 120 // seconds for one complete scroll
  const speedFactor = Math.max(1, itemCount / 4)
  const viewportFactor = Math.max(1, viewportWidth / 1920)
  return baseSpeed * speedFactor * viewportFactor
}

export function LiveTickerBar({ 
  config = DEFAULT_CONFIG, 
  onConfigUpdate, 
  isLoading = false 
}: LiveTickerBarProps) {
  const [configOpen, setConfigOpen] = useState(false)
  const [tickers, setTickers] = useState<string[]>([])
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [isClientSide, setIsClientSide] = useState(false)
  const [wsError, setWsError] = useState<string | null>(null)
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connected' | 'authenticated'>('disconnected')
  const [retryCount, setRetryCount] = useState(0)

  // Use the centralized market data store
  const { data: marketData, isLoading: isDataLoading, error, updateData } = useMarketData(tickers)
  const { fetchData } = useMarketDataFetcher(tickers)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
    setIsClientSide(true)
  }, [])

  // Handle viewport width updates
  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth)
    }
    
    if (isClientSide) {
      window.addEventListener('resize', updateViewportWidth)
      updateViewportWidth()
      
      return () => window.removeEventListener('resize', updateViewportWidth)
    }
  }, [isClientSide])

  // Fetch tickers based on config
  useEffect(() => {
    if (!config.preset || isLoading || !isClientSide) return;

    const fetchTickers = async () => {
      try {
        let tickersUrl = `/api/stock/tickers/${config.preset}`;
        
        if (config.preset === 'sector' && config.sector) {
          tickersUrl += `?sector=${encodeURIComponent(config.sector)}`;
        }
        
        if (config.preset === 'custom' && config.customTickers.length > 0) {
          tickersUrl = `/api/stock/tickers/custom?symbols=${encodeURIComponent(config.customTickers.join(','))}`;
        }
        
        const response = await fetch(tickersUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch tickers: ${response.status}`);
        }

        const data = await response.json();
        if (!data.tickers || data.tickers.length === 0) {
          throw new Error('No tickers available for the selected configuration');
        }

        const filteredTickers = data.tickers
          .filter((ticker: string) => ticker && ticker.trim())
          .slice(0, config.maxTickers || 20);

        if (filteredTickers.length === 0) {
          throw new Error('No valid tickers found');
        }

        setTickers(filteredTickers);
        // Immediately fetch initial market data
        fetchData(filteredTickers);
      } catch (error) {
        console.error('Error fetching tickers:', error);
        setWsError(error instanceof Error ? error.message : 'Failed to fetch tickers');
      }
    };

    fetchTickers();
  }, [config, isLoading, isClientSide, fetchData]);

  // Set up polling for market data
  useEffect(() => {
    if (isLoading || !tickers.length || !isClientSide) return

    fetchData()
    const pollInterval = setInterval(fetchData, POLLING_INTERVAL)
    
    return () => clearInterval(pollInterval)
  }, [tickers, isLoading, fetchData, isClientSide])

  // Handle WebSocket updates
  const handleAggregateUpdate = useCallback((agg: AggregateMessage) => {
    if (!marketData[agg.sym]) return

    const updatedData = {
      symbol: agg.sym,
      price: agg.c,
      change: agg.c - agg.o,
      changePercent: ((agg.c - agg.o) / agg.o) * 100,
      volume: marketData[agg.sym].volume,
      lastUpdated: Date.now(),
    }

    updateData(agg.sym, updatedData)
  }, [marketData, updateData])

  // Handle WebSocket status changes
  const handleStatusChange = useCallback((status: string) => {
    setWsStatus(status as 'disconnected' | 'connected' | 'authenticated')
    if (status === 'authenticated') {
      setWsError(null)
      setRetryCount(0)
    }
  }, [])

  // Handle WebSocket errors with retry logic
  const handleWsError = useCallback((error: Error) => {
    console.error('WebSocket error:', error)
    setWsError(error.message)
    
    if (retryCount < 3) {
      const retryDelay = Math.pow(2, retryCount) * 1000
      setTimeout(() => {
        setRetryCount(prev => prev + 1)
        setWsError(null)
      }, retryDelay)
    }
  }, [retryCount])

  // Set up WebSocket connection
  const { isConnected } = useStockWebSocket({
    symbols: tickers,
    onAggregate: handleAggregateUpdate,
    onError: handleWsError,
    onStatusChange: handleStatusChange
  })

  // Handle ticker click
  const handleTickerClick = useCallback((symbol: string, event: React.MouseEvent) => {
    const currentTime = Date.now()
    
    if (currentTime - lastClickTime < 300) {
      // Double click detected
      event.preventDefault()
      setExpandedSymbol(null)
      setConfigOpen(true)
    } else {
      // Single click
      setExpandedSymbol(expandedSymbol === symbol ? null : symbol)
    }
    
    setLastClickTime(currentTime)
  }, [lastClickTime, expandedSymbol])

  // Show loading state before client-side mount
  if (!mounted || !isClientSide) {
    return (
      <div className="flex space-x-4 h-8 bg-muted/30 items-center px-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton className="h-3 w-16 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  // Show loading state while fetching initial data
  if (isLoading || isDataLoading || !tickers.length) {
    return (
      <div className="flex space-x-4 h-8 bg-muted/30 items-center px-4">
        <span className="text-sm text-muted-foreground">Loading market data...</span>
        <div className="animate-pulse h-2 w-2 rounded-full bg-yellow-500" />
      </div>
    );
  }

  // Show error state with retry button
  if (error || wsError) {
    return (
      <div className="bg-muted/30 p-2 text-sm text-red-500 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span>{error || wsError}</span>
          {wsStatus !== 'authenticated' && (
            <span className="text-xs text-muted-foreground">
              WebSocket: {wsStatus}
            </span>
          )}
        </div>
        <button 
          onClick={() => {
            setWsError(null);
            setRetryCount(0);
            fetchData(tickers);
          }} 
          className="text-xs underline hover:no-underline"
        >
          Retry {retryCount > 0 ? `(${retryCount}/3)` : ''}
        </button>
      </div>
    );
  }

  // Show connection status when not authenticated
  if (wsStatus !== 'authenticated') {
    return (
      <div className="bg-muted/30 p-2 text-sm flex justify-between items-center">
        <span className="text-muted-foreground">
          Connecting to market data... ({wsStatus})
        </span>
        <div className="animate-pulse h-2 w-2 rounded-full bg-yellow-500" />
      </div>
    )
  }

  // Prepare ticker data for display
  const tickerDataArray = Object.values(marketData).filter(Boolean)
  const repeatedData = [...tickerDataArray, ...tickerDataArray, ...tickerDataArray]

  return (
    <>
      <div className="relative">
        <div 
          className="h-8 bg-muted/30 cursor-pointer relative overflow-hidden" 
        >
          <div className="ticker">
            <div 
              className="ticker-track"
              style={{ 
                '--scroll-speed': `${calculateScrollSpeed(tickerDataArray.length, viewportWidth)}s`
              } as React.CSSProperties}
            >
              {repeatedData.map((item, index) => (
                <div 
                  key={`${item.symbol}-${index}`} 
                  className={`ticker-item ${expandedSymbol === item.symbol ? 'active' : ''}`}
                  onClick={(e) => handleTickerClick(item.symbol, e)}
                >
                  <span className="font-medium">{item.symbol}</span>
                  <span className="ml-2">${item.price?.toFixed(2) ?? 'N/A'}</span>
                  <span 
                    className={`ml-2 flex items-center ${
                      item.changePercent >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {item.changePercent >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(item.changePercent).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {expandedSymbol && marketData[expandedSymbol] && (
          <div className="absolute top-full left-0 w-full z-50 bg-background/95 backdrop-blur-sm border rounded-b-lg shadow-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">
                  {expandedSymbol}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(marketData[expandedSymbol].lastUpdated).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">${marketData[expandedSymbol].price.toFixed(2)}</p>
                <p className={`text-sm ${marketData[expandedSymbol].changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {marketData[expandedSymbol].changePercent >= 0 ? "+" : ""}
                  {marketData[expandedSymbol].changePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <TickerConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        currentConfig={config}
        onSave={onConfigUpdate}
      />
    </>
  )
}

