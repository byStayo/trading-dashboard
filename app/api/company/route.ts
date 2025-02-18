import { NextRequest } from 'next/server';
import { polygonService } from '@/lib/api/polygon-service';
import { authMiddleware } from '@/lib/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { errorHandler } from '@/lib/middleware/error-handler';
import { validateQueryParams } from '@/lib/utils/request-validator';
import { SymbolParamSchema } from '@/lib/utils/request-validator';
import { formatResponse } from '@/lib/utils/response-formatter';

export async function GET(req: NextRequest) {
  try {
    // Apply middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse.status !== 200) return rateLimitResponse;

    // Validate query parameters
    const query = validateQueryParams(req.nextUrl.searchParams, SymbolParamSchema);

    // Get company details from service
    const companyData = await polygonService.getTickerDetails(query.symbol);

    // Format response
    return formatResponse(companyData, {
      source: 'polygon',
      cached: true,
    });
  } catch (error) {
    return errorHandler(error, req);
  }
}

// Batch endpoint for multiple companies
export async function POST(req: NextRequest) {
  try {
    // Apply middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse.status !== 200) return rateLimitResponse;

    // Validate request body
    const body = await req.json();
    const { symbols } = body as { symbols: string[] };

    if (!Array.isArray(symbols) || symbols.length === 0) {
      throw new Error('Invalid symbols array');
    }

    // Get company details for all symbols
    const companyDataPromises = symbols.map(symbol =>
      polygonService.getTickerDetails(symbol)
    );

    const companyData = await Promise.all(companyDataPromises);

    // Format response
    return formatResponse(
      companyData.reduce((acc, data, index) => {
        acc[symbols[index]] = data;
        return acc;
      }, {} as Record<string, unknown>),
      {
        source: 'polygon',
        cached: true,
      }
    );
  } catch (error) {
    return errorHandler(error, req);
  }
} 