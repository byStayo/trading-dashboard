// Market data types
export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdated: number;
  metadata: {
    source: 'websocket' | 'rest' | 'cache';
    reliability: number;
    staleness: number;
  };
}

// Technical indicator types
export interface TechnicalIndicator {
  timestamp: number;
  value: number;
  indicator: 'SMA' | 'EMA' | 'RSI' | 'MACD';
  period: number;
  metadata?: {
    source: string;
    confidence: number;
  };
}

// Company information types
export interface CompanyInfo {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  employees?: number;
  website?: string;
  marketCap?: number;
  metadata: {
    lastUpdated: number;
    source: string;
    reliability: number;
  };
}

// News item types
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: number;
  symbols: string[];
  sentiment?: {
    score: number;
    confidence: number;
  };
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'trade' | 'quote' | 'aggregate';
  data: unknown;
  timestamp: number;
}

// Chart configuration types
export interface ChartConfig {
  type: 'line' | 'candlestick' | 'bar' | 'scatter';
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';
  indicators?: string[];
  overlay?: boolean;
  theme?: 'light' | 'dark';
}

export interface ChartData {
  data: any[];
  config: ChartConfig;
  metadata: {
    symbol: string;
    lastUpdated: number;
    dataPoints: number;
  };
}

// Widget configuration types
export interface WidgetConfig {
  id: string;
  type: 'chart' | 'stats' | 'news' | 'alerts';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  settings: {
    symbol?: string;
    chartConfig?: ChartConfig;
    statsType?: 'volatility' | 'momentum' | 'statistics';
    period?: number;
    smoothing?: number;
  };
}

// Batch operation types
export interface BatchResult<T> {
  data: T[];
  errors: Error[];
  metadata: {
    total: number;
    successful: number;
    failed: number;
    duration: number;
  };
}

// Error types
export interface ValidationError {
  message: string;
  field?: string;
  value?: unknown;
  code: string;
}

export interface TransformError {
  message: string;
  source: string;
  target: string;
  data: unknown;
}

// Configuration types
export interface DataSourceConfig {
  type: 'rest' | 'websocket' | 'cache';
  priority: number;
  ttl: number;
  retryConfig?: {
    maxRetries: number;
    backoffMs: number;
  };
}

export interface ValidationConfig {
  strict: boolean;
  allowPartial: boolean;
  requiredFields: string[];
}

export interface TransformConfig {
  normalize: boolean;
  validate: boolean;
  format: 'compact' | 'full';
}

// Utility types
export type DataType = 'market' | 'technical' | 'company' | 'news';
export type SourceType = 'rest' | 'websocket' | 'cache';
export type ValidationLevel = 'strict' | 'lenient' | 'none'; 