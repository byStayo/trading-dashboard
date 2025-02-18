import axios, { AxiosInstance, AxiosError } from 'axios';

// API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: number;
    cached?: boolean;
    source?: string;
  };
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    timestamp: number;
    cached?: boolean;
    source?: string;
  };
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string = 'API_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;
  private authToken: string | null = null;

  private constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response) {
          const { status, data } = error.response;
          throw new ApiError(
            (data as any)?.error || 'An error occurred',
            status,
            (data as any)?.code
          );
        }
        throw new ApiError('Network error', 500);
      }
    );
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  // Market Data endpoints
  async getMarketData(symbols: string[]): Promise<ApiResponse<Record<string, any>>> {
    return this.client.get('/market-data', { params: { symbols: symbols.join(',') } });
  }

  async getMarketDataBatch(symbols: string[]): Promise<ApiResponse<Record<string, any>>> {
    return this.client.post('/market-data', { symbols });
  }

  // Technical Indicators endpoints
  async getTechnicalIndicators(params: {
    symbol: string;
    indicator: string;
    period: number;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<any[]>> {
    return this.client.post('/technical', params);
  }

  async getCommonIndicators(symbol: string): Promise<ApiResponse<any>> {
    return this.client.get('/technical', { params: { symbol } });
  }

  // News endpoints
  async getNews(params: {
    symbols?: string[];
    limit?: number;
    page?: number;
  }): Promise<PaginatedResponse<any>> {
    return this.client.get('/news', { params });
  }

  subscribeToNews(symbols?: string[]): EventSource {
    const params = new URLSearchParams();
    if (symbols) {
      params.set('symbols', symbols.join(','));
    }
    return new EventSource(`/api/news?${params.toString()}`);
  }

  // Company endpoints
  async getCompanyInfo(symbol: string): Promise<ApiResponse<any>> {
    return this.client.get('/company', { params: { symbol } });
  }

  async getCompanyInfoBatch(symbols: string[]): Promise<ApiResponse<Record<string, any>>> {
    return this.client.post('/company', { symbols });
  }

  // Search endpoints
  async searchTickers(params: {
    query: string;
    limit?: number;
    type?: string;
    market?: string;
    active?: boolean;
  }): Promise<PaginatedResponse<any>> {
    return this.client.get('/search', { params });
  }

  async advancedSearch(params: {
    query: string;
    limit?: number;
    type?: string;
    market?: string;
    active?: boolean;
    filters?: Record<string, any>;
  }): Promise<PaginatedResponse<any>> {
    return this.client.post('/search', params);
  }

  // WebSocket connection
  connectWebSocket(symbols: string[]): WebSocket {
    const ws = new WebSocket(`${window.location.origin.replace('http', 'ws')}/ws`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'subscribe',
        symbols,
      }));
    };

    return ws;
  }
}

export const apiClient = ApiClient.getInstance(); 