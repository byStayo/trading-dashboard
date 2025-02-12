export interface Trade {
  date: string
  symbol: string
  type: "Buy" | "Sell"
  entryPrice: number
  exitPrice: number
  quantity: number
  profitLoss: number
}

export interface BehaviorAnalysis {
  [behavior: string]: {
    score: number
    description: string
  }
}

export interface PerformanceMetrics {
  [metric: string]: number | string
}

export interface EquityPoint {
  date: string
  equity: number
}

export interface PerformanceReview {
  metrics: PerformanceMetrics
  equityCurve: EquityPoint[]
  improvementStrategies: string[]
}

export interface RealtimeFeedback {
  type: "warning" | "success" | "info"
  category: string
  title: string
  description: string
}

export interface TradeData {
  trades: Trade[]
  behaviorAnalysis: BehaviorAnalysis
  performanceReview: PerformanceReview
  realtimeFeedback: RealtimeFeedback[]
}

