"use client"

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
}

interface MarketDataResponse {
  marketData: MarketData[] | null
  isLoading: boolean
  isError: boolean
}

// Mock data for development
const mockMarketData: MarketData[] = [
  { symbol: "AAPL", price: 150.25, change: 2.5, changePercent: 1.69 },
  { symbol: "GOOGL", price: 2750.8, change: -15.2, changePercent: -0.55 },
  { symbol: "MSFT", price: 305.15, change: 1.8, changePercent: 0.59 },
  { symbol: "AMZN", price: 3380.5, change: -22.3, changePercent: -0.66 },
  { symbol: "META", price: 325.75, change: 5.2, changePercent: 1.62 },
]

export function useMarketData(): MarketDataResponse {
  // For development, return mock data directly
  return {
    marketData: mockMarketData,
    isLoading: false,
    isError: false,
  }

  // For production, uncomment this:
  /*
  const { data, error } = useSWR<MarketData[]>('/api/market-data', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  return {
    marketData: data ?? null,
    isLoading: !error && !data,
    isError: !!error,
  }
  */
}

