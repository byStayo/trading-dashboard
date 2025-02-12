interface HeatmapData {
  symbol: string
  name: string
  sector: string
  value: number
  change: number
}

export async function getHeatmapData(metric: string, timeframe: string): Promise<HeatmapData[]> {
  // TODO: Replace with actual API call
  // This is a mock implementation
  return [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      sector: "Technology",
      value: 75,
      change: 2.5
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      sector: "Technology",
      value: 82,
      change: 1.8
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      sector: "Technology",
      value: 68,
      change: -0.5
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      sector: "Consumer Cyclical",
      value: 71,
      change: 1.2
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      sector: "Technology",
      value: 90,
      change: 4.2
    },
    {
      symbol: "META",
      name: "Meta Platforms Inc.",
      sector: "Technology",
      value: 65,
      change: -1.5
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      sector: "Automotive",
      value: 45,
      change: -3.2
    },
    {
      symbol: "JPM",
      name: "JPMorgan Chase & Co.",
      sector: "Financial Services",
      value: 58,
      change: 0.8
    },
    {
      symbol: "V",
      name: "Visa Inc.",
      sector: "Financial Services",
      value: 62,
      change: 1.1
    }
  ]
}

type UpdateCallback = (update: {
  sectorId: string
  value: number
  aiInsights?: string
  alert?: string
}) => void

export function subscribeToRealtimeUpdates(callback: UpdateCallback): () => void {
  const intervalId = setInterval(() => {
    const update = {
      sectorId: ["technology", "healthcare", "financials"][Math.floor(Math.random() * 3)],
      value: Math.random() * 100,
      aiInsights: `Updated AI insight for ${["Technology", "Healthcare", "Financials"][Math.floor(Math.random() * 3)]}`,
      alert:
        Math.random() < 0.2
          ? `Unusual activity detected in ${["Technology", "Healthcare", "Financials"][Math.floor(Math.random() * 3)]} sector`
          : undefined,
    }
    callback(update)
  }, 5000) // Send updates every 5 seconds

  return () => clearInterval(intervalId)
}

