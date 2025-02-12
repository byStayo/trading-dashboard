import { z } from 'zod'

// Validation schemas for API responses
const AggregateBarSchema = z.object({
  c: z.number(), // close price
  h: z.number(), // high price
  l: z.number(), // low price
  o: z.number(), // open price
  v: z.number(), // volume
  vw: z.number(), // volume weighted average price
  t: z.number(), // timestamp
})

const AggregatesResponseSchema = z.object({
  ticker: z.string(),
  queryCount: z.number(),
  resultsCount: z.number(),
  adjusted: z.boolean(),
  results: z.array(AggregateBarSchema),
  status: z.string(),
  request_id: z.string(),
  count: z.number(),
})

// Types based on validation schemas
export type AggregateBar = z.infer<typeof AggregateBarSchema>
export type AggregatesResponse = z.infer<typeof AggregatesResponseSchema>

export interface TimeRange {
  from: Date
  to: Date
}

// Types for Polygon.io API responses
export interface SnapshotResponse {
  status: string
  tickers: {
    ticker: string
    day: {
      o: number
      h: number
      l: number
      c: number
      v: number
      vw: number
    }
    lastTrade: {
      p: number
      s: number
      t: number
      c: number[]
    }
    min: {
      av: number
      vw: number
      o: number
      c: number
      h: number
      l: number
      v: number
      t: number
    }
    prevDay: {
      o: number
      h: number
      l: number
      c: number
      v: number
      vw: number
    }
    todaysChange: number
    todaysChangePerc: number
    updated: number
  }[]
}

export interface TickerDetailsResponse {
  status: string
  results: {
    ticker: string
    name: string
    market: string
    locale: string
    primary_exchange: string
    type: string
    active: boolean
    currency_name: string
    cik: string
    composite_figi: string
    share_class_figi: string
    market_cap: number
    phone_number: string
    address: {
      address1: string
      city: string
      state: string
      postal_code: string
    }
    description: string
    sic_code: string
    sic_description: string
    ticker_root: string
    homepage_url: string
    total_employees: number
    list_date: string
    branding: {
      logo_url: string
      icon_url: string
    }
    share_class_shares_outstanding: number
    weighted_shares_outstanding: number
  }
}

export interface TechnicalIndicatorsResponse {
  status: string
  results: {
    underlying: {
      aggregates: AggregatesResponse['results']
    }
    values: {
      timestamp: number
      value: number
    }[]
  }
}

export class PolygonService {
  private readonly baseUrl = 'https://api.polygon.io'
  private readonly apiKey: string

  constructor() {
    const apiKey = process.env.POLYGON_API_KEY
    if (!apiKey) {
      throw new Error('Polygon API key not set')
    }
    this.apiKey = apiKey
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const searchParams = new URLSearchParams({
      ...params,
      apiKey: this.apiKey,
    })

    const response = await fetch(`${this.baseUrl}${endpoint}?${searchParams}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API call failed: ${errorText}`)
    }

    return response.json()
  }

  // Aggregates endpoints
  async getAggregates(
    ticker: string,
    multiplier: number,
    timespan: string,
    from: string,
    to: string,
    adjusted: boolean = true
  ): Promise<AggregatesResponse> {
    return this.fetch<AggregatesResponse>(
      `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`,
      { adjusted: adjusted.toString() }
    )
  }

  // Snapshot endpoints
  async getSnapshots(tickers: string[]): Promise<SnapshotResponse> {
    return this.fetch<SnapshotResponse>(
      `/v2/snapshot/locale/us/markets/stocks/tickers`,
      { tickers: tickers.join(',') }
    )
  }

  // Technical indicators
  async getSMA(
    ticker: string,
    timespan: string,
    window: number,
    from: string,
    to: string
  ): Promise<TechnicalIndicatorsResponse> {
    return this.fetch<TechnicalIndicatorsResponse>(
      `/v1/indicators/sma/${ticker}`,
      {
        timespan,
        window: window.toString(),
        timestamp: `${from}:${to}`,
      }
    )
  }

  async getRSI(
    ticker: string,
    timespan: string,
    window: number,
    from: string,
    to: string
  ): Promise<TechnicalIndicatorsResponse> {
    return this.fetch<TechnicalIndicatorsResponse>(
      `/v1/indicators/rsi/${ticker}`,
      {
        timespan,
        window: window.toString(),
        timestamp: `${from}:${to}`,
      }
    )
  }

  // Ticker details
  async getTickerDetails(ticker: string): Promise<TickerDetailsResponse> {
    return this.fetch<TickerDetailsResponse>(`/v3/reference/tickers/${ticker}`)
  }

  /**
   * Formats a date range for the API query
   */
  static formatDateRange(from: Date, to: Date): TimeRange {
    return {
      from: new Date(from.setHours(0, 0, 0, 0)),
      to: new Date(to.setHours(23, 59, 59, 999))
    }
  }
}

// Export singleton instance
export const polygonService = new PolygonService() 