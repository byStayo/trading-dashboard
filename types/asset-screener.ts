export interface Fundamentals {
  peRatioMin: number
  peRatioMax: number
  epsGrowthMin: number
  debtToEquityMax: number
  dividendYieldMin: number
  marketCapMin: number
}

export interface Technicals {
  rsiMin: number
  rsiMax: number
  macdSignal: string
  movingAveragePeriod: number
  movingAverageType: string
}

export interface Sentiment {
  analystRatingMin: number
  newsScore: string
  insiderBuying: boolean
}

export interface ScreeningCriteria {
  assetClass: string
  fundamentals: Fundamentals
  technicals: Technicals
  sentiment: Sentiment
}

export interface Asset {
  id: string
  symbol: string
  name: string
  assetClass: string
  price: number
  change: number
  score: number
  volume: number
  marketCap: number
  peRatio: number
} 