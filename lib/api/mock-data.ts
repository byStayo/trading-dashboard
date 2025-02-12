import { EconomicData, ResearchReport, Alert } from "@/types/ai-researcher"

export const mockEconomicData: EconomicData = {
  gdpGrowth: 2.4,
  gdpGrowthChange: 0.3,
  inflation: 3.1,
  inflationChange: -0.2,
  interestRate: 5.25,
  interestRateChange: 0,
  unemploymentRate: 3.7,
  unemploymentRateChange: -0.1,
  riskAssessment: {
    recessionRisk: 35,
    marketVolatility: 28,
    creditRisk: 42,
    liquidityRisk: 15
  },
  economicCycle: Array.from({ length: 12 }, (_, i) => ({
    date: new Date(2023, i, 1).toISOString().split('T')[0],
    value: 100 + Math.sin(i / 2) * 10,
    phase: ['Expansion', 'Peak', 'Contraction', 'Trough'][Math.floor(i / 3)]
  })),
  geopoliticalRisk: {
    trends: [
      {
        name: "Global Trade Relations",
        impact: "positive",
        description: "Improving international trade relationships and reduced tariffs"
      },
      {
        name: "Regional Conflicts",
        impact: "negative",
        description: "Ongoing geopolitical tensions affecting market stability"
      },
      {
        name: "Policy Changes",
        impact: "neutral",
        description: "New regulatory frameworks being implemented globally"
      }
    ]
  },
  researchReports: [
    {
      id: "1",
      title: "Global Market Outlook 2024",
      summary: "Analysis of major market trends and opportunities",
      category: "Market Analysis",
      content: "Detailed analysis of global market trends...",
      date: "2024-02-01",
      author: "AI Research Team"
    },
    {
      id: "2",
      title: "Emerging Technologies Impact",
      summary: "How AI and blockchain are reshaping finance",
      category: "Technology",
      content: "In-depth review of technological advancements...",
      date: "2024-02-05",
      author: "AI Research Team"
    },
    {
      id: "3",
      title: "ESG Investment Trends",
      summary: "Sustainable investing in the current market",
      category: "ESG",
      content: "Comprehensive analysis of ESG trends...",
      date: "2024-02-10",
      author: "AI Research Team"
    }
  ]
}

export const mockAlerts: Alert[] = [
  {
    title: "GDP Growth Projection Updated",
    description: "Q1 2024 GDP growth projections revised upward by 0.3%"
  },
  {
    title: "Inflation Alert",
    description: "Core inflation shows signs of moderation"
  },
  {
    title: "Market Volatility Warning",
    description: "VIX index showing increased market uncertainty"
  }
] 