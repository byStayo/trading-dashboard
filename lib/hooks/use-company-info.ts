import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../api/api-client';

interface CompanyInfo {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  employees?: number;
  website?: string;
  marketCap?: number;
}

interface UseCompanyInfoOptions {
  refreshInterval?: number;
  onUpdate?: (data: CompanyInfo) => void;
  onError?: (error: Error) => void;
}

export function useCompanyInfo(
  symbol: string,
  options: UseCompanyInfoOptions = {}
) {
  const { refreshInterval, onUpdate, onError } = options;

  const [data, setData] = useState<CompanyInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCompanyInfo(symbol);

      setData(response.data);
      setLastUpdated(Date.now());
      setError(null);
      onUpdate?.(response.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch company info');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, onUpdate, onError]);

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

// Hook for batch company information
export function useCompanyInfoBatch(
  symbols: string[],
  options: UseCompanyInfoOptions = {}
) {
  const { refreshInterval, onError } = options;

  const [data, setData] = useState<Record<string, CompanyInfo>>({});
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  const fetchData = useCallback(async () => {
    if (symbols.length === 0) return;

    try {
      setIsLoading(true);
      const response = await apiClient.getCompanyInfoBatch(symbols);

      setData(response.data);
      setLastUpdated(Date.now());
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch company info batch');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [symbols, onError]);

  // Set up polling if refresh interval is provided
  useEffect(() => {
    fetchData();

    if (refreshInterval) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  // Utility functions
  const getCompanyInfo = useCallback((symbol: string) => {
    return data[symbol];
  }, [data]);

  const hasAllData = useCallback(() => {
    return symbols.every(symbol => !!data[symbol]);
  }, [symbols, data]);

  return {
    data,
    error,
    isLoading,
    lastUpdated,
    refresh: fetchData,
    getCompanyInfo,
    hasAllData,
  };
} 