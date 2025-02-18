import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

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
  metadata: z.object({
    source: z.string(),
    confidence: z.number().min(0).max(1),
  }).optional(),
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
  metadata: z.object({
    lastUpdated: TimestampSchema,
    source: z.string(),
    reliability: z.number().min(0).max(1),
  }),
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
  sentiment: z.object({
    score: z.number().min(-1).max(1),
    confidence: z.number().min(0).max(1),
  }).optional(),
});

// WebSocket message schemas
export const WebSocketMessageSchema = z.object({
  type: z.enum(['trade', 'quote', 'aggregate']),
  data: z.unknown().default(null),
  timestamp: TimestampSchema,
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

class DataValidationService {
  private static instance: DataValidationService;

  private constructor() {
    this.setupMetrics();
  }

  public static getInstance(): DataValidationService {
    if (!DataValidationService.instance) {
      DataValidationService.instance = new DataValidationService();
    }
    return DataValidationService.instance;
  }

  private setupMetrics() {
    metrics.register({
      name: 'data_validation_total',
      help: 'Total number of data validations',
      type: 'counter',
      labels: ['type', 'status'],
    });

    metrics.register({
      name: 'data_validation_errors',
      help: 'Number of validation errors',
      type: 'counter',
      labels: ['type'],
    });

    metrics.register({
      name: 'data_validation_duration',
      help: 'Duration of data validation in milliseconds',
      type: 'histogram',
      labels: ['type'],
    });
  }

  async validateMarketData(data: unknown): Promise<z.infer<typeof MarketDataSchema>> {
    const startTime = Date.now();
    try {
      const validatedData = MarketDataSchema.parse(data);
      
      metrics.record('data_validation_total', 1, {
        type: 'market_data',
        status: 'success',
      });
      metrics.record('data_validation_duration', Date.now() - startTime, {
        type: 'market_data',
      });

      return validatedData;
    } catch (error) {
      metrics.record('data_validation_total', 1, {
        type: 'market_data',
        status: 'error',
      });
      metrics.record('data_validation_errors', 1, { type: 'market_data' });

      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid market data', [error], data);
      }
      throw error;
    }
  }

  async validateTechnicalIndicator(data: unknown): Promise<z.infer<typeof TechnicalIndicatorSchema>> {
    const startTime = Date.now();
    try {
      const validatedData = TechnicalIndicatorSchema.parse(data);
      
      metrics.record('data_validation_total', 1, {
        type: 'technical_indicator',
        status: 'success',
      });
      metrics.record('data_validation_duration', Date.now() - startTime, {
        type: 'technical_indicator',
      });

      return validatedData;
    } catch (error) {
      metrics.record('data_validation_total', 1, {
        type: 'technical_indicator',
        status: 'error',
      });
      metrics.record('data_validation_errors', 1, { type: 'technical_indicator' });

      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid technical indicator data', [error], data);
      }
      throw error;
    }
  }

  async validateCompanyInfo(data: unknown): Promise<z.infer<typeof CompanyInfoSchema>> {
    const startTime = Date.now();
    try {
      const validatedData = CompanyInfoSchema.parse(data);
      
      metrics.record('data_validation_total', 1, {
        type: 'company_info',
        status: 'success',
      });
      metrics.record('data_validation_duration', Date.now() - startTime, {
        type: 'company_info',
      });

      return validatedData;
    } catch (error) {
      metrics.record('data_validation_total', 1, {
        type: 'company_info',
        status: 'error',
      });
      metrics.record('data_validation_errors', 1, { type: 'company_info' });

      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid company information', [error], data);
      }
      throw error;
    }
  }

  async validateNewsItem(data: unknown): Promise<z.infer<typeof NewsItemSchema>> {
    const startTime = Date.now();
    try {
      const validatedData = NewsItemSchema.parse(data);
      
      metrics.record('data_validation_total', 1, {
        type: 'news_item',
        status: 'success',
      });
      metrics.record('data_validation_duration', Date.now() - startTime, {
        type: 'news_item',
      });

      return validatedData;
    } catch (error) {
      metrics.record('data_validation_total', 1, {
        type: 'news_item',
        status: 'error',
      });
      metrics.record('data_validation_errors', 1, { type: 'news_item' });

      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid news item', [error], data);
      }
      throw error;
    }
  }

  async validateWebSocketMessage(data: unknown): Promise<z.infer<typeof WebSocketMessageSchema>> {
    const startTime = Date.now();
    try {
      const validatedData = WebSocketMessageSchema.parse(data);
      
      metrics.record('data_validation_total', 1, {
        type: 'websocket_message',
        status: 'success',
      });
      metrics.record('data_validation_duration', Date.now() - startTime, {
        type: 'websocket_message',
      });

      return validatedData;
    } catch (error) {
      metrics.record('data_validation_total', 1, {
        type: 'websocket_message',
        status: 'error',
      });
      metrics.record('data_validation_errors', 1, { type: 'websocket_message' });

      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid WebSocket message', [error], data);
      }
      throw error;
    }
  }

  async validateBatch<T>(
    items: unknown[],
    schema: z.ZodSchema<T>,
    options: { stopOnFirst?: boolean } = {}
  ): Promise<{ valid: T[]; errors: ValidationError[] }> {
    const startTime = Date.now();
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

    metrics.record('data_validation_total', items.length, {
      type: 'batch',
      status: errors.length === 0 ? 'success' : 'partial',
    });
    metrics.record('data_validation_duration', Date.now() - startTime, {
      type: 'batch',
    });

    if (errors.length > 0) {
      metrics.record('data_validation_errors', errors.length, { type: 'batch' });
    }

    return { valid, errors };
  }

  // Type guard utilities
  isMarketData(data: unknown): data is z.infer<typeof MarketDataSchema> {
    try {
      MarketDataSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  isTechnicalIndicator(data: unknown): data is z.infer<typeof TechnicalIndicatorSchema> {
    try {
      TechnicalIndicatorSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  isCompanyInfo(data: unknown): data is z.infer<typeof CompanyInfoSchema> {
    try {
      CompanyInfoSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  isNewsItem(data: unknown): data is z.infer<typeof NewsItemSchema> {
    try {
      NewsItemSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  }
}

export const dataValidationService = DataValidationService.getInstance(); 