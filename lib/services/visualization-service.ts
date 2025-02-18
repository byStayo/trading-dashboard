import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { dataTransformService } from './data-transform-service';
import type { MarketData, TechnicalIndicator } from '../types/market-data';

interface ChartConfig {
  type: 'line' | 'candlestick' | 'bar' | 'scatter';
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';
  indicators?: string[];
  overlay?: boolean;
  theme?: 'light' | 'dark';
}

interface ChartData {
  data: any[];
  config: ChartConfig;
  metadata: {
    symbol: string;
    lastUpdated: number;
    dataPoints: number;
  };
}

class VisualizationService {
  private static instance: VisualizationService;

  private constructor() {
    this.setupMetrics();
  }

  public static getInstance(): VisualizationService {
    if (!VisualizationService.instance) {
      VisualizationService.instance = new VisualizationService();
    }
    return VisualizationService.instance;
  }

  private setupMetrics() {
    metrics.register({
      name: 'visualization_transformations',
      help: 'Number of visualization data transformations',
      type: 'counter',
      labels: ['type', 'status'],
    });

    metrics.register({
      name: 'visualization_errors',
      help: 'Number of visualization errors',
      type: 'counter',
      labels: ['type'],
    });
  }

  async prepareChartData(
    data: MarketData[],
    config: ChartConfig
  ): Promise<ChartData> {
    const startTime = Date.now();
    try {
      let transformedData = data;

      // Sort data by timestamp
      transformedData.sort((a, b) => a.lastUpdated - b.lastUpdated);

      // Apply timeframe aggregation
      transformedData = this.aggregateByTimeframe(transformedData, config.timeframe);

      // Transform data based on chart type
      const chartData = this.transformForChartType(transformedData, config.type);

      // Add technical indicators if requested
      if (config.indicators?.length) {
        await this.addTechnicalIndicators(chartData, config.indicators);
      }

      metrics.record('visualization_transformations', 1, {
        type: config.type,
        status: 'success',
      });

      return {
        data: chartData,
        config,
        metadata: {
          symbol: data[0]?.symbol || 'unknown',
          lastUpdated: Date.now(),
          dataPoints: chartData.length,
        },
      };
    } catch (error) {
      logger.error('Error preparing chart data:', error);
      metrics.record('visualization_errors', 1, { type: 'preparation' });
      throw error;
    }
  }

  private aggregateByTimeframe(
    data: MarketData[],
    timeframe: ChartConfig['timeframe']
  ): MarketData[] {
    const timeframeMs = this.getTimeframeMs(timeframe);
    const aggregated: Map<number, MarketData> = new Map();

    data.forEach(item => {
      const timestamp = Math.floor(item.lastUpdated / timeframeMs) * timeframeMs;
      const existing = aggregated.get(timestamp);

      if (!existing) {
        aggregated.set(timestamp, { ...item, lastUpdated: timestamp });
      } else {
        // Update existing aggregate
        aggregated.set(timestamp, {
          ...existing,
          price: item.price, // Use latest price
          volume: existing.volume + item.volume,
          change: item.price - existing.price,
          changePercent: ((item.price - existing.price) / existing.price) * 100,
        });
      }
    });

    return Array.from(aggregated.values());
  }

  private transformForChartType(
    data: MarketData[],
    type: ChartConfig['type']
  ): any[] {
    switch (type) {
      case 'line':
        return data.map(item => ({
          timestamp: item.lastUpdated,
          value: item.price,
        }));

      case 'candlestick':
        return data.map(item => ({
          timestamp: item.lastUpdated,
          open: item.price - item.change,
          close: item.price,
          high: Math.max(item.price, item.price - item.change),
          low: Math.min(item.price, item.price - item.change),
          volume: item.volume,
        }));

      case 'bar':
        return data.map(item => ({
          timestamp: item.lastUpdated,
          value: item.volume,
        }));

      case 'scatter':
        return data.map(item => ({
          timestamp: item.lastUpdated,
          price: item.price,
          volume: item.volume,
        }));

      default:
        throw new Error(`Unsupported chart type: ${type}`);
    }
  }

  private async addTechnicalIndicators(
    data: any[],
    indicators: string[]
  ): Promise<void> {
    for (const indicator of indicators) {
      const [type, period] = indicator.split('-');
      const values = await this.calculateIndicator(data, type, Number(period));
      
      // Add indicator values to each data point
      data.forEach((point, index) => {
        point[indicator] = values[index];
      });
    }
  }

  private async calculateIndicator(
    data: any[],
    type: string,
    period: number
  ): Promise<number[]> {
    const prices = data.map(d => d.value || d.close);
    
    switch (type.toUpperCase()) {
      case 'SMA':
        return this.calculateSMA(prices, period);
      case 'EMA':
        return this.calculateEMA(prices, period);
      case 'RSI':
        return this.calculateRSI(prices, period);
      default:
        throw new Error(`Unsupported indicator: ${type}`);
    }
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        sma.push(NaN);
        continue;
      }
      
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  private calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);

    // First EMA is SMA
    const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    ema.push(firstSMA);

    for (let i = 1; i < prices.length; i++) {
      const value = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
      ema.push(value);
    }

    return ema;
  }

  private calculateRSI(prices: number[], period: number): number[] {
    const rsi: number[] = [];
    let gains: number[] = [];
    let losses: number[] = [];

    // Calculate price changes
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(Math.max(0, change));
      losses.push(Math.max(0, -change));
    }

    // Calculate initial averages
    const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    let prevAvgGain = avgGain;
    let prevAvgLoss = avgLoss;

    // Calculate RSI values
    for (let i = period; i < prices.length; i++) {
      const currentGain = gains[i - 1];
      const currentLoss = losses[i - 1];

      const smoothedAvgGain = (prevAvgGain * (period - 1) + currentGain) / period;
      const smoothedAvgLoss = (prevAvgLoss * (period - 1) + currentLoss) / period;

      prevAvgGain = smoothedAvgGain;
      prevAvgLoss = smoothedAvgLoss;

      const rs = smoothedAvgGain / smoothedAvgLoss;
      const rsiValue = 100 - (100 / (1 + rs));

      rsi.push(rsiValue);
    }

    return rsi;
  }

  private getTimeframeMs(timeframe: ChartConfig['timeframe']): number {
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    switch (timeframe) {
      case '1m': return minute;
      case '5m': return 5 * minute;
      case '15m': return 15 * minute;
      case '30m': return 30 * minute;
      case '1h': return hour;
      case '4h': return 4 * hour;
      case '1d': return day;
      default: throw new Error(`Invalid timeframe: ${timeframe}`);
    }
  }

  // Helper method to get default chart configuration
  getDefaultConfig(type: ChartConfig['type'] = 'line'): ChartConfig {
    return {
      type,
      timeframe: '1m',
      indicators: [],
      overlay: false,
      theme: 'light',
    };
  }
}

export const visualizationService = VisualizationService.getInstance(); 