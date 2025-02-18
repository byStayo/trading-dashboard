export interface StockData {
  symbol: string;
  name: string | null;
  price: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  dayOpen: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  marketCap: number | null;
  exchange: string | null;
  type: string | null;
  lastUpdated: number | null;
} 