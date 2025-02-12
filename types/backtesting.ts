export interface Asset {
  symbol: string
  name: string
  type: "stock" | "crypto" | "forex" | "commodity" | "derivative"
}

export interface DateRange {
  from: Date | null
  to: Date | null
}

export type Strategy = "momentum" | "meanReversion" | "trendFollowing"

export interface StrategyParameters {
  [key: string]: number
}

export interface PerformanceDataPoint {
  date: string
  strategy: number
  benchmark: number
}

export interface BacktestMetrics {
  totalReturn: number
  annualizedReturn: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
  winRate: number
}

export interface BenchmarkComparison {
  name: string
  return: number
  sharpeRatio: number
  maxDrawdown: number
}

export interface BacktestParameters {
  assets: string[]
  strategy: Strategy
  startDate: Date
  endDate: Date
}

export interface BacktestResults {
  returns: number[]
  dates: string[]
  metrics: {
    totalReturn: number
    annualizedReturn: number
    sharpeRatio: number
    maxDrawdown: number
    volatility: number
  }
  trades: {
    date: string
    type: "buy" | "sell"
    asset: string
    price: number
    quantity: number
  }[]
}

