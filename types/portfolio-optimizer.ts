export interface AllocationData {
  name: string
  value: number
}

export interface CorrelationData {
  [key: string]: {
    [key: string]: number
  }
}

export interface PerformanceData {
  date: string
  value: number
}

export interface TradeOrder {
  asset: string
  action: "Buy" | "Sell" | "Hold"
  quantity: number
  price: number
  reason: string
}

export interface PortfolioData {
  allocation: AllocationData[]
  correlation: CorrelationData
  performance: {
    returns: PerformanceData[]
    riskAdjustedReturns: PerformanceData[]
    drawdowns: PerformanceData[]
  }
  tradeSuggestions: TradeOrder[]
}

export interface OptimizationSettings {
  riskTolerance: number
  rebalanceFrequency: string
}

