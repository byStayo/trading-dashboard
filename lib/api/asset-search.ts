import type { Asset, AssetDetails, NewsItem } from "@/types/asset"

const mockAssets: Asset[] = [
  { id: "1", symbol: "AAPL", name: "Apple Inc.", assetClass: "stocks", price: 175.84, change: 2.5, score: 85 },
  { id: "2", symbol: "MSFT", name: "Microsoft Corporation", assetClass: "stocks", price: 380.45, change: 1.8, score: 82 },
  { id: "3", symbol: "GOOGL", name: "Alphabet Inc.", assetClass: "stocks", price: 142.65, change: -0.5, score: 80 },
  { id: "4", symbol: "AMZN", name: "Amazon.com Inc.", assetClass: "stocks", price: 168.32, change: 1.2, score: 83 },
  { id: "5", symbol: "META", name: "Meta Platforms Inc.", assetClass: "stocks", price: 468.90, change: 3.1, score: 79 },
  { id: "6", symbol: "TSLA", name: "Tesla Inc.", assetClass: "stocks", price: 193.57, change: -2.3, score: 75 },
  { id: "7", symbol: "NVDA", name: "NVIDIA Corporation", assetClass: "stocks", price: 726.13, change: 4.2, score: 88 },
  { id: "8", symbol: "JPM", name: "JPMorgan Chase & Co.", assetClass: "stocks", price: 183.99, change: 0.8, score: 81 },
  { id: "9", symbol: "V", name: "Visa Inc.", assetClass: "stocks", price: 278.56, change: 1.1, score: 84 },
  { id: "10", symbol: "WMT", name: "Walmart Inc.", assetClass: "stocks", price: 175.84, change: 0.9, score: 77 }
]

// This is a mock implementation. In a real-world scenario, you would integrate with actual APIs.
export async function searchAssets(query: string): Promise<Asset[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Filter assets based on query
  return mockAssets.filter(asset => 
    asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
    asset.name.toLowerCase().includes(query.toLowerCase())
  )
}

export async function getAssetDetails(symbol: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  return {
    name: mockAssets.find(a => a.symbol === symbol)?.name || "Unknown Company",
    description: "A leading technology company focused on innovation and growth.",
    sector: "Technology",
    industry: "Consumer Electronics",
    marketCap: 2500000000000,
    peRatio: 28.5,
    dividendYield: 0.5,
    beta: 1.2,
    eps: 6.5,
    high52Week: 198.23,
    low52Week: 124.17,
    volume: 82500000,
    price: 175.84,
    relatedAssets: mockAssets.slice(0, 3),
    newsItems: [
      {
        id: "1",
        title: "Company Announces New Product Line",
        summary: "Revolutionary new products expected to drive growth",
        url: "#",
        publishedAt: new Date().toISOString(),
        source: "Financial Times"
      },
      {
        id: "2",
        title: "Q4 Earnings Beat Expectations",
        summary: "Strong performance across all segments",
        url: "#",
        publishedAt: new Date().toISOString(),
        source: "Reuters"
      },
      {
        id: "3",
        title: "Strategic Partnership Announced",
        summary: "New collaboration to expand market reach",
        url: "#",
        publishedAt: new Date().toISOString(),
        source: "Bloomberg"
      }
    ]
  }
}

export async function getAssetChartData(assetId: string, timeframe: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Generate mock chart data based on timeframe
  const points = timeframe === "1D" ? 24 : 
                timeframe === "1W" ? 7 : 
                timeframe === "1M" ? 30 : 
                timeframe === "3M" ? 90 : 
                timeframe === "1Y" ? 365 : 1825

  const basePrice = 150
  const volatility = 0.02

  return Array.from({ length: points }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (points - i))
    
    const randomWalk = Array.from({ length: i + 1 }, () => 
      (Math.random() - 0.5) * volatility
    ).reduce((a, b) => a + b, 0)

    return {
      date: date.toISOString().split('T')[0],
      price: basePrice * (1 + randomWalk)
    }
  })
}

