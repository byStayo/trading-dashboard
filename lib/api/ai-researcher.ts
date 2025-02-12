import type { EconomicData, Alert } from "@/types/ai-researcher"

export async function getEconomicData(): Promise<EconomicData> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock economic data
  return {
    gdpGrowth: 2.5,
    gdpGrowthChange: 0.3,
    inflation: 2.1,
    inflationChange: -0.2,
    interestRate: 1.75,
    interestRateChange: 0,
    unemploymentRate: 3.9,
    unemploymentRateChange: -0.1,
    riskAssessment: {
      recessionRisk: 25,
      marketVolatility: 40,
      creditRisk: 30,
      liquidityRisk: 20,
    },
    economicCycle: [
      { date: "2023-01", value: 95 },
      { date: "2023-02", value: 97 },
      { date: "2023-03", value: 99 },
      { date: "2023-04", value: 102 },
      { date: "2023-05", value: 104 },
      { date: "2023-06", value: 103 },
    ],
    geopoliticalRisk: {
      trends: [
        {
          name: "US-China Trade Tensions",
          impact: "negative",
          description: "Ongoing trade disputes between the US and China are creating market uncertainty.",
        },
        {
          name: "European Energy Crisis",
          impact: "negative",
          description: "Energy shortages in Europe are impacting industrial output and consumer spending.",
        },
        {
          name: "Emerging Market Growth",
          impact: "positive",
          description:
            "Several emerging markets are showing strong economic growth, presenting new investment opportunities.",
        },
      ],
    },
    researchReports: [
      {
        id: "1",
        title: "Q3 2023 Global Economic Outlook",
        summary: "Analysis of global economic trends and forecasts for the coming quarter.",
        category: "Economic Forecast",
        content: "<p>Detailed content of the research report...</p>",
        date: "2023-06-15",
        author: "Dr. Jane Smith, Chief Economist",
      },
      {
        id: "2",
        title: "Impact of AI on Labor Markets",
        summary: "Examining the potential effects of AI adoption on global employment trends.",
        category: "Technology & Economics",
        content: "<p>Detailed content of the research report...</p>",
        date: "2023-06-14",
        author: "Prof. John Doe, AI & Economics Researcher",
      },
      {
        id: "3",
        title: "Emerging Market Debt Analysis",
        summary: "Review of debt levels and sustainability in key emerging market economies.",
        category: "Fixed Income",
        content: "<p>Detailed content of the research report...</p>",
        date: "2023-06-13",
        author: "Sarah Johnson, Fixed Income Strategist",
      },
    ],
  }
}

type AlertCallback = (alert: Alert) => void

export function subscribeToAlerts(callback: AlertCallback): () => void {
  const intervalId = setInterval(() => {
    const alert: Alert = {
      title: "Unexpected Inflation Data",
      description: "US CPI data came in higher than expected, potentially impacting Fed policy.",
    }
    callback(alert)
  }, 10000) // Send an alert every 10 seconds for demonstration purposes

  return () => clearInterval(intervalId)
}

