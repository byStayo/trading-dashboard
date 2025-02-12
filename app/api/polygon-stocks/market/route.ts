import { NextRequest, NextResponse } from "next/server"

// Constants
const RATE_LIMIT_DURATION = 60000 // 1 minute
const MAX_REQUESTS = 5
const requestLog = new Map<string, { count: number; timestamp: number }>()

// Major indices to track
const INDICES = ["SPY", "QQQ", "DIA", "IWM"]

// Sector ETFs mapping
const SECTOR_ETFS = {
  "XLK": "Technology",
  "XLF": "Financials",
  "XLV": "Healthcare",
  "XLE": "Energy",
  "XLI": "Industrials",
  "XLP": "Consumer Staples",
  "XLY": "Consumer Discretionary",
  "XLB": "Materials",
  "XLU": "Utilities",
  "XLRE": "Real Estate",
  "XLC": "Communication Services"
}

// Types
interface MarketIndex {
  symbol: string
  name: string
  price: number | null
  change: number | null
  changePercent: number | null
  volume: number | null
}

interface SectorPerformance {
  sector: string
  symbol: string
  price: number | null
  change: number | null
  changePercent: number | null
  volume: number | null
  previousClose: number | null
  updated: number | null
  marketCap: number | null
}

interface StockResult {
  symbol: string
  price: number | null
  change: number | null
  changePercent: number | null
  volume: number | null
}

interface MarketBreadth {
  advancing: number
  declining: number
  unchanged: number
  totalSectors: number
  averagePerformance: number
}

interface MarketData {
  indices: MarketIndex[]
  topGainers: StockResult[]
  topLosers: StockResult[]
  mostActive: StockResult[]
  sectors: SectorPerformance[]
  marketBreadth: MarketBreadth
  timestamp: string
}

interface AggregateResult {
  T: string // Ticker
  c: number // Close price
  h: number // High price
  l: number // Low price
  n: number // Number of transactions
  o: number // Open price
  t: number // Timestamp
  v: number // Volume
  vw: number // Volume weighted average price
}

// Rate limit helper
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const userRequests = requestLog.get(ip)

  if (!userRequests) {
    requestLog.set(ip, { count: 1, timestamp: now })
    return false
  }

  if (now - userRequests.timestamp > RATE_LIMIT_DURATION) {
    requestLog.set(ip, { count: 1, timestamp: now })
    return false
  }

  if (userRequests.count >= MAX_REQUESTS) {
    return true
  }

  userRequests.count++
  return false
}

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.POLYGON_API_KEY
    if (!apiKey) {
      throw new Error("Polygon API key not set")
    }

    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown"
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // Construct URLs for parallel requests
    const urls = {
      allStocks: `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${today}?adjusted=true&apiKey=${apiKey}`,
      details: `https://api.polygon.io/v3/reference/tickers?type=CS&market=stocks&active=true&sort=market_cap&order=desc&limit=1000&apiKey=${apiKey}`
    }

    // Make parallel requests
    const [stocksResponse, detailsResponse] = await Promise.all([
      fetch(urls.allStocks),
      fetch(urls.details)
    ])

    // Check responses
    if (!stocksResponse.ok || !detailsResponse.ok) {
      throw new Error("Failed to fetch market data")
    }

    // Parse responses
    const [stocksData, detailsData] = await Promise.all([
      stocksResponse.json(),
      detailsResponse.json()
    ])

    // Create maps for quick lookups
    const stocksMap = new Map<string, AggregateResult>(
      stocksData.results?.map((result: AggregateResult) => [result.T, result]) || []
    )

    const detailsMap = new Map(
      detailsData.results?.map((result: any) => [result.ticker, result]) || []
    )

    // Transform indices data
    const indices: MarketIndex[] = INDICES.map(symbol => {
      const stockData = stocksMap.get(symbol)
      if (!stockData) return {
        symbol,
        name: getIndexName(symbol),
        price: null,
        change: null,
        changePercent: null,
        volume: null
      }

      const priceChange = stockData.c - stockData.o
      const changePercent = (priceChange / stockData.o) * 100

      return {
        symbol,
        name: getIndexName(symbol),
        price: stockData.c,
        change: Number(priceChange.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: stockData.v
      }
    })

    // Transform all stocks for gainers/losers/active lists
    const allStocks = stocksData.results?.map((stock: AggregateResult) => {
      const priceChange = stock.c - stock.o
      const changePercent = (priceChange / stock.o) * 100

      return {
        symbol: stock.T,
        price: stock.c,
        change: Number(priceChange.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: stock.v
      }
    }) || []

    // Sort for different lists
    const topGainers = [...allStocks]
      .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))
      .slice(0, 5)

    const topLosers = [...allStocks]
      .sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0))
      .slice(0, 5)

    const mostActive = [...allStocks]
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 5)

    // Transform sector data
    const sectors: SectorPerformance[] = Object.entries(SECTOR_ETFS).map(([symbol, sector]) => {
      const stockData = stocksMap.get(symbol)
      if (!stockData) return {
        sector,
        symbol,
        price: null,
        change: null,
        changePercent: null,
        volume: null,
        previousClose: null,
        updated: null,
        marketCap: null
      }

      const priceChange = stockData.c - stockData.o
      const changePercent = (priceChange / stockData.o) * 100

      return {
        sector,
        symbol,
        price: stockData.c,
        change: Number(priceChange.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: stockData.v,
        previousClose: stockData.o,
        updated: stockData.t,
        marketCap: stockData.vw * stockData.v
      }
    }).sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))

    // Calculate market breadth
    const gainingSectors = sectors.filter(sector => (sector.changePercent || 0) > 0)
    const losingSectors = sectors.filter(sector => (sector.changePercent || 0) < 0)

    const marketBreadth: MarketBreadth = {
      advancing: gainingSectors.length,
      declining: losingSectors.length,
      unchanged: sectors.length - gainingSectors.length - losingSectors.length,
      totalSectors: sectors.length,
      averagePerformance: sectors.reduce((acc, sector) => acc + (sector.changePercent || 0), 0) / sectors.length
    }

    // Construct response
    const marketData: MarketData = {
      indices,
      topGainers,
      topLosers,
      mostActive,
      sectors,
      marketBreadth,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(marketData)

  } catch (error: any) {
    console.error(`Error fetching market data: ${error.message}`)
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch market data",
        status: "error",
        timestamp: new Date().toISOString()
      },
      { status: error.status || 500 }
    )
  }
}

function getIndexName(symbol: string): string {
  const indexNames: { [key: string]: string } = {
    "SPY": "S&P 500",
    "QQQ": "NASDAQ 100",
    "DIA": "Dow Jones Industrial Average",
    "IWM": "Russell 2000"
  }
  return indexNames[symbol] || symbol
} 