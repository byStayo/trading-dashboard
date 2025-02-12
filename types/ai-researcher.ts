export interface EconomicData {
  gdpGrowth: number
  gdpGrowthChange: number
  inflation: number
  inflationChange: number
  interestRate: number
  interestRateChange: number
  unemploymentRate: number
  unemploymentRateChange: number
  riskAssessment: {
    recessionRisk: number
    marketVolatility: number
    creditRisk: number
    liquidityRisk: number
  }
  economicCycle: {
    date: string
    value: number
  }[]
  geopoliticalRisk: {
    trends: {
      name: string
      impact: "positive" | "negative" | "neutral"
      description: string
    }[]
  }
  researchReports: {
    id: string
    title: string
    summary: string
    category: string
    content: string
    date: string
    author: string
  }[]
}

export interface Alert {
  title: string
  description: string
}

