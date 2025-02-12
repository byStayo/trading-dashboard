import { NextRequest, NextResponse } from "next/server"

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

// Rate limiting setup
const RATE_LIMIT_DURATION = 60000 // 1 minute
const MAX_REQUESTS = 3
const requestLog = new Map<string, { count: number; timestamp: number }>()

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

    // Get all sector ETFs data in parallel
    const sectorTickers = Object.keys(SECTOR_ETFS)
    const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${sectorTickers.join(",")}&apiKey=${apiKey}`

    const response = await fetch(snapshotUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch sector data: ${response.statusText}`)
    }

    const data = await response.json()

    // Transform the data into sector performance metrics
    const sectorPerformance = data.tickers?.map((ticker: any) => {
      const symbol = ticker.ticker
      const sectorName = SECTOR_ETFS[symbol as keyof typeof SECTOR_ETFS]
      
      return {
        sector: sectorName,
        symbol: symbol,
        price: ticker.lastTrade?.p || null,
        change: ticker.todaysChange || null,
        changePercent: ticker.todaysChangePerc || null,
        volume: ticker.day?.v || null,
        previousClose: ticker.prevDay?.c || null,
        updated: ticker.updated,
        marketCap: ticker.day?.vw ? (ticker.day.vw * (ticker.day.v || 0)) : null
      }
    }).sort((a: any, b: any) => (b.changePercent || 0) - (a.changePercent || 0)) // Sort by performance

    // Add market breadth metrics
    const gainers = sectorPerformance.filter((sector: any) => sector.changePercent > 0)
    const losers = sectorPerformance.filter((sector: any) => sector.changePercent < 0)

    const marketBreadth = {
      advancing: gainers.length,
      declining: losers.length,
      unchanged: sectorPerformance.length - gainers.length - losers.length,
      totalSectors: sectorPerformance.length,
      averagePerformance: sectorPerformance.reduce((acc: number, sector: any) => 
        acc + (sector.changePercent || 0), 0) / sectorPerformance.length
    }

    return NextResponse.json({
      sectors: sectorPerformance,
      marketBreadth,
      timestamp: new Date().toISOString(),
      status: "success"
    })

  } catch (error: any) {
    console.error(`Error fetching sector data: ${error.message}`)
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch sector data",
        status: "error",
        timestamp: new Date().toISOString()
      },
      { status: error.status || 500 }
    )
  }
} 