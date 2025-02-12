export interface TechnicalAnalysisData {
  priceData: {
    date: string
    price: number
  }[]
  detectedPatterns: {
    name: string
    description: string
    confidence: number
  }[]
  trendlines: {
    startDate: string
    endDate: string
    startValue: number
    endValue: number
  }[]
  fibonacciLevels: {
    level: number
    value: number
  }[]
  sentimentData: {
    bullishPercentage: number
    bearishPercentage: number
    neutralPercentage: number
  }
}

export interface TradeSignal {
  type: "buy" | "sell"
  symbol: string
  price: number
  confidence: number
  timestamp: string
}

