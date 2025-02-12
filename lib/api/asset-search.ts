import type { Asset, AssetDetails, NewsItem } from "@/types/asset"
import { polygonService } from './polygon-service'
import { formatDistanceToNow } from 'date-fns'
import { TickerDetails, AggregateBar, NewsItem as PolygonNewsItem } from '../../types/polygon'

// Cache for search results
const searchCache = new Map<string, {
  data: Asset[];
  timestamp: number;
}>();

const SEARCH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function searchAssets(query: string): Promise<Asset[]> {
  if (!query) return [];

  // Check cache first
  const cached = searchCache.get(query);
  if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await polygonService.searchTickers(query);
    
    const assets: Asset[] = response.results.map((ticker: TickerDetails) => ({
      id: ticker.ticker,
      symbol: ticker.ticker,
      name: ticker.name,
      assetClass: ticker.market.toLowerCase(),
      price: 0, // Will be updated with real-time data
      change: 0, // Will be updated with real-time data
      score: calculateAssetScore(ticker),
    }));

    // Update cache
    searchCache.set(query, {
      data: assets,
      timestamp: Date.now(),
    });

    return assets;
  } catch (error) {
    console.error('Error searching assets:', error);
    return [];
  }
}

export async function getAssetDetails(symbol: string): Promise<AssetDetails> {
  try {
    const [details, quote, news] = await Promise.all([
      polygonService.getTickerDetails(symbol),
      polygonService.getLastQuote(symbol),
      polygonService.getMarketNews(symbol, 5),
    ]);

    const tickerDetails = details.results;
    const lastQuote = quote.results;

    // Get related assets based on similar market cap range
    const relatedAssets = await getRelatedAssets(tickerDetails.market_cap);

    return {
      name: tickerDetails.name,
      description: tickerDetails.description || 'No description available.',
      sector: 'Technology', // Note: Basic tier doesn't provide sector info
      industry: 'Technology', // Note: Basic tier doesn't provide industry info
      marketCap: tickerDetails.market_cap || 0,
      peRatio: 0, // Note: Would need additional API calls for this data
      dividendYield: 0, // Note: Would need additional API calls for this data
      beta: 0, // Note: Would need additional API calls for this data
      eps: 0, // Note: Would need additional API calls for this data
      high52Week: 0, // Note: Would need additional API calls for this data
      low52Week: 0, // Note: Would need additional API calls for this data
      volume: 0,
      price: (lastQuote.P + lastQuote.p) / 2, // Midpoint of bid/ask
      relatedAssets,
      newsItems: news.results.map((item: PolygonNewsItem) => ({
        id: item.id,
        title: item.title,
        summary: item.description || 'No summary available.',
        url: item.article_url,
        publishedAt: item.published_utc,
        source: item.publisher.name,
      })),
    };
  } catch (error) {
    console.error('Error fetching asset details:', error);
    throw new Error('Failed to fetch asset details');
  }
}

export async function getAssetChartData(symbol: string, timeframe: string) {
  try {
    let multiplier = 1;
    let timespan: 'minute' | 'hour' | 'day' = 'day';
    let fromDate = new Date();

    // Configure timeframe parameters
    switch (timeframe) {
      case '1D':
        timespan = 'minute';
        multiplier = 5;
        fromDate.setDate(fromDate.getDate() - 1);
        break;
      case '1W':
        timespan = 'hour';
        multiplier = 1;
        fromDate.setDate(fromDate.getDate() - 7);
        break;
      case '1M':
        timespan = 'day';
        multiplier = 1;
        fromDate.setMonth(fromDate.getMonth() - 1);
        break;
      case '3M':
        timespan = 'day';
        multiplier = 1;
        fromDate.setMonth(fromDate.getMonth() - 3);
        break;
      case '1Y':
        timespan = 'day';
        multiplier = 1;
        fromDate.setFullYear(fromDate.getFullYear() - 1);
        break;
      default:
        timespan = 'day';
        multiplier = 1;
        fromDate.setFullYear(fromDate.getFullYear() - 5);
    }

    const response = await polygonService.getAggregates(
      symbol,
      multiplier,
      timespan,
      fromDate.toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    );

    return response.results.map((bar: AggregateBar) => ({
      date: new Date(bar.t).toISOString().split('T')[0],
      price: bar.c,
    }));
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw new Error('Failed to fetch chart data');
  }
}

async function getRelatedAssets(marketCap: number): Promise<Asset[]> {
  try {
    // Get stocks in similar market cap range
    const response = await polygonService.searchTickers('', 5);
    
    return response.results.map((ticker: TickerDetails) => ({
      id: ticker.ticker,
      symbol: ticker.ticker,
      name: ticker.name,
      assetClass: ticker.market.toLowerCase(),
      price: 0,
      change: 0,
      score: calculateAssetScore(ticker),
    }));
  } catch (error) {
    console.error('Error fetching related assets:', error);
    return [];
  }
}

function calculateAssetScore(ticker: TickerDetails): number {
  // Basic scoring based on available metrics
  let score = 75; // Base score

  if (ticker.market_cap && ticker.market_cap > 1e11) score += 10; // Large cap bonus
  if (ticker.active) score += 5; // Active trading bonus
  if (ticker.primary_exchange === 'XNAS' || ticker.primary_exchange === 'XNYS') score += 5; // Major exchange bonus

  return Math.min(100, Math.max(0, score)); // Ensure score is between 0 and 100
}

