export interface Asset {
  id: string
  name: string
  symbol: string
  assetClass: string
  price: number
  change: number
  score: number
}

export interface AssetDetails {
  marketCap: number
  volume: number
  peRatio: number
  dividend: number
  sector: string
  industry: string
  beta: number
  eps: number
  high52Week: number
  low52Week: number
  price: number
}

export interface NewsItem {
  id: string
  title: string
  source: string
  date: string
  sentiment: "positive" | "negative" | "neutral"
  url: string
}

