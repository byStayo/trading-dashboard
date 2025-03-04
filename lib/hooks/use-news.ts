'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient } from '../api/api-client';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: number;
  symbols: string[];
}

interface UseNewsOptions {
  limit?: number;
  page?: number;
  useStream?: boolean;
  onUpdate?: (news: NewsItem[]) => void;
  onError?: (error: Error) => void;
}

export function useNews(
  symbols?: string[],
  options: UseNewsOptions = {}
) {
  const {
    limit = 10,
    page = 1,
    useStream = false,
    onUpdate,
    onError,
  } = options;

  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getNews({
        symbols,
        limit,
        page,
      });

      setNews(prevNews => 
        page === 1 ? response.data : [...prevNews, ...response.data]
      );
      setHasMore(response.meta.page < response.meta.totalPages);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch news');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [symbols, limit, page, onError]);

  const setupEventSource = useCallback(() => {
    if (!useStream) return;

    eventSourceRef.current = apiClient.subscribeToNews(symbols);

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'initial') {
          setNews(data.data);
        } else if (data.type === 'update') {
          setNews(prevNews => [...data.data, ...prevNews]);
          onUpdate?.(data.data);
        }
      } catch (err) {
        console.error('News stream error:', err);
      }
    };

    eventSourceRef.current.onerror = (event) => {
      console.error('News stream connection error:', event);
      const error = new Error('News stream connection error');
      setError(error);
      onError?.(error);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [symbols, useStream, onUpdate, onError]);

  // Initialize news fetching
  useEffect(() => {
    if (useStream) {
      setupEventSource();
    } else {
      fetchNews();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [fetchNews, setupEventSource, useStream]);

  // Utility functions
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && !useStream) {
      fetchNews();
    }
  }, [fetchNews, isLoading, hasMore, useStream]);

  const refresh = useCallback(() => {
    if (!useStream) {
      fetchNews();
    }
  }, [fetchNews, useStream]);

  return {
    news,
    error,
    isLoading,
    hasMore,
    loadMore,
    refresh,
  };
}

// Hook for real-time news updates only
export function useNewsStream(
  symbols?: string[],
  options: Omit<UseNewsOptions, 'useStream' | 'page' | 'limit'> = {}
) {
  const { onUpdate, onError } = options;
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    eventSourceRef.current = apiClient.subscribeToNews(symbols);

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'update') {
          setLatestNews(data.data);
          onUpdate?.(data.data);
        }
      } catch (err) {
        console.error('News stream error:', err);
      }
    };

    eventSourceRef.current.onerror = (event) => {
      console.error('News stream connection error:', event);
      const error = new Error('News stream connection error');
      setError(error);
      onError?.(error);
    };

    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, [symbols, onUpdate, onError]);

  return {
    latestNews,
    error,
    isConnected: !!eventSourceRef.current,
  };
} 