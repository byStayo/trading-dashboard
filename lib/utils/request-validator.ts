import { NextRequest } from 'next/server';
import { z } from 'zod';
import { APIError } from '../middleware/error-handler';

export async function validateRequest<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }
    throw new APIError('Invalid request body', 400, 'INVALID_REQUEST');
  }
}

// Common request schemas
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const DateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const SymbolParamSchema = z.object({
  symbol: z.string().regex(/^[A-Z]{1,5}$/),
});

export const TimeframeSchema = z.enum(['1m', '5m', '15m', '30m', '1h', '4h', '1d']);

// Request schemas for specific endpoints
export const MarketDataRequestSchema = z.object({
  symbols: z.array(z.string()).min(1).max(50),
  timeframe: TimeframeSchema.optional(),
}).merge(PaginationSchema.partial());

export const TechnicalIndicatorRequestSchema = z.object({
  symbol: z.string(),
  indicator: z.enum(['SMA', 'EMA', 'RSI', 'MACD']),
  period: z.number().int().min(1).max(200),
}).merge(DateRangeSchema);

export const NewsRequestSchema = z.object({
  symbols: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
}).merge(PaginationSchema.partial());

// Helper function to validate query parameters
export function validateQueryParams<T>(
  params: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  const queryObj: Record<string, unknown> = {};
  
  params.forEach((value, key) => {
    // Handle arrays
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      if (!queryObj[arrayKey]) {
        queryObj[arrayKey] = [];
      }
      (queryObj[arrayKey] as unknown[]).push(value);
    } else {
      // Handle numbers
      if (/^\d+$/.test(value)) {
        queryObj[key] = parseInt(value, 10);
      } else if (value === 'true' || value === 'false') {
        queryObj[key] = value === 'true';
      } else {
        queryObj[key] = value;
      }
    }
  });

  return schema.parse(queryObj);
} 