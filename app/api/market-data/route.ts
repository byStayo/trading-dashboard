import { NextRequest } from 'next/server';
import { polygonService } from '@/lib/api/polygon-service';
import { authMiddleware } from '@/lib/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { errorHandler } from '@/lib/middleware/error-handler';
import { validateQueryParams } from '@/lib/utils/request-validator';
import { MarketDataRequestSchema } from '@/lib/utils/request-validator';
import { formatPaginatedResponse } from '@/lib/utils/response-formatter';

export async function GET(req: NextRequest) {
  try {
    // Apply middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse.status !== 200) return rateLimitResponse;

    // Validate query parameters
    const query = validateQueryParams(req.nextUrl.searchParams, MarketDataRequestSchema);

    // Get market data from service
    const marketData = await polygonService.getSnapshots(query.symbols);

    // Calculate pagination
    const total = marketData.tickers.length;
    const page = query.page || 1;
    const limit = query.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    // Paginate results
    const paginatedData = marketData.tickers.slice(start, end);

    // Format response
    return formatPaginatedResponse(
      paginatedData,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

export async function POST(req: NextRequest) {
  try {
    // Apply middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse.status !== 200) return rateLimitResponse;

    // Validate request body
    const body = await req.json();
    const validatedData = MarketDataRequestSchema.parse(body);

    // Get market data from service
    const marketData = await polygonService.getSnapshots(validatedData.symbols);

    // Calculate pagination if requested
    if (validatedData.page && validatedData.limit) {
      const total = marketData.tickers.length;
      const start = (validatedData.page - 1) * validatedData.limit;
      const end = start + validatedData.limit;

      // Paginate results
      const paginatedData = marketData.tickers.slice(start, end);

      return formatPaginatedResponse(
        paginatedData,
        {
          page: validatedData.page,
          limit: validatedData.limit,
          total,
          totalPages: Math.ceil(total / validatedData.limit),
        },
        {
          source: 'polygon',
          cached: true,
        }
      );
    }

    // Return all results if no pagination requested
    return formatPaginatedResponse(
      marketData.tickers,
      {
        page: 1,
        limit: marketData.tickers.length,
        total: marketData.tickers.length,
        totalPages: 1,
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