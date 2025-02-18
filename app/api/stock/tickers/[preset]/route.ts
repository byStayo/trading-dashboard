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

const TRENDING_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM',
  'V', 'WMT', 'UNH', 'JNJ', 'MA', 'PG', 'HD', 'BAC', 'AVGO', 'XOM'
]

const SECTOR_TICKERS = {
  technology: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'AVGO', 'CRM', 'ADBE', 'ORCL', 'CSCO'],
  healthcare: ['UNH', 'JNJ', 'LLY', 'PFE', 'ABT', 'TMO', 'MRK', 'DHR', 'BMY', 'ABBV'],
  finance: ['JPM', 'V', 'MA', 'BAC', 'WFC', 'MS', 'GS', 'BLK', 'C', 'AXP'],
  consumer: ['AMZN', 'WMT', 'PG', 'HD', 'MCD', 'NKE', 'COST', 'PEP', 'KO', 'DIS']
}

export async function GET(
  request: Request,
  { params }: { params: { preset: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const sector = searchParams.get('sector')
    const customTickers = searchParams.get('tickers')?.split(',')
    const cacheKey = `${params.preset}-${sector || ''}`

    // Check cache
    const cached = tickerListCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ tickers: cached.tickers })
    }

    let tickers: string[] = []

    switch (params.preset) {
      case 'trending':
        tickers = TRENDING_TICKERS
        break
      case 'sector':
        if (!sector || !SECTOR_TICKERS[sector as keyof typeof SECTOR_TICKERS]) {
          return NextResponse.json(
            { error: 'Invalid sector' },
            { status: 400 }
          )
        }
        tickers = SECTOR_TICKERS[sector as keyof typeof SECTOR_TICKERS]
        break
      case 'custom':
        if (!customTickers || customTickers.length === 0) {
          return NextResponse.json(
            { error: 'No tickers provided' },
            { status: 400 }
          )
        }
        tickers = customTickers
        break
      default:
        return NextResponse.json(
          { error: 'Invalid preset' },
          { status: 400 }
        )
    }

    // Validate the tickers exist on Polygon
    const snapshot = await polygonService.getSnapshots(tickers)
    if (snapshot.status === 'error' || !snapshot.tickers) {
      throw new Error('Failed to validate tickers')
    }

    // Only return tickers that have valid data
    const validTickers = snapshot.tickers
      .filter(ticker => ticker.lastTrade && ticker.day)
      .map(ticker => ticker.ticker)

    // Update cache
    tickerListCache.set(cacheKey, {
      tickers: validTickers,
      timestamp: Date.now(),
    })

    return NextResponse.json({ tickers: validTickers })
  } catch (error) {
    console.error('Error in tickers endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickers' },
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