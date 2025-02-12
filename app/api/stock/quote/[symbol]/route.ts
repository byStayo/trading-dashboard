import { NextResponse } from "next/server"
import { polygonService } from "@/lib/api/polygon-service"

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase()
    const [quote, aggregates] = await Promise.all([
      polygonService.getLastQuote(symbol),
      polygonService.getAggregates(
        symbol,
        1,
        'day',
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      ),
    ])

    // Calculate price and change
    const midPrice = (quote.results.P + quote.results.p) / 2
    const prevClose = aggregates.results[0].c
    const change = midPrice - prevClose
    const changePercent = (change / prevClose) * 100

    return NextResponse.json({
      symbol,
      price: midPrice,
      change,
      changePercent,
      timestamp: quote.results.t,
    })
  } catch (error) {
    console.error(`Error fetching quote for ${params.symbol}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    )
  }
} 