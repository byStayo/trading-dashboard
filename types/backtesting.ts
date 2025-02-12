export interface Asset {
  symbol: string
  name: string
  type: "stock" | "crypto" | "forex" | "commodity" | "derivative"
}

export interface DateRange {
  from: Date | null
  to: Date | null
}

export type Strategy = "moving_average_crossover" | "rsi_overbought_oversold" | "breakout" | "mean_reversion"

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

export interface BacktestResults {
  performanceData: PerformanceDataPoint[]
  metrics: BacktestMetrics
  comparisonData: BenchmarkComparison[]
}

