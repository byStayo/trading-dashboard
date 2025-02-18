import { NextRequest } from 'next/server';
import { polygonService } from '@/lib/api/polygon-service';
import { authMiddleware } from '@/lib/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { errorHandler } from '@/lib/middleware/error-handler';
import { formatPaginatedResponse } from '@/lib/utils/response-formatter';
import { z } from 'zod';

interface TickerResult {
  ticker: string;
  name: string;
  market: string;
  type: string;
  active: boolean;
  primaryExchange: string;
  [key: string]: unknown;
}

const SearchQuerySchema = z.object({
  query: z.string().min(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  type: z.enum(['stocks', 'crypto', 'forex']).optional(),
  market: z.enum(['stocks', 'crypto', 'fx']).optional(),
  active: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Apply middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse.status !== 200) return rateLimitResponse;

    // Get and validate query parameters
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const { query, limit = '10', active = true } = SearchQuerySchema.parse(searchParams);

    // Search tickers
    const searchResults = await polygonService.searchTickers(query, Number(limit));

    // Filter active/inactive if specified
    const filteredResults = active
      ? searchResults.results.filter((ticker: TickerResult) => ticker.active)
      : searchResults.results;

    // Format response with pagination
    return formatPaginatedResponse(
      filteredResults,
      {
        page: 1,
        limit: Number(limit),
        total: filteredResults.length,
        totalPages: Math.ceil(filteredResults.length / Number(limit)),
      },
      {
        source: 'polygon',
        cached: true,
      }
    );
  } catch (error) {
    return errorHandler(error, req);
  }
}

// Advanced search endpoint
export async function POST(req: NextRequest) {
  try {
    // Apply middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse.status !== 200) return rateLimitResponse;

    // Validate request body
    const body = await req.json();
    const {
      query,
      limit = 10,
      type = 'stocks',
      market = 'stocks',
      active = true,
      filters = {},
    } = body;

    // Search tickers
    const searchResults = await polygonService.searchTickers(query, limit);

    // Apply filters
    let filteredResults = searchResults.results as TickerResult[];

    // Filter by active status
    if (active !== undefined) {
      filteredResults = filteredResults.filter((ticker: TickerResult) => ticker.active === active);
    }

    // Filter by type
    if (type) {
      filteredResults = filteredResults.filter((ticker: TickerResult) => ticker.type === type);
    }

    // Filter by market
    if (market) {
      filteredResults = filteredResults.filter((ticker: TickerResult) => ticker.market === market);
    }

    // Apply custom filters
    if (Object.keys(filters).length > 0) {
      filteredResults = filteredResults.filter((ticker: TickerResult) => {
        return Object.entries(filters).every(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            const { min, max } = value as { min?: number; max?: number };
            const tickerValue = ticker[key];
            if (typeof tickerValue !== 'number') return false;
            if (min !== undefined && tickerValue < min) return false;
            if (max !== undefined && tickerValue > max) return false;
            return true;
          }
          return ticker[key] === value;
        });
      });
    }

    // Format response with pagination
    return formatPaginatedResponse(
      filteredResults,
      {
        page: 1,
        limit,
        total: filteredResults.length,
        totalPages: Math.ceil(filteredResults.length / limit),
      },
      {
        source: 'polygon',
        cached: true,
      }
    );
  } catch (error) {
    return errorHandler(error, req);
  }
} 