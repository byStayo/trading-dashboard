export interface SECFiling {
  type: string
  date: string
  keyInsights: string
  sentiment: "Positive" | "Negative" | "Neutral"
}

export interface FinancialMetric {
  value: string
  yoyChange: string
}

export interface FinancialStatements {
  keyMetrics: {
    [key: string]: FinancialMetric
  }
  revenueEarningsTrend: {
    year: string
    revenue: number
    earnings: number
  }[]
}

export interface EarningsCall {
  keyTakeaways: string[]
  sentiment: "Positive" | "Negative" | "Neutral"
  notableQuotes: string[]
}

export interface InsiderTransaction {
  date: string
  insider: string
  type: "Buy" | "Sell"
  shares: number
  value: number
}

export interface InsiderTransactions {
  transactions: InsiderTransaction[]
  aiAnalysis: string
}

export interface Valuation {
  dcf: {
    intrinsicValue: number
    currentPrice: number
    upside: number
  }
  evEbitda: {
    companyRatio: number
    industryAverage: number
    valuation: "Undervalued" | "Overvalued" | "Fair Valued"
  }
  peerBenchmarking: {
    [key: string]: {
      company: number
      peerAverage: number
      valuation: "Undervalued" | "Overvalued" | "Fair Valued"
    }
  }
}

export interface RiskFactor {
  name: string
  risk: "Low" | "Medium" | "High"
  description: string
}

export interface EarningsManipulation {
  overallRisk: "Low" | "Medium" | "High"
  overallAssessment: string
  riskFactors: RiskFactor[]
  redFlags: string[]
}

export interface AIReport {
  hedgeFund: string
  retail: string
  institutional: string
}

export interface DueDiligenceData {
  secFilings: SECFiling[]
  financialStatements: FinancialStatements
  earningsCalls: EarningsCall
  insiderTransactions: InsiderTransactions
  valuation: Valuation
  earningsManipulation: EarningsManipulation
  aiReport: AIReport
}

