// This would normally fetch from a real API
export async function fetchStockData(symbol: string) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    basicInfo: {
      symbol,
      name: getMockCompanyName(symbol),
      price: 185.92,
      change: 1.25,
      marketCap: "3.02T",
      sector: "Technology",
    },
    healthMetrics: {
      profitabilityScore: 76,
      solvencyScore: 91,
      profitabilityMetrics: [
        { label: "Positive Free Cash Flow", value: true },
        { label: "Positive Gross Profit", value: true },
        { label: "Exceptional 3-Year Average ROIC", value: true },
      ],
      solvencyMetrics: [
        { label: "High Interest Coverage", value: true },
        { label: "High Altman Z-Score", value: true },
        { label: "Low D/E", value: true },
      ],
    },
    analystData: {
      priceTargets: [
        { date: "May '24", price: 200, actual: 180 },
        { date: "Sept '24", price: 220, actual: 210 },
        { date: "Jan '25", price: 240, actual: 230 },
        { date: "May '25", price: 260 },
        { date: "Sept '25", price: 280 },
        { date: "Jan '26", price: 300 },
      ],
      revenueEstimates: [
        { year: "2020", actual: 274.5, estimate: 275.2, miss: 0.25 },
        { year: "2021", actual: 365.8, estimate: 360.1, miss: -1.5 },
        { year: "2022", actual: 394.3, estimate: 400.2, miss: 1.5 },
        { year: "2023", actual: 383.9, estimate: 385.1, miss: 0.3 },
        { year: "2024", estimate: 410.5 },
        { year: "2025", estimate: 445.2 },
        { year: "2026", estimate: 482.8 },
      ],
    },
  }
}

function getMockCompanyName(symbol: string) {
  const companies: { [key: string]: string } = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com Inc.",
    META: "Meta Platforms Inc.",
  }
  return companies[symbol] || "Unknown Company"
}

