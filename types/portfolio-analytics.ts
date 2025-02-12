export interface AssetAllocation {
  name: string
  value: number
}

export interface PortfolioOverview {
  assetAllocation: AssetAllocation[]
  totalValue: number
  dailyChange: number
  totalReturn: number
  riskLevel: string
}

export interface PerformanceHistoryPoint {
  date: string
  value: number
  benchmark: number
}

export interface AssetClassPerformance {
  name: string
  currentValue: number
  dailyChange: number
  totalReturn: number
}

export interface PerformanceData {
  performanceHistory: PerformanceHistoryPoint[]
  assetClassPerformance: AssetClassPerformance[]
}

export interface BenchmarkComparisonPoint {
  name: string
  portfolio: number
  benchmark: number
}

export interface HedgeFundComparison {
  name: string
  portfolioPerformance: number
  strategyAverage: number
  difference: number
}

export interface BenchmarkingData {
  benchmarkComparison: BenchmarkComparisonPoint[]
  hedgeFundComparison: HedgeFundComparison[]
}

export interface Recommendation {
  type: "buy" | "sell" | "rebalance"
  asset: string
  reason: string
  action: string
}

export interface TaxOptimizationOpportunity {
  strategy: string
  potentialSavings: number
  impact: number
  action: string
}

export interface TaxLossHarvesting {
  asset: string
  currentLoss: number
  potentialTaxBenefit: number
  recommendedAction: string
}

export interface TaxOptimizationData {
  opportunities: TaxOptimizationOpportunity[]
  taxLossHarvesting: TaxLossHarvesting[]
  annualTaxSavings: number
}

export interface PortfolioData {
  overview: PortfolioOverview
  performance: PerformanceData
  benchmarking: BenchmarkingData
  recommendations: Recommendation[]
  taxOptimization: TaxOptimizationData
}

