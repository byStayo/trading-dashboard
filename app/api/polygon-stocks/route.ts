import { NextRequest, NextResponse } from "next/server"

// Rate limit helper
const RATE_LIMIT_DURATION = 60000 // 1 minute
const MAX_REQUESTS = 5
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

// Input validation
function validateTicker(ticker: string): boolean {
  // Basic ticker validation: 1-5 uppercase letters
  return /^[A-Z]{1,5}$/.test(ticker)
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

    // Get and validate ticker
    const searchParams = request.nextUrl.searchParams
    const ticker = searchParams.get("ticker")?.toUpperCase()
    
    if (!ticker || !validateTicker(ticker)) {
      return NextResponse.json(
        { error: "Invalid ticker symbol. Please provide a valid stock symbol." },
        { status: 400 }
      )
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // Construct URLs for parallel requests
    const urls = {
      previousClose: `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey}`,
      dailyOpen: `https://api.polygon.io/v1/open-close/${ticker}/${today}?adjusted=true&apiKey=${apiKey}`,
      details: `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${apiKey}`,
      // Use minute aggregates for current price instead of last trade
      currentAgg: `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/minute/2024-01-01/${today}?adjusted=true&sort=desc&limit=1&apiKey=${apiKey}`
    }

    // Make parallel requests
    const [previousCloseResponse, dailyOpenResponse, detailsResponse, currentAggResponse] = await Promise.all([
      fetch(urls.previousClose),
      fetch(urls.dailyOpen),
      fetch(urls.details),
      fetch(urls.currentAgg)
    ])

    // Check for any failed requests
    const responses = [
      { name: 'previous close', response: previousCloseResponse },
      { name: 'details', response: detailsResponse },
      { name: 'current aggregates', response: currentAggResponse }
    ]

    for (const { name, response } of responses) {
      if (!response.ok) {
        console.error(`Failed to fetch ${name} data:`, await response.text())
        throw new Error(`Failed to fetch ${name} data: ${response.statusText}`)
      }
    }

    // Parse all responses
    const [previousCloseData, detailsData, currentAggData] = await Promise.all([
      previousCloseResponse.json(),
      detailsResponse.json(),
      currentAggResponse.json()
    ])

    // Parse daily open data if available
    const dailyOpenData = dailyOpenResponse.ok ? await dailyOpenResponse.json() : null

    // Extract and calculate values
    const previousClose = previousCloseData.results?.[0]?.c || null
    const currentPrice = currentAggData.results?.[0]?.c || previousClose
    const priceChange = currentPrice && previousClose ? currentPrice - previousClose : null
    const changePercent = currentPrice && previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : null
    
    // Build enhanced response
    const response = {
      symbol: ticker,
      name: detailsData.results?.name || null,
      price: currentPrice,
      previousClose,
      change: priceChange ? Number(priceChange.toFixed(2)) : null,
      changePercent: changePercent ? Number(changePercent.toFixed(2)) : null,
      lastUpdated: currentAggData.results?.[0]?.t || null,
      volume: currentAggData.results?.[0]?.v || null,
      dayOpen: dailyOpenData?.open || null,
      dayHigh: dailyOpenData?.high || null,
      dayLow: dailyOpenData?.low || null,
      marketCap: detailsData.results?.market_cap || null,
      exchange: detailsData.results?.primary_exchange || null,
      type: detailsData.results?.type || null,
      status: "success",
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error(`Error fetching stock data: ${error.message}`)
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch stock data",
        status: "error",
        timestamp: new Date().toISOString()
      },
      { status: error.status || 500 }
    )
  }
} 