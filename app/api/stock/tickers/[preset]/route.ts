import { NextResponse } from "next/server"
import { polygonService } from "@/lib/api/polygon-service"
import { TickerDetails } from "@/types/polygon"

interface SnapshotTicker {
  ticker: string;
  day?: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  lastTrade?: {
    p: number;
    s: number;
    t: number;
    c: number[];
  };
  min?: {
    av: number;
    vw: number;
    o: number;
    c: number;
    h: number;
    l: number;
    v: number;
    t: number;
  };
  prevDay?: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  todaysChange?: number;
  todaysChangePerc?: number;
  updated?: number;
}

// Cache for ticker lists
const tickerListCache = new Map<string, {
  tickers: string[];
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(
  request: Request,
  { params }: { params: { preset: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const sector = searchParams.get('sector')
    const cacheKey = `${params.preset}-${sector || ''}`

    // Check cache
    const cached = tickerListCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ tickers: cached.tickers })
    }

    let tickers: string[] = []

    switch (params.preset) {
      case 'trending':
        // Get most actively traded stocks
        const snapshot = await polygonService.getSnapshots(['SPY'])
        const marketData = snapshot.tickers[0]
        const marketOpen = marketData?.day?.o || 0
        const marketClose = marketData?.day?.c || 0
        const marketChange = ((marketClose - marketOpen) / marketOpen) * 100

        // Get stocks moving with/against the market trend
        const allStocksSnapshot = await polygonService.getSnapshots([])
        const trendingStocks = allStocksSnapshot.tickers
          .filter((t: SnapshotTicker) => {
            const dayData = t.day
            if (!dayData) return false
            const change = ((dayData.c - dayData.o) / dayData.o) * 100
            // Filter stocks with significant volume and price movement
            return dayData.v > 500000 && Math.abs(change) > Math.abs(marketChange)
          })
          .sort((a: SnapshotTicker, b: SnapshotTicker) => (b.day?.v || 0) - (a.day?.v || 0))
          .slice(0, 20)
          .map((t: SnapshotTicker) => t.ticker)

        tickers = trendingStocks
        break

      case 'gainers':
        const gainers = await polygonService.getSnapshots([])
        tickers = gainers.tickers
          .filter((t: SnapshotTicker) => t.day && t.day.o > 0)
          .map((t: SnapshotTicker) => ({
            ticker: t.ticker,
            change: ((t.day!.c - t.day!.o) / t.day!.o) * 100
          }))
          .sort((a: { ticker: string; change: number }, b: { ticker: string; change: number }) => b.change - a.change)
          .slice(0, 20)
          .map(t => t.ticker)
        break

      case 'losers':
        const losers = await polygonService.getSnapshots([])
        tickers = losers.tickers
          .filter((t: SnapshotTicker) => t.day && t.day.o > 0)
          .map((t: SnapshotTicker) => ({
            ticker: t.ticker,
            change: ((t.day!.c - t.day!.o) / t.day!.o) * 100
          }))
          .sort((a: { ticker: string; change: number }, b: { ticker: string; change: number }) => a.change - b.change)
          .slice(0, 20)
          .map(t => t.ticker)
        break

      case 'mixed':
        // Get a mix of gainers and losers
        const mixed = await polygonService.getSnapshots([])
        const sortedByChange = mixed.tickers
          .filter((t: SnapshotTicker) => t.day && t.day.o > 0)
          .map((t: SnapshotTicker) => ({
            ticker: t.ticker,
            change: ((t.day!.c - t.day!.o) / t.day!.o) * 100
          }))
          .sort((a: { ticker: string; change: number }, b: { ticker: string; change: number }) => Math.abs(b.change) - Math.abs(a.change))
        
        tickers = sortedByChange
          .slice(0, 20)
          .map(t => t.ticker)
        break

      case 'sp500':
        // Get S&P 500 components by market cap
        const sp500 = await polygonService.searchTickers('', 505)
        tickers = sp500.results
          .filter((t: TickerDetails) => t.market === 'stocks' && t.active)
          .sort((a: TickerDetails, b: TickerDetails) => (b.market_cap || 0) - (a.market_cap || 0))
          .slice(0, 20)
          .map((t: TickerDetails) => t.ticker)
        break

      case 'weighted':
        // Get top weighted stocks by market cap
        const weighted = await polygonService.searchTickers('', 100)
        tickers = weighted.results
          .filter((t: TickerDetails) => t.market === 'stocks' && t.active)
          .sort((a: TickerDetails, b: TickerDetails) => (b.market_cap || 0) - (a.market_cap || 0))
          .slice(0, 20)
          .map((t: TickerDetails) => t.ticker)
        break

      case 'marketCap':
        const marketCap = await polygonService.searchTickers('', 100)
        tickers = marketCap.results
          .filter((t: TickerDetails) => t.market === 'stocks' && t.active)
          .sort((a: TickerDetails, b: TickerDetails) => (b.market_cap || 0) - (a.market_cap || 0))
          .slice(0, 20)
          .map((t: TickerDetails) => t.ticker)
        break

      case 'sector':
        if (!sector) {
          return NextResponse.json(
            { error: "Sector parameter is required" },
            { status: 400 }
          )
        }
        // Use predefined sector tickers
        tickers = getSectorTickers(sector)
        if (tickers.length === 0) {
          return NextResponse.json(
            { error: "Invalid sector" },
            { status: 400 }
          )
        }
        break

      case 'indices':
        // Major market indices ETFs
        tickers = ['SPY', 'QQQ', 'DIA', '^VIX']
        break

      case 'custom':
        // Return the custom tickers from the query params
        const customTickers = searchParams.get('tickers')
        if (!customTickers) {
          return NextResponse.json(
            { error: "Custom tickers parameter is required" },
            { status: 400 }
          )
        }
        tickers = customTickers.split(',').map(t => t.trim().toUpperCase())
        break

      default:
        return NextResponse.json(
          { error: "Invalid preset" },
          { status: 400 }
        )
    }

    // Update cache
    tickerListCache.set(cacheKey, {
      tickers,
      timestamp: Date.now(),
    })

    return NextResponse.json({ tickers })
  } catch (error) {
    console.error(`Error fetching tickers for preset ${params.preset}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch tickers" },
      { status: 500 }
    )
  }
}

function getSectorTickers(sector: string): string[] {
  const sectorMap: { [key: string]: string[] } = {
    'Technology': ['AAPL', 'MSFT', 'NVDA', 'ADBE', 'CRM', 'CSCO', 'INTC', 'AMD', 'ORCL', 'IBM'],
    'Healthcare': ['JNJ', 'UNH', 'PFE', 'ABT', 'TMO', 'MRK', 'DHR', 'BMY', 'ABBV', 'LLY'],
    'Financials': ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'BLK', 'AXP', 'USB', 'PNC'],
    'Consumer Discretionary': ['AMZN', 'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'LOW', 'BKNG', 'TJX', 'MAR'],
    'Consumer Staples': ['PG', 'KO', 'PEP', 'WMT', 'COST', 'PM', 'MO', 'EL', 'CL', 'KMB'],
    'Industrials': ['HON', 'UNP', 'UPS', 'BA', 'CAT', 'GE', 'MMM', 'LMT', 'RTX', 'DE'],
    'Energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'KMI'],
    'Materials': ['LIN', 'APD', 'ECL', 'SHW', 'FCX', 'NEM', 'DOW', 'DD', 'NUE', 'VMC'],
    'Utilities': ['NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'XEL', 'PEG', 'WEC'],
    'Real Estate': ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'DLR', 'O', 'WELL', 'AVB', 'EQR'],
    'Communication Services': ['GOOGL', 'META', 'NFLX', 'CMCSA', 'VZ', 'T', 'TMUS', 'DIS', 'ATVI', 'EA'],
  }

  return sectorMap[sector] || []
} 