export interface EconomicEvent {
  date: string
  name: string
  country: string
  impact: "High" | "Medium" | "Low"
  previous: string
  forecast: string
}

export interface HighImpactEvent {
  name: string
  date: string
  marketImplications: {
    direction: "up" | "down" | "neutral"
    description: string
  }
  affectedSectors: string[]
}

export interface AIRecommendation {
  asset: string
  type: "Buy" | "Sell"
  recommendation: string
  rationale: string
  timeHorizon: string
}

export interface EconomicTrend {
  name: string
  direction: "up" | "down"
  duration: string
  confidence: number
  opportunities: string[]
}

export interface EconomicEventData {
  upcomingEvents: EconomicEvent[]
  highImpactEvents: HighImpactEvent[]
  aiRecommendations: AIRecommendation[]
  economicTrends: EconomicTrend[]
}

