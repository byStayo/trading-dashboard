import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../api/api-client';

interface TechnicalIndicator {
  timestamp: number;
  value: number;
  indicator: 'SMA' | 'EMA' | 'RSI' | 'MACD';
  period: number;
}

interface CommonIndicators {
  sma: {
    20: TechnicalIndicator;
    50: TechnicalIndicator;
    200: TechnicalIndicator;
  };
  rsi: TechnicalIndicator;
}

interface UseTechnicalIndicatorsOptions {
  refreshInterval?: number;
  onUpdate?: (data: TechnicalIndicator[]) => void;
  onError?: (error: Error) => void;
}

export function useTechnicalIndicators(
  symbol: string,
  indicator: TechnicalIndicator['indicator'],
  period: number,
  timeRange: { startDate: string; endDate: string },
  options: UseTechnicalIndicatorsOptions = {}
) {
  const { refreshInterval, onUpdate, onError } = options;

  const [data, setData] = useState<TechnicalIndicator[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getTechnicalIndicators({
        symbol,
        indicator,
        period,
        startDate: timeRange.startDate,
        endDate: timeRange.endDate,
      });

      setData(response.data);
      setLastUpdated(Date.now());
      setError(null);
      onUpdate?.(response.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch technical indicators');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, indicator, period, timeRange, onUpdate, onError]);

  // Set up polling if refresh interval is provided
  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    data,
    error,
    isLoading,
    lastUpdated,
    refresh: fetchData,
  };
}

// Hook for common technical indicators
export function useCommonIndicators(
  symbol: string,
  options: UseTechnicalIndicatorsOptions = {}
) {
  const { refreshInterval, onError } = options;

  const [data, setData] = useState<CommonIndicators | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCommonIndicators(symbol);

      setData(response.data);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch common indicators');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, onError]);

  // Set up polling if refresh interval is provided
  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    data,
    error,
    isLoading,
    lastUpdated,
    refresh: fetchData,
  };
} 