import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { dataValidationService } from './data-validation-service';
import type { MarketData, TechnicalIndicator, CompanyInfo, NewsItem } from '../types/market-data';

interface TransformOptions {
  normalize?: boolean;
  validate?: boolean;
  format?: 'compact' | 'full';
}

class DataTransformService {
  private static instance: DataTransformService;

  private constructor() {
    this.setupMetrics();
  }

  public static getInstance(): DataTransformService {
    if (!DataTransformService.instance) {
      DataTransformService.instance = new DataTransformService();
    }
    return DataTransformService.instance;
  }

  private setupMetrics() {
    metrics.register({
      name: 'data_transformations',
      help: 'Number of data transformations',
      type: 'counter',
      labels: ['type', 'status'],
    });

    metrics.register({
      name: 'data_transform_errors',
      help: 'Number of transformation errors',
      type: 'counter',
      labels: ['type'],
    });

    metrics.register({
      name: 'data_transform_duration',
      help: 'Duration of data transformations in milliseconds',
      type: 'histogram',
      labels: ['type'],
    });
  }

  async transformMarketData(
    data: unknown,
    source: 'polygon' | 'alternative',
    options: TransformOptions = {}
  ): Promise<MarketData> {
    const startTime = Date.now();
    try {
      let transformed: MarketData;

      if (source === 'polygon') {
        transformed = {
          symbol: (data as any).T || (data as any).symbol,
          price: (data as any).p || (data as any).price,
          change: (data as any).c || (data as any).change,
          changePercent: (data as any).P || (data as any).changePercent,
          volume: (data as any).v || (data as any).volume,
          lastUpdated: Date.now(),
          metadata: {
            source: 'rest',
            reliability: 1,
            staleness: 0,
          },
        };
      } else {
        // Transform alternative source format
        transformed = {
          symbol: (data as any).symbol,
          price: (data as any).lastPrice,
          change: (data as any).priceChange,
          changePercent: (data as any).percentChange,
          volume: (data as any).volume,
          lastUpdated: Date.now(),
          metadata: {
            source: 'rest',
            reliability: 0.9,
            staleness: 0,
          },
        };
      }

      if (options.normalize) {
        transformed = this.normalizeMarketData(transformed);
      }

      if (options.validate) {
        transformed = await dataValidationService.validateMarketData(transformed);
      }

      metrics.record('data_transformations', 1, {
        type: 'market_data',
        status: 'success',
      });
      metrics.record('data_transform_duration', Date.now() - startTime, {
        type: 'market_data',
      });

      return transformed;
    } catch (error) {
      logger.error('Error transforming market data:', error);
      metrics.record('data_transform_errors', 1, { type: 'market_data' });
      throw error;
    }
  }

  async transformTechnicalIndicator(
    data: unknown,
    indicator: string,
    period: number,
    options: TransformOptions = {}
  ): Promise<TechnicalIndicator> {
    const startTime = Date.now();
    try {
      let transformed: TechnicalIndicator = {
        timestamp: (data as any).t || Date.now(),
        value: (data as any).v || (data as any).value,
        indicator: indicator as any,
        period,
        metadata: {
          source: (data as any).source || 'calculation',
          confidence: (data as any).confidence || 1,
        },
      };

      if (options.validate) {
        transformed = await dataValidationService.validateTechnicalIndicator(transformed);
      }

      metrics.record('data_transformations', 1, {
        type: 'technical_indicator',
        status: 'success',
      });
      metrics.record('data_transform_duration', Date.now() - startTime, {
        type: 'technical_indicator',
      });

      return transformed;
    } catch (error) {
      logger.error('Error transforming technical indicator:', error);
      metrics.record('data_transform_errors', 1, { type: 'technical_indicator' });
      throw error;
    }
  }

  async transformCompanyInfo(
    data: unknown,
    options: TransformOptions = {}
  ): Promise<CompanyInfo> {
    const startTime = Date.now();
    try {
      let transformed: CompanyInfo = {
        symbol: (data as any).symbol || (data as any).ticker,
        name: (data as any).name || (data as any).companyName,
        description: (data as any).description || (data as any).about,
        sector: (data as any).sector,
        industry: (data as any).industry,
        employees: (data as any).employees || (data as any).employeeCount,
        website: (data as any).website || (data as any).url,
        marketCap: (data as any).marketCap,
        metadata: {
          lastUpdated: Date.now(),
          source: (data as any).source || 'api',
          reliability: 1,
        },
      };

      if (options.validate) {
        transformed = await dataValidationService.validateCompanyInfo(transformed);
      }

      metrics.record('data_transformations', 1, {
        type: 'company_info',
        status: 'success',
      });
      metrics.record('data_transform_duration', Date.now() - startTime, {
        type: 'company_info',
      });

      return transformed;
    } catch (error) {
      logger.error('Error transforming company info:', error);
      metrics.record('data_transform_errors', 1, { type: 'company_info' });
      throw error;
    }
  }

  async transformNewsItem(
    data: unknown,
    options: TransformOptions = {}
  ): Promise<NewsItem> {
    const startTime = Date.now();
    try {
      let transformed: NewsItem = {
        id: (data as any).id || (data as any).newsId,
        title: (data as any).title || (data as any).headline,
        summary: (data as any).summary || (data as any).description,
        url: (data as any).url || (data as any).link,
        source: (data as any).source || (data as any).provider,
        publishedAt: (data as any).publishedAt || (data as any).timestamp,
        symbols: (data as any).symbols || (data as any).tickers || [],
        sentiment: (data as any).sentiment && {
          score: (data as any).sentiment.score,
          confidence: (data as any).sentiment.confidence,
        },
      };

      if (options.validate) {
        transformed = await dataValidationService.validateNewsItem(transformed);
      }

      metrics.record('data_transformations', 1, {
        type: 'news_item',
        status: 'success',
      });
      metrics.record('data_transform_duration', Date.now() - startTime, {
        type: 'news_item',
      });

      return transformed;
    } catch (error) {
      logger.error('Error transforming news item:', error);
      metrics.record('data_transform_errors', 1, { type: 'news_item' });
      throw error;
    }
  }

  private normalizeMarketData(data: MarketData): MarketData {
    // Normalize price to 2 decimal places
    data.price = Number(data.price.toFixed(2));
    
    // Normalize change to 2 decimal places
    data.change = Number(data.change.toFixed(2));
    
    // Normalize change percent to 2 decimal places
    data.changePercent = Number(data.changePercent.toFixed(2));
    
    // Normalize volume to whole numbers
    data.volume = Math.round(data.volume);

    return data;
  }

  async transformBatch<T>(
    items: unknown[],
    transformFn: (item: unknown) => Promise<T>,
    options: TransformOptions & { stopOnError?: boolean } = {}
  ): Promise<{ transformed: T[]; errors: Error[] }> {
    const startTime = Date.now();
    const transformed: T[] = [];
    const errors: Error[] = [];

    for (const item of items) {
      try {
        const result = await transformFn(item);
        transformed.push(result);
      } catch (error) {
        errors.push(error as Error);
        if (options.stopOnError) break;
      }
    }

    metrics.record('data_transformations', items.length, {
      type: 'batch',
      status: errors.length === 0 ? 'success' : 'partial',
    });
    metrics.record('data_transform_duration', Date.now() - startTime, {
      type: 'batch',
    });

    if (errors.length > 0) {
      metrics.record('data_transform_errors', errors.length, { type: 'batch' });
    }

    return { transformed, errors };
  }
}

export const dataTransformService = DataTransformService.getInstance(); 