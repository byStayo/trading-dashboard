import React, { createContext, useContext, useEffect, useState } from 'react'
import { MarketData } from '../hooks/use-market-data'
import { StockData } from '../hooks/use-stock-data'

interface MarketContextType {
  marketData: MarketData | null
  watchlist: Record<string, StockData>
  portfolio: Record<string, StockData>
  isLoading: boolean
  error: Error | null
  addToWatchlist: (symbol: string) => void
  removeFromWatchlist: (symbol: string) => void
  updatePortfolio: (holdings: string[]) => void
  refetchMarketData: () => Promise<void>
}

const MarketContext = createContext<MarketContextType | undefined>(undefined)

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [watchlist, setWatchlist] = useState<Record<string, StockData>>({})
  const [portfolio, setPortfolio] = useState<Record<string, StockData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchMarketData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/polygon-stocks/market')
      if (!response.ok) {
        throw new Error('Failed to fetch market data')
      }

      const data = await response.json()
      setMarketData(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWatchlistData = async (symbols: string[]) => {
    if (!symbols.length) return

    try {
      const response = await fetch(`/api/polygon-stocks/batch?tickers=${symbols.join(',')}`)
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist data')
      }

      const data = await response.json()
      const stocksRecord = data.results.reduce((acc: Record<string, StockData>, stock: StockData) => {
        acc[stock.symbol] = stock
        return acc
      }, {})

      setWatchlist(stocksRecord)
    } catch (err) {
      console.error('Error fetching watchlist data:', err)
    }
  }

  const fetchPortfolioData = async (symbols: string[]) => {
    if (!symbols.length) return

    try {
      const response = await fetch(`/api/polygon-stocks/batch?tickers=${symbols.join(',')}`)
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data')
      }

      const data = await response.json()
      const stocksRecord = data.results.reduce((acc: Record<string, StockData>, stock: StockData) => {
        acc[stock.symbol] = stock
        return acc
      }, {})

      setPortfolio(stocksRecord)
    } catch (err) {
      console.error('Error fetching portfolio data:', err)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchMarketData()
    // Set up polling every minute
    const interval = setInterval(fetchMarketData, 60000)
    return () => clearInterval(interval)
  }, [])

  const addToWatchlist = (symbol: string) => {
    fetchWatchlistData([...Object.keys(watchlist), symbol])
  }

  const removeFromWatchlist = (symbol: string) => {
    const newWatchlist = { ...watchlist }
    delete newWatchlist[symbol]
    setWatchlist(newWatchlist)
  }

  const updatePortfolio = (holdings: string[]) => {
    fetchPortfolioData(holdings)
  }

  return (
    <MarketContext.Provider
      value={{
        marketData,
        watchlist,
        portfolio,
        isLoading,
        error,
        addToWatchlist,
        removeFromWatchlist,
        updatePortfolio,
        refetchMarketData: fetchMarketData,
      }}
    >
      {children}
    </MarketContext.Provider>
  )
}

export function useMarket() {
  const context = useContext(MarketContext)
  if (context === undefined) {
    throw new Error('useMarket must be used within a MarketProvider')
  }
  return context
} 