import { NextRequest, NextResponse } from "next/server"

// Constants
const MAX_TICKERS = 50 // Maximum number of tickers per request
const RATE_LIMIT_DURATION = 60000 // 1 minute
const MAX_REQUESTS = 3 // Lower limit for batch requests
const requestLog = new Map<string, { count: number; timestamp: number }>()

// Types
interface StockResult {
  symbol: string
  price: number | null
  previousClose: number | null
  change: number | null
  changePercent: number | null
  volume: number | null
  dayOpen: number | null
  dayHigh: number | null
  dayLow: number | null
  lastUpdated: number | null
  status: "success" | "error"
  error?: string
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

// Input validation
function validateTickers(tickers: string[]): string[] {
  return tickers.filter(ticker => /^[A-Z]{1,5}$/.test(ticker))
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

    // Get and validate tickers
    const searchParams = request.nextUrl.searchParams
    const tickersParam = searchParams.get("tickers")
    
    if (!tickersParam) {
      return NextResponse.json(
        { error: "Tickers parameter is required (comma-separated list)" },
        { status: 400 }
      )
    }

    let tickers = tickersParam.split(",").map(t => t.trim().toUpperCase())
    
    // Validate tickers
    tickers = validateTickers(tickers)
    
    if (tickers.length === 0) {
      return NextResponse.json(
        { error: "No valid tickers provided" },
        { status: 400 }
      )
    }

    if (tickers.length > MAX_TICKERS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_TICKERS} tickers allowed per request` },
        { status: 400 }
      )
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // Use the Polygon Stocks Snapshot endpoint for efficient batch retrieval
    const snapshotUrl = `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${today}?adjusted=true&apiKey=${apiKey}`

    const response = await fetch(snapshotUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch batch data: ${response.statusText}`)
    }

    const data = await response.json()

    // Create a map for quick ticker lookup
    const tickerMap = new Map<string, AggregateResult>(
      data.results?.map((result: AggregateResult) => [result.T, result]) || []
    )

    // Transform the response
    const results: StockResult[] = tickers.map(ticker => {
      const stockData = tickerMap.get(ticker)
      
      if (!stockData) {
        return {
          symbol: ticker,
          price: null,
          previousClose: null,
          change: null,
          changePercent: null,
          volume: null,
          dayOpen: null,
          dayHigh: null,
          dayLow: null,
          lastUpdated: null,
          status: "error",
          error: "No data available"
        }
      }

      const currentPrice = stockData.c
      const previousClose = stockData.o
      const priceChange = currentPrice - previousClose
      const changePercent = (priceChange / previousClose) * 100

      return {
        symbol: ticker,
        price: currentPrice,
        previousClose: previousClose,
        change: Number(priceChange.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: stockData.v,
        dayOpen: stockData.o,
        dayHigh: stockData.h,
        dayLow: stockData.l,
        lastUpdated: stockData.t,
        status: "success"
      }
    })

    return NextResponse.json({
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error(`Error fetching batch stock data: ${error.message}`)
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch batch stock data",
        status: "error",
        timestamp: new Date().toISOString()
      },
      { status: error.status || 500 }
    )
  }
} 