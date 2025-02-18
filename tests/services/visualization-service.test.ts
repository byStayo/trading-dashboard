import { visualizationService } from '../../lib/services/visualization-service';
import type { MarketData, ChartConfig } from '../../lib/types/market-data';

describe('VisualizationService', () => {
  const mockMarketData: MarketData[] = [
    {
      symbol: 'AAPL',
      price: 150.0,
      change: 2.5,
      changePercent: 1.67,
      volume: 1000000,
      lastUpdated: Date.now(),
      metadata: {
        source: 'websocket',
        reliability: 1,
        staleness: 0,
      },
    },
    {
      symbol: 'AAPL',
      price: 152.5,
      change: 2.5,
      changePercent: 1.67,
      volume: 1200000,
      lastUpdated: Date.now() + 60000,
      metadata: {
        source: 'websocket',
        reliability: 1,
        staleness: 0,
      },
    },
  ];

  const mockChartConfig: ChartConfig = {
    type: 'line',
    timeframe: '1m',
    indicators: ['SMA-20'],
    overlay: false,
    theme: 'light',
  };

  describe('prepareChartData', () => {
    it('should transform market data into chart data', async () => {
      const result = await visualizationService.prepareChartData(mockMarketData, mockChartConfig);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('config');
      expect(result).toHaveProperty('metadata');
      expect(result.data).toHaveLength(2);
      expect(result.config).toEqual(mockChartConfig);
      expect(result.metadata.symbol).toBe('AAPL');
    });

    it('should handle different chart types', async () => {
      // Test line chart
      const lineResult = await visualizationService.prepareChartData(mockMarketData, {
        ...mockChartConfig,
        type: 'line',
      });
      expect(lineResult.data[0]).toHaveProperty('value');
      expect(lineResult.data[0]).toHaveProperty('timestamp');

      // Test candlestick chart
      const candlestickResult = await visualizationService.prepareChartData(mockMarketData, {
        ...mockChartConfig,
        type: 'candlestick',
      });
      expect(candlestickResult.data[0]).toHaveProperty('open');
      expect(candlestickResult.data[0]).toHaveProperty('close');
      expect(candlestickResult.data[0]).toHaveProperty('high');
      expect(candlestickResult.data[0]).toHaveProperty('low');

      // Test bar chart
      const barResult = await visualizationService.prepareChartData(mockMarketData, {
        ...mockChartConfig,
        type: 'bar',
      });
      expect(barResult.data[0]).toHaveProperty('value');
      expect(barResult.data[0].value).toBe(mockMarketData[0].volume);
    });

    it('should aggregate data based on timeframe', async () => {
      const result = await visualizationService.prepareChartData(mockMarketData, {
        ...mockChartConfig,
        timeframe: '5m',
      });

      // Since our mock data points are within 5 minutes, they should be aggregated
      expect(result.data).toHaveLength(1);
      if (result.config.type === 'line') {
        expect(result.data[0].value).toBe(mockMarketData[1].price);
      }
    });

    it('should add technical indicators when requested', async () => {
      const result = await visualizationService.prepareChartData(mockMarketData, {
        ...mockChartConfig,
        indicators: ['SMA-20', 'RSI-14'],
      });

      expect(result.data[0]).toHaveProperty('SMA-20');
      expect(result.data[0]).toHaveProperty('RSI-14');
    });

    it('should handle empty data array', async () => {
      const result = await visualizationService.prepareChartData([], mockChartConfig);

      expect(result.data).toHaveLength(0);
      expect(result.metadata.symbol).toBe('unknown');
    });

    it('should throw error for invalid chart type', async () => {
      await expect(
        visualizationService.prepareChartData(mockMarketData, {
          ...mockChartConfig,
          type: 'invalid' as any,
        })
      ).rejects.toThrow('Unsupported chart type: invalid');
    });
  });

  describe('getDefaultConfig', () => {
    it('should return default configuration', () => {
      const config = visualizationService.getDefaultConfig();

      expect(config).toHaveProperty('type', 'line');
      expect(config).toHaveProperty('timeframe', '1m');
      expect(config).toHaveProperty('indicators');
      expect(config).toHaveProperty('overlay', false);
      expect(config).toHaveProperty('theme', 'light');
    });

    it('should allow overriding chart type', () => {
      const config = visualizationService.getDefaultConfig('candlestick');

      expect(config.type).toBe('candlestick');
    });
  });
}); 