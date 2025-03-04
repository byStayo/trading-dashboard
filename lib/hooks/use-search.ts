'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient } from '../api/api-client';

interface TickerResult {
  ticker: string;
  name: string;
  market: string;
  type: string;
  active: boolean;
  primaryExchange: string;
  [key: string]: unknown;
}

interface SearchFilters {
  type?: 'stocks' | 'crypto' | 'forex';
  market?: 'stocks' | 'crypto' | 'fx';
  active?: boolean;
  [key: string]: unknown;
}

interface UseSearchOptions {
  limit?: number;
  debounceMs?: number;
  filters?: SearchFilters;
  onError?: (error: Error) => void;
}

export function useSearch(options: UseSearchOptions = {}) {
  const {
    limit = 10,
    debounceMs = 300,
    filters = {},
    onError,
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TickerResult[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.searchTickers({
        query: searchQuery,
        limit,
        ...filters,
      });

      setResults(response.data);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Search failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [limit, filters, onError]);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query) {
      debounceTimerRef.current = setTimeout(() => {
        search(query);
      }, debounceMs);
    } else {
      setResults([]);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, search, debounceMs]);

  return {
    query,
    setQuery,
    results,
    error,
    isLoading,
  };
}

// Hook for advanced search with custom filters
export function useAdvancedSearch(options: UseSearchOptions = {}) {
  const {
    limit = 10,
    filters = {},
    onError,
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TickerResult[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const search = useCallback(async () => {
    if (!query) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.advancedSearch({
        query,
        limit,
        ...appliedFilters,
      });

      setResults(response.data);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Advanced search failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [query, limit, appliedFilters, onError]);

  // Update filters and trigger search
  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters,
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setAppliedFilters({});
  }, []);

  // Execute search when filters change
  useEffect(() => {
    if (query) {
      search();
    }
  }, [query, appliedFilters, search]);

  return {
    query,
    setQuery,
    results,
    error,
    isLoading,
    filters: appliedFilters,
    updateFilters,
    clearFilters,
    search,
  };
} 