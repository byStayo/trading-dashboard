import { z } from 'zod';

// Base schemas for common data structures
const PriceSchema = z.number().min(0).max(1000000);
const VolumeSchema = z.number().min(0);
const PercentageSchema = z.number().min(-100).max(100);
const TimestampSchema = z.number().min(0);
const SymbolSchema = z.string().regex(/^[A-Z]{1,5}$/);

// Market data validation schemas
export const MarketDataSchema = z.object({
  symbol: SymbolSchema,
  price: PriceSchema,
  change: z.number(),
  changePercent: PercentageSchema,
  volume: VolumeSchema,
  lastUpdated: TimestampSchema,
  metadata: z.object({
    source: z.enum(['websocket', 'rest', 'cache']),
    reliability: z.number().min(0).max(1),
    staleness: z.number().min(0),
  }),
});

// Technical indicator schemas
export const TechnicalIndicatorSchema = z.object({
  timestamp: TimestampSchema,
  value: z.number(),
  indicator: z.enum(['SMA', 'EMA', 'RSI', 'MACD']),
  period: z.number().min(1),
});

// Company information schema
export const CompanyInfoSchema = z.object({
  symbol: SymbolSchema,
  name: z.string(),
  description: z.string(),
  sector: z.string(),
  industry: z.string(),
  employees: z.number().optional(),
  website: z.string().url().optional(),
  marketCap: z.number().optional(),
});

// News item schema
export const NewsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  url: z.string().url(),
  source: z.string(),
  publishedAt: TimestampSchema,
  symbols: z.array(SymbolSchema),
});

// Validation error types
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError[],
    public data: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Data transformation utilities
export const DataTransformer = {
  // Normalize market data from different sources
  normalizeMarketData(data: unknown, source: 'polygon' | 'alternative'): z.infer<typeof MarketDataSchema> {
    try {
      if (source === 'polygon') {
        // Transform Polygon.io format to our standard format
        const transformed = {
          symbol: (data as any).T || (data as any).symbol,
          price: (data as any).p || (data as any).price,
          change: (data as any).c || (data as any).change,
          changePercent: (data as any).P || (data as any).changePercent,
          volume: (data as any).v || (data as any).volume,
          lastUpdated: Date.now(),
          metadata: {
            source: 'rest' as const,
            reliability: 1,
            staleness: 0,
          },
        };
        return MarketDataSchema.parse(transformed);
      } else {
        // Transform alternative source format
        // Add more source transformations as needed
        throw new Error('Unsupported data source');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Failed to normalize market data', [error], data);
      }
      throw error;
    }
  },

  // Format technical indicators
  formatTechnicalIndicator(
    data: unknown,
    indicator: z.infer<typeof TechnicalIndicatorSchema>['indicator'],
    period: number
  ): z.infer<typeof TechnicalIndicatorSchema> {
    try {
      const transformed = {
        timestamp: (data as any).t || Date.now(),
        value: (data as any).v || (data as any).value,
        indicator,
        period,
      };
      return TechnicalIndicatorSchema.parse(transformed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Failed to format technical indicator', [error], data);
      }
      throw error;
    }
  },

  // Validate and clean company information
  validateCompanyInfo(data: unknown): z.infer<typeof CompanyInfoSchema> {
    try {
      return CompanyInfoSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid company information', [error], data);
      }
      throw error;
    }
  },

  // Validate and format news items
  validateNewsItem(data: unknown): z.infer<typeof NewsItemSchema> {
    try {
      return NewsItemSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid news item', [error], data);
      }
      throw error;
    }
  },

  // Batch validation for multiple items
  validateBatch<T>(
    items: unknown[],
    schema: z.ZodSchema<T>,
    options: { stopOnFirst?: boolean } = {}
  ): { valid: T[]; errors: ValidationError[] } {
    const valid: T[] = [];
    const errors: ValidationError[] = [];

    for (const item of items) {
      try {
        valid.push(schema.parse(item));
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(new ValidationError('Validation failed', [error], item));
          if (options.stopOnFirst) break;
        } else {
          throw error;
        }
      }
    }

    return { valid, errors };
  },
};

// Type guard utilities
export const TypeGuards = {
  isMarketData(data: unknown): data is z.infer<typeof MarketDataSchema> {
    try {
      MarketDataSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  },

  isTechnicalIndicator(data: unknown): data is z.infer<typeof TechnicalIndicatorSchema> {
    try {
      TechnicalIndicatorSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  },

  isCompanyInfo(data: unknown): data is z.infer<typeof CompanyInfoSchema> {
    try {
      CompanyInfoSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  },

  isNewsItem(data: unknown): data is z.infer<typeof NewsItemSchema> {
    try {
      NewsItemSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  },
}; 