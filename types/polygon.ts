// Common response type
export interface PolygonResponse<T> {
  status: string;
  request_id: string;
  count?: number;
  next_url?: string;
  results: T;
}

// Aggregates (bars) types
export interface AggregateBar {
  o: number;  // Open price
  h: number;  // High price
  l: number;  // Low price
  c: number;  // Close price
  v: number;  // Volume
  vw: number; // Volume weighted average price
  t: number;  // Timestamp (Unix MS)
  n: number;  // Number of transactions
}

export interface AggregatesResponse extends PolygonResponse<AggregateBar[]> {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
}

// Ticker details types
export interface TickerDetails {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  cik?: string;
  composite_figi?: string;
  share_class_figi?: string;
  last_updated_utc?: string;
  delisted_utc?: string;
  market_cap?: number;
  description?: string;
  homepage_url?: string;
  total_employees?: number;
  phone_number?: string;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
  branding?: {
    logo_url?: string;
    icon_url?: string;
  };
}

// Quote types
export interface LastQuote {
  P: number;  // Ask price
  S: number;  // Ask size
  p: number;  // Bid price
  s: number;  // Bid size
  t: number;  // Timestamp
  q: number;  // Sequence number
  z: number;  // Tape
  X: number;  // Ask exchange
  x: number;  // Bid exchange
}

// News types
export interface NewsItem {
  id: string;
  publisher: {
    name: string;
    homepage_url: string;
    logo_url: string;
    favicon_url: string;
  };
  title: string;
  author: string;
  published_utc: string;
  article_url: string;
  tickers: string[];
  description?: string;
  keywords?: string[];
  image_url?: string;
}

// Market status types
export interface MarketStatus {
  market: string;
  serverTime: string;
  exchanges: {
    nasdaq: string;
    nyse: string;
    otc: string;
  };
  currencies: {
    fx: string;
    crypto: string;
  };
  earlyHours: boolean;
  afterHours: boolean;
}

// WebSocket message types
export interface WebSocketMessage {
  ev: string;  // Event type
  sym: string; // Symbol
  [key: string]: any;
}

export interface TradeMessage extends WebSocketMessage {
  ev: 'T';
  p: number;  // Price
  s: number;  // Size
  t: number;  // Timestamp
  x: number;  // Exchange ID
  c: number[]; // Conditions
}

export interface QuoteMessage extends WebSocketMessage {
  ev: 'Q';
  bp: number; // Bid price
  bs: number; // Bid size
  ap: number; // Ask price
  as: number; // Ask size
  t: number;  // Timestamp
  bx: number; // Bid exchange
  ax: number; // Ask exchange
}

export interface AggregateMessage extends WebSocketMessage {
  ev: 'AM';
  sym: string;  // Symbol
  v: number;    // Volume
  av: number;   // Accumulated volume
  op: number;   // Open price
  vw: number;   // Volume weighted average price
  o: number;    // Open price
  h: number;    // High price
  l: number;    // Low price
  c: number;    // Close price
  a: number;    // Average price
  s: number;    // Start timestamp
  e: number;    // End timestamp
  z: number;    // Average trade size
}

// Snapshot types
export interface SnapshotTicker {
  ticker: string;
  day?: {
    o: number;  // Open price
    h: number;  // High price
    l: number;  // Low price
    c: number;  // Close price
    v: number;  // Volume
    vw: number; // Volume weighted average price
  };
  lastTrade?: {
    p: number;  // Price
    s: number;  // Size
    t: number;  // Timestamp
    c: number[]; // Conditions
  };
  min?: {
    av: number;  // Accumulated volume
    vw: number;  // Volume weighted average price
    o: number;   // Open price
    c: number;   // Close price
    h: number;   // High price
    l: number;   // Low price
    v: number;   // Volume
    t: number;   // Timestamp
  };
  prevDay?: {
    o: number;  // Open price
    h: number;  // High price
    l: number;  // Low price
    c: number;  // Close price
    v: number;  // Volume
    vw: number; // Volume weighted average price
  };
  todaysChange?: number;
  todaysChangePerc?: number;
  updated: number;
}

export interface SnapshotResponse {
  status: string;
  tickers: SnapshotTicker[];
} 