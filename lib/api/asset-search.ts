import type { Asset, AssetDetails, NewsItem } from "@/types/asset"

// This is a mock implementation. In a real-world scenario, you would integrate with actual APIs.
export async function searchAssets(query: string): Promise<Asset[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock data
  const assets: Asset[] = [
    { id: "1", name: "Apple Inc.", symbol: "AAPL", assetClass: "Stock", price: 150.25, change: 2.5, score: 85 },
    { id: "2", name: "Bitcoin", symbol: "BTC", assetClass: "Cryptocurrency", price: 35000, change: -1.2, score: 78 },
    { id: "3", name: "US 10Y Treasury", symbol: "US10Y", assetClass: "Bond", price: 98.5, change: 0.5, score: 72 },
    { id: "4", name: "SPDR S&P 500 ETF", symbol: "SPY", assetClass: "ETF", price: 420.5, change: 1.1, score: 80 },
    { id: "5", name: "Gold", symbol: "XAU", assetClass: "Commodity", price: 1800, change: -0.3, score: 75 },
  ]

  return assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(query.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(query.toLowerCase()),
  )
}

export async function getAssetDetails(assetId: string): Promise<AssetDetails> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock data
  return {
    marketCap: 2500000000000,
    volume: 75000000,
    peRatio: 28.5,
    dividend: 0.65,
    sector: "Technology",
    industry: "Consumer Electronics",
    beta: 1.2,
    eps: 5.61,
    high52Week: 182.94,
    low52Week: 124.17,
    price: 150.25,
  }
}

export async function getRelatedAssets(assetId: string): Promise<Asset[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock data
  return [
    {
      id: "6",
      name: "Microsoft Corporation",
      symbol: "MSFT",
      assetClass: "Stock",
      price: 280.75,
      change: 1.8,
      score: 82,
    },
    { id: "7", name: "Alphabet Inc.", symbol: "GOOGL", assetClass: "Stock", price: 2750.5, change: -0.5, score: 79 },
    { id: "8", name: "Amazon.com Inc.", symbol: "AMZN", assetClass: "Stock", price: 3300.25, change: 0.9, score: 81 },
  ]
}

export async function getAssetNews(assetId: string): Promise<NewsItem[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock data
  return [
    {
      id: "1",
      title: "Apple's new product launch exceeds expectations",
      source: "TechCrunch",
      date: "2023-06-15",
      sentiment: "positive",
      url: "https://example.com/news1",
    },
    {
      id: "2",
      title: "iPhone sales decline in Q2, but services revenue grows",
      source: "Wall Street Journal",
      date: "2023-06-14",
      sentiment: "neutral",
      url: "https://example.com/news2",
    },
    {
      id: "3",
      title: "Apple faces antitrust scrutiny over App Store policies",
      source: "Reuters",
      date: "2023-06-13",
      sentiment: "negative",
      url: "https://example.com/news3",
    },
  ]
}

export async function getAssetChartData(assetId: string, timeframe: string): Promise<any[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock data
  const generateDataPoint = (date: Date, basePrice: number) => ({
    date: date.toISOString().split("T")[0],
    price: basePrice + Math.random() * 10 - 5,
  })

  const basePrice = 150
  const dataPoints = 30
  const endDate = new Date()
  let startDate: Date

  switch (timeframe) {
    case "1D":
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000)
      break
    case "1W":
      startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "1M":
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case "3M":
      startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case "1Y":
      startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    case "5Y":
      startDate = new Date(endDate.getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  const data = []
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(startDate.getTime() + (i * (endDate.getTime() - startDate.getTime())) / (dataPoints - 1))
    data.push(generateDataPoint(date, basePrice))
  }

  return data
}

