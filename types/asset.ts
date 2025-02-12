export interface Asset {
  id: string
  symbol: string
  name: string
  assetClass: string
  price: number
  change: number
  score: number
}

export interface AssetDetails {
  name: string
  description: string
  sector: string
  industry: string
  marketCap: number
  peRatio: number
  dividendYield: number
  beta: number
  eps: number
  high52Week: number
  low52Week: number
  volume: number
  price: number
  relatedAssets: Asset[]
  newsItems: NewsItem[]
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  publishedAt: string
  source: string
}

export interface ChartDataPoint {
  date: string
  price: number
}

