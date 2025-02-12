interface HeatmapData {
  id: string
  name: string
  value: number
  aiInsights?: string
}

export async function getHeatmapData(metric: string, timeframe: string): Promise<HeatmapData[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock heatmap data
  const sectors = [
    "Technology",
    "Healthcare",
    "Financials",
    "Consumer Discretionary",
    "Communication Services",
    "Industrials",
    "Consumer Staples",
    "Energy",
    "Utilities",
    "Real Estate",
    "Materials",
  ]

  return sectors.map((sector) => ({
    id: sector.toLowerCase().replace(" ", "-"),
    name: sector,
    value: Math.random() * 100,
    aiInsights: `AI insight for ${sector} based on ${metric} over ${timeframe}`,
  }))
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

