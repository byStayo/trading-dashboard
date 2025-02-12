import { NextResponse } from "next/server"
import { polygonService } from "@/lib/api/polygon-service"

// Cache for previous day data
const prevDayCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase()

    // Check cache
    const cached = prevDayCache.get(symbol)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    // Get previous day's data
    const [prevDay, details] = await Promise.all([
      polygonService.getAggregates(
        symbol,
        1,
        'day',
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      ),
      polygonService.getTickerDetails(symbol)
    ])

    if (!prevDay.results || prevDay.results.length === 0) {
      return NextResponse.json(
        { error: "No data available" },
        { status: 404 }
      )
    }

    const data = {
      symbol,
      description: details.results?.description,
      o: prevDay.results[0].o,
      h: prevDay.results[0].h,
      l: prevDay.results[0].l,
      c: prevDay.results[0].c,
      v: prevDay.results[0].v,
      vw: prevDay.results[0].vw,
      t: prevDay.results[0].t
    }

    // Update cache
    prevDayCache.set(symbol, {
      data,
      timestamp: Date.now()
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error fetching previous day data for ${params.symbol}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch previous day data" },
      { status: 500 }
    )
  }
} 