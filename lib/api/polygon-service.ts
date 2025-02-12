import axios from 'axios';

const POLYGON_BASE_URL = 'https://api.polygon.io';
const POLYGON_WS_URL = 'wss://delayed.polygon.io/stocks';

interface SnapshotTicker {
  ticker: string;
  day: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  lastTrade: {
    p: number;
    s: number;
    t: number;
    c: number[];
  };
  min: {
    av: number;
    vw: number;
    o: number;
    c: number;
    h: number;
    l: number;
    v: number;
    t: number;
  };
  prevDay: {
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    vw: number;
  };
  todaysChange: number;
  todaysChangePerc: number;
  updated: number;
}

interface SnapshotResponse {
  status: string;
  tickers: SnapshotTicker[];
}

export class PolygonService {
  private apiKey: string;
  private baseUrl: string;
  private wsUrl: string;

  constructor() {
    this.apiKey = process.env.POLYGON_API_KEY || '';
    this.baseUrl = POLYGON_BASE_URL;
    this.wsUrl = POLYGON_WS_URL;
  }

  // Aggregates (bars) for charts
  async getAggregates(
    ticker: string,
    multiplier: number,
    timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year',
    from: string,
    to: string
  ) {
    const url = `${this.baseUrl}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`;
    const response = await axios.get(url, {
      params: {
        adjusted: true,
        sort: 'asc',
        limit: 50000,
        apiKey: this.apiKey,
      },
    });
    return response.data;
  }

  // Get company details
  async getTickerDetails(ticker: string) {
    const url = `${this.baseUrl}/v3/reference/tickers/${ticker}`;
    const response = await axios.get(url, {
      params: {
        apiKey: this.apiKey,
      },
    });
    return response.data;
  }

  // Get real-time quotes
  async getLastQuote(ticker: string) {
    const url = `${this.baseUrl}/v2/last/nbbo/${ticker}`;
    const response = await axios.get(url, {
      params: {
        apiKey: this.apiKey,
      },
    });
    return response.data;
  }

  // Get market news
  async getMarketNews(ticker?: string, limit: number = 10) {
    const url = `${this.baseUrl}/v2/reference/news`;
    const response = await axios.get(url, {
      params: {
        ticker,
        limit,
        apiKey: this.apiKey,
      },
    });
    return response.data;
  }

  // Get market status
  async getMarketStatus() {
    const url = `${this.baseUrl}/v1/marketstatus/now`;
    const response = await axios.get(url, {
      params: {
        apiKey: this.apiKey,
      },
    });
    return response.data;
  }

  // Search tickers
  async searchTickers(search: string, limit: number = 10) {
    const url = `${this.baseUrl}/v3/reference/tickers`;
    const response = await axios.get(url, {
      params: {
        search,
        limit,
        market: 'stocks',
        active: true,
        apiKey: this.apiKey,
      },
    });
    return response.data;
  }

  // Get snapshots for multiple tickers
  async getSnapshots(tickers: string[]): Promise<SnapshotResponse> {
    const url = `${this.baseUrl}/v2/snapshot/locale/us/markets/stocks/tickers`;
    const response = await axios.get(url, {
      params: {
        tickers: tickers.join(','),
        apiKey: this.apiKey,
      },
    });
    return response.data;
  }
}

// Export singleton instance
export const polygonService = new PolygonService(); 