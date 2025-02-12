export interface ResearchReport {
  id: string
  title: string
  summary: string
  category: string
  content: string
  date: string
  author: string
}

export interface RiskAssessmentData {
  recessionRisk: number
  marketVolatility: number
  creditRisk: number
  liquidityRisk: number
}

export interface GeopoliticalRisk {
  trends: Array<{
    name: string
    impact: "positive" | "negative" | "neutral"
    description: string
  }>
}

export interface EconomicCyclePoint {
  date: string
  value: number
  phase: string
}

export interface EconomicData {
  gdpGrowth: number
  gdpGrowthChange: number
  inflation: number
  inflationChange: number
  interestRate: number
  interestRateChange: number
  unemploymentRate: number
  unemploymentRateChange: number
  riskAssessment: RiskAssessmentData
  economicCycle: EconomicCyclePoint[]
  geopoliticalRisk: GeopoliticalRisk
  researchReports: ResearchReport[]
}

export interface Alert {
  title: string
  description: string
}

