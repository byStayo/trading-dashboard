import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import type { MarketData, TechnicalIndicator } from '../types/market-data';

interface AnalyticsConfig {
  period: number;
  confidenceLevel?: number;
  smoothing?: number;
  outlierThreshold?: number;
}

interface AnalyticsResult {
  value: number;
  confidence: number;
  metadata: {
    timestamp: number;
    sampleSize: number;
    method: string;
  };
}

interface StatisticalSummary {
  mean: number;
  median: number;
  standardDeviation: number;
  skewness: number;
  kurtosis: number;
  min: number;
  max: number;
  sampleSize: number;
}

class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {
    this.setupMetrics();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private setupMetrics() {
    metrics.register({
      name: 'analytics_calculations',
      help: 'Number of analytics calculations performed',
      type: 'counter',
      labels: ['type', 'status'],
    });

    metrics.register({
      name: 'analytics_errors',
      help: 'Number of analytics calculation errors',
      type: 'counter',
      labels: ['type'],
    });

    metrics.register({
      name: 'analytics_duration',
      help: 'Duration of analytics calculations in milliseconds',
      type: 'histogram',
      labels: ['type'],
    });
  }

  async calculateVolatility(
    data: MarketData[],
    config: AnalyticsConfig
  ): Promise<AnalyticsResult> {
    const startTime = Date.now();
    try {
      const returns = this.calculateReturns(data);
      const stdDev = this.calculateStandardDeviation(returns);
      const annualizedVol = stdDev * Math.sqrt(252); // Annualize daily volatility

      metrics.record('analytics_calculations', 1, {
        type: 'volatility',
        status: 'success',
      });
      metrics.record('analytics_duration', Date.now() - startTime, {
        type: 'volatility',
      });

      return {
        value: annualizedVol,
        confidence: this.calculateConfidence(returns.length, config.confidenceLevel),
        metadata: {
          timestamp: Date.now(),
          sampleSize: returns.length,
          method: 'standard_deviation',
        },
      };
    } catch (error) {
      logger.error('Error calculating volatility:', error);
      metrics.record('analytics_errors', 1, { type: 'volatility' });
      throw error;
    }
  }

  async calculateMomentum(
    data: MarketData[],
    config: AnalyticsConfig
  ): Promise<AnalyticsResult> {
    const startTime = Date.now();
    try {
      const returns = this.calculateReturns(data);
      const momentum = this.calculateExponentialAverage(returns, config.smoothing || 0.2);

      metrics.record('analytics_calculations', 1, {
        type: 'momentum',
        status: 'success',
      });
      metrics.record('analytics_duration', Date.now() - startTime, {
        type: 'momentum',
      });

      return {
        value: momentum,
        confidence: this.calculateConfidence(returns.length, config.confidenceLevel),
        metadata: {
          timestamp: Date.now(),
          sampleSize: returns.length,
          method: 'exponential_average',
        },
      };
    } catch (error) {
      logger.error('Error calculating momentum:', error);
      metrics.record('analytics_errors', 1, { type: 'momentum' });
      throw error;
    }
  }

  async calculateCorrelation(
    data1: MarketData[],
    data2: MarketData[],
    config: AnalyticsConfig
  ): Promise<AnalyticsResult> {
    const startTime = Date.now();
    try {
      const returns1 = this.calculateReturns(data1);
      const returns2 = this.calculateReturns(data2);
      
      // Ensure equal length
      const minLength = Math.min(returns1.length, returns2.length);
      const correlation = this.calculatePearsonCorrelation(
        returns1.slice(-minLength),
        returns2.slice(-minLength)
      );

      metrics.record('analytics_calculations', 1, {
        type: 'correlation',
        status: 'success',
      });
      metrics.record('analytics_duration', Date.now() - startTime, {
        type: 'correlation',
      });

      return {
        value: correlation,
        confidence: this.calculateConfidence(minLength, config.confidenceLevel),
        metadata: {
          timestamp: Date.now(),
          sampleSize: minLength,
          method: 'pearson',
        },
      };
    } catch (error) {
      logger.error('Error calculating correlation:', error);
      metrics.record('analytics_errors', 1, { type: 'correlation' });
      throw error;
    }
  }

  async calculateStatistics(data: MarketData[]): Promise<StatisticalSummary> {
    const startTime = Date.now();
    try {
      const prices = data.map(d => d.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      
      const mean = this.calculateMean(prices);
      const median = this.calculateMedian(sortedPrices);
      const stdDev = this.calculateStandardDeviation(prices);
      const skewness = this.calculateSkewness(prices, mean, stdDev);
      const kurtosis = this.calculateKurtosis(prices, mean, stdDev);

      metrics.record('analytics_calculations', 1, {
        type: 'statistics',
        status: 'success',
      });
      metrics.record('analytics_duration', Date.now() - startTime, {
        type: 'statistics',
      });

      return {
        mean,
        median,
        standardDeviation: stdDev,
        skewness,
        kurtosis,
        min: sortedPrices[0],
        max: sortedPrices[sortedPrices.length - 1],
        sampleSize: prices.length,
      };
    } catch (error) {
      logger.error('Error calculating statistics:', error);
      metrics.record('analytics_errors', 1, { type: 'statistics' });
      throw error;
    }
  }

  async detectOutliers(
    data: MarketData[],
    config: AnalyticsConfig
  ): Promise<number[]> {
    const startTime = Date.now();
    try {
      const prices = data.map(d => d.price);
      const stats = await this.calculateStatistics(data);
      const threshold = config.outlierThreshold || 2;

      const outlierIndices = prices.reduce((indices, price, index) => {
        const zScore = Math.abs((price - stats.mean) / stats.standardDeviation);
        if (zScore > threshold) {
          indices.push(index);
        }
        return indices;
      }, [] as number[]);

      metrics.record('analytics_calculations', 1, {
        type: 'outliers',
        status: 'success',
      });
      metrics.record('analytics_duration', Date.now() - startTime, {
        type: 'outliers',
      });

      return outlierIndices;
    } catch (error) {
      logger.error('Error detecting outliers:', error);
      metrics.record('analytics_errors', 1, { type: 'outliers' });
      throw error;
    }
  }

  private calculateReturns(data: MarketData[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < data.length; i++) {
      const returnValue = (data[i].price - data[i - 1].price) / data[i - 1].price;
      returns.push(returnValue);
    }
    return returns;
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateMedian(sortedValues: number[]): number {
    const mid = Math.floor(sortedValues.length / 2);
    return sortedValues.length % 2 === 0
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid];
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return Math.sqrt(this.calculateMean(squaredDiffs));
  }

  private calculateSkewness(
    values: number[],
    mean: number,
    stdDev: number
  ): number {
    const cubedDiffs = values.map(value =>
      Math.pow((value - mean) / stdDev, 3)
    );
    return this.calculateMean(cubedDiffs);
  }

  private calculateKurtosis(
    values: number[],
    mean: number,
    stdDev: number
  ): number {
    const fourthPowerDiffs = values.map(value =>
      Math.pow((value - mean) / stdDev, 4)
    );
    return this.calculateMean(fourthPowerDiffs) - 3; // Excess kurtosis
  }

  private calculateExponentialAverage(
    values: number[],
    smoothing: number
  ): number {
    let ema = values[0];
    for (let i = 1; i < values.length; i++) {
      ema = smoothing * values[i] + (1 - smoothing) * ema;
    }
    return ema;
  }

  private calculatePearsonCorrelation(
    values1: number[],
    values2: number[]
  ): number {
    const mean1 = this.calculateMean(values1);
    const mean2 = this.calculateMean(values2);
    const stdDev1 = this.calculateStandardDeviation(values1);
    const stdDev2 = this.calculateStandardDeviation(values2);

    const covariance = values1.reduce((sum, value, index) => {
      return sum + (value - mean1) * (values2[index] - mean2);
    }, 0) / values1.length;

    return covariance / (stdDev1 * stdDev2);
  }

  private calculateConfidence(
    sampleSize: number,
    confidenceLevel: number = 0.95
  ): number {
    // Simple confidence calculation based on sample size
    return Math.min(
      confidenceLevel,
      1 - 1 / Math.sqrt(sampleSize)
    );
  }
}

export const analyticsService = AnalyticsService.getInstance(); 