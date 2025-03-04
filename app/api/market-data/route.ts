import { NextRequest } from 'next/server';
import { polygonService } from '@/lib/api/polygon-service';
import { authMiddleware } from '@/lib/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { errorHandler } from '@/lib/middleware/error-handler';
import { validateQueryParams } from '@/lib/utils/request-validator';
import { MarketDataRequestSchema } from '@/lib/utils/request-validator';
import { formatPaginatedResponse } from '@/lib/utils/response-formatter';
import { NextResponse } from 'next/server';
import { PolygonService } from '@/lib/api/polygon-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get('symbols')?.split(',') || [];
  const operation = searchParams.get('operation');

  if (!symbols.length) {
    return NextResponse.json({ error: 'No symbols provided' }, { status: 400 });
  }

  try {
    const polygonService = PolygonService.getInstance();

    switch (operation) {
      case 'snapshot':
        const snapshots = await polygonService.getSnapshots(symbols);
        return NextResponse.json(snapshots);
      
      case 'details':
        const details = await Promise.all(
          symbols.map(symbol => polygonService.getTickerDetails(symbol))
        );
        return NextResponse.json(details);
      
      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }
  } catch (error) {
    console.error('Market data API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
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