import { analyticsService } from '../../lib/services/analytics-service';
import type { MarketData } from '../../lib/types/market-data';

describe('AnalyticsService', () => {
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

  describe('calculateVolatility', () => {
    it('should calculate volatility correctly', async () => {
      const result = await analyticsService.calculateVolatility(mockMarketData, {
        period: 2,
      });

      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('metadata');
      expect(result.value).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle single data point', async () => {
      const result = await analyticsService.calculateVolatility([mockMarketData[0]], {
        period: 1,
      });

      expect(result.value).toBe(0);
      expect(result.confidence).toBeLessThan(1);
    });
  });

  describe('calculateMomentum', () => {
    it('should calculate momentum correctly', async () => {
      const result = await analyticsService.calculateMomentum(mockMarketData, {
        period: 2,
        smoothing: 0.2,
      });

      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('metadata');
      expect(typeof result.value).toBe('number');
      expect(result.metadata.method).toBe('exponential_average');
    });

    it('should use default smoothing if not provided', async () => {
      const result = await analyticsService.calculateMomentum(mockMarketData, {
        period: 2,
      });

      expect(result.value).toBeDefined();
    });
  });

  describe('calculateCorrelation', () => {
    const mockData2: MarketData[] = [
      {
        ...mockMarketData[0],
        price: 145.0,
      },
      {
        ...mockMarketData[1],
        price: 147.5,
      },
    ];

    it('should calculate correlation correctly', async () => {
      const result = await analyticsService.calculateCorrelation(
        mockMarketData,
        mockData2,
        { period: 2 }
      );

      expect(result).toHaveProperty('value');
      expect(result.value).toBeGreaterThanOrEqual(-1);
      expect(result.value).toBeLessThanOrEqual(1);
      expect(result.metadata.method).toBe('pearson');
    });

    it('should handle perfectly correlated data', async () => {
      const result = await analyticsService.calculateCorrelation(
        mockMarketData,
        mockMarketData,
        { period: 2 }
      );

      expect(result.value).toBeCloseTo(1);
    });
  });

  describe('calculateStatistics', () => {
    it('should calculate basic statistics correctly', async () => {
      const result = await analyticsService.calculateStatistics(mockMarketData);

      expect(result).toHaveProperty('mean');
      expect(result).toHaveProperty('median');
      expect(result).toHaveProperty('standardDeviation');
      expect(result).toHaveProperty('skewness');
      expect(result).toHaveProperty('kurtosis');
      expect(result).toHaveProperty('min');
      expect(result).toHaveProperty('max');
      expect(result.mean).toBe((150.0 + 152.5) / 2);
      expect(result.min).toBe(150.0);
      expect(result.max).toBe(152.5);
    });

    it('should handle single data point', async () => {
      const result = await analyticsService.calculateStatistics([mockMarketData[0]]);

      expect(result.mean).toBe(150.0);
      expect(result.median).toBe(150.0);
      expect(result.standardDeviation).toBe(0);
      expect(result.min).toBe(150.0);
      expect(result.max).toBe(150.0);
    });
  });

  describe('detectOutliers', () => {
    it('should detect outliers correctly', async () => {
      const dataWithOutlier = [
        ...mockMarketData,
        {
          ...mockMarketData[0],
          price: 300.0, // Significant outlier
        },
      ];

      const result = await analyticsService.detectOutliers(dataWithOutlier, {
        period: 3,
        outlierThreshold: 2,
      });

      expect(result).toContain(2); // Index of the outlier
    });

    it('should handle no outliers case', async () => {
      const result = await analyticsService.detectOutliers(mockMarketData, {
        period: 2,
        outlierThreshold: 2,
      });

      expect(result).toHaveLength(0);
    });

    it('should use default threshold if not provided', async () => {
      const result = await analyticsService.detectOutliers(mockMarketData, {
        period: 2,
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });
}); 