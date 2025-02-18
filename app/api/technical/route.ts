import { NextRequest } from 'next/server';
import { polygonService, TechnicalIndicatorsResponse } from '@/lib/api/polygon-service';
import { authMiddleware } from '@/lib/middleware/auth';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';
import { errorHandler } from '@/lib/middleware/error-handler';
import { validateRequest } from '@/lib/utils/request-validator';
import { TechnicalIndicatorRequestSchema } from '@/lib/utils/request-validator';
import { formatResponse } from '@/lib/utils/response-formatter';
import { DataTransformer } from '@/lib/utils/data-validator';

export async function POST(req: NextRequest) {
  try {
    // Apply middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse.status !== 200) return rateLimitResponse;

    // Validate request body
    const validatedData = await validateRequest(req, TechnicalIndicatorRequestSchema);

    // Get technical indicator data based on type
    let indicatorData: TechnicalIndicatorsResponse;
    switch (validatedData.indicator) {
      case 'SMA':
        indicatorData = await polygonService.getSMA(
          validatedData.symbol,
          '1d', // Default timeframe
          validatedData.period,
          validatedData.startDate,
          validatedData.endDate
        );
        break;
      case 'RSI':
        indicatorData = await polygonService.getRSI(
          validatedData.symbol,
          '1d', // Default timeframe
          validatedData.period,
          validatedData.startDate,
          validatedData.endDate
        );
        break;
      default:
        throw new Error(`Unsupported indicator: ${validatedData.indicator}`);
    }

    // Transform and validate the data
    const transformedData = indicatorData.results.values.map(result =>
      DataTransformer.formatTechnicalIndicator(
        result,
        validatedData.indicator,
        validatedData.period
      )
    );

    // Format response
    return formatResponse(transformedData, {
      source: 'polygon',
      cached: false,
    });
  } catch (error) {
    return errorHandler(error, req);
  }
}

// GET endpoint for predefined technical indicators
export async function GET(req: NextRequest) {
  try {
    // Apply middleware
    const authResponse = await authMiddleware(req);
    if (authResponse.status !== 200) return authResponse;

    const rateLimitResponse = await rateLimitMiddleware(req);
    if (rateLimitResponse.status !== 200) return rateLimitResponse;

    // Get query parameters
    const symbol = req.nextUrl.searchParams.get('symbol');
    if (!symbol) {
      throw new Error('Symbol is required');
    }

    // Get common technical indicators
    const [sma20, sma50, sma200, rsi14] = await Promise.all([
      polygonService.getSMA(symbol, '1d', 20, '', ''),
      polygonService.getSMA(symbol, '1d', 50, '', ''),
      polygonService.getSMA(symbol, '1d', 200, '', ''),
      polygonService.getRSI(symbol, '1d', 14, '', ''),
    ]);

    // Transform and combine the data
    const technicalData = {
      sma: {
        20: DataTransformer.formatTechnicalIndicator(
          sma20.results.values[sma20.results.values.length - 1],
          'SMA',
          20
        ),
        50: DataTransformer.formatTechnicalIndicator(
          sma50.results.values[sma50.results.values.length - 1],
          'SMA',
          50
        ),
        200: DataTransformer.formatTechnicalIndicator(
          sma200.results.values[sma200.results.values.length - 1],
          'SMA',
          200
        ),
      },
      rsi: DataTransformer.formatTechnicalIndicator(
        rsi14.results.values[rsi14.results.values.length - 1],
        'RSI',
        14
      ),
    };

    // Format response
    return formatResponse(technicalData, {
      source: 'polygon',
      cached: false,
    });
  } catch (error) {
    return errorHandler(error, req);
  }
} 