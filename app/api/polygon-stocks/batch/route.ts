import { NextResponse } from 'next/server'
import { polygonService } from '@/lib/api/polygon-service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')

    if (!symbols) {
      return NextResponse.json({ error: 'No symbols provided' }, { status: 400 })
    }

    const tickers = symbols.split(',').map(s => s.trim()).filter(Boolean)
    
    if (tickers.length === 0) {
      return NextResponse.json({ error: 'Invalid symbols format' }, { status: 400 })
    }

    if (tickers.length > 50) {
      return NextResponse.json({ error: 'Too many symbols. Maximum is 50.' }, { status: 400 })
    }

    const response = await polygonService.getSnapshots(tickers)
    
    if (response.status === 'error' || !response.tickers) {
      throw new Error('Failed to fetch stock data from Polygon')
    }

    // Transform the response into a more convenient format
    const transformedData = response.tickers.reduce((acc, ticker) => {
      if (ticker.lastTrade && ticker.day) {
        acc[ticker.ticker] = {
          symbol: ticker.ticker,
          price: ticker.lastTrade.p,
          change: ticker.todaysChange || 0,
          changePercent: ticker.todaysChangePerc || 0,
          volume: ticker.day.v,
          lastUpdated: ticker.updated
        }
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error in polygon-stocks/batch:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    )
  }
}