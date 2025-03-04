export interface PolygonTrade {
  symbol: string;
  price: number;
  size: number;
  timestamp: number;
  exchange: number;
  id: string;
}

export interface PolygonQuote {
  symbol: string;
  price: number;
  size: number;
  timestamp: number;
  exchange: number;
  id: string;
  bidPrice?: number;
  bidSize?: number;
  askPrice?: number;
  askSize?: number;
} 