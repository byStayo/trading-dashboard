import type { TradeData } from "@/types/trading-journal"

export async function getTradeData(): Promise<TradeData> {
  // TODO: Implement actual API call to fetch trade data
  // This is a mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        trades: [
          {
            date: "2023-06-01T10:30:00Z",
            symbol: "AAPL",
            type: "Buy",
            entryPrice: 150.25,
            exitPrice: 155.5,
            quantity: 100,
            profitLoss: 525,
          },
          {
            date: "2023-06-02T14:15:00Z",
            symbol: "GOOGL",
            type: "Sell",
            entryPrice: 2500.0,
            exitPrice: 2480.75,
            quantity: 10,
            profitLoss: -192.5,
          },
          {
            date: "2023-06-03T11:45:00Z",
            symbol: "TSLA",
            type: "Buy",
            entryPrice: 200.5,
            exitPrice: 210.25,
            quantity: 50,
            profitLoss: 487.5,
          },
        ],
        behaviorAnalysis: {
          "Risk Management": { score: 75, description: "Good overall, but room for improvement in position sizing." },
          "Emotional Control": {
            score: 60,
            description: "Tendency to hold losing trades too long. Work on cutting losses quicker.",
          },
          Discipline: { score: 85, description: "Strong adherence to trading plan. Keep up the good work!" },
          Patience: { score: 70, description: "Occasionally entering trades prematurely. Wait for better setups." },
        },
        performanceReview: {
          metrics: {
            "Win Rate": 65,
            "Profit Factor": 1.8,
            "Average Win": 450,
            "Average Loss": 275,
            "Sharpe Ratio": 1.2,
            "Max Drawdown": "15%",
          },
          equityCurve: [
            { date: "2023-06-01", equity: 10000 },
            { date: "2023-06-02", equity: 10525 },
            { date: "2023-06-03", equity: 10332.5 },
            { date: "2023-06-04", equity: 10820 },
          ],
          improvementStrategies: [
            "Implement a more robust risk management strategy, focusing on consistent position sizing.",
            "Practice mindfulness techniques to improve emotional control during trades.",
            "Set up alerts for optimal trade setups to enhance patience and entry timing.",
            "Review and adjust your stop-loss strategy to minimize average losses.",
          ],
        },
        realtimeFeedback: [
          {
            type: "warning",
            category: "Risk Management",
            title: "Large Position Size",
            description:
              "Your current position in AAPL is 25% of your portfolio. Consider reducing to align with your risk management rules.",
          },
          {
            type: "success",
            category: "Discipline",
            title: "Adhered to Stop-Loss",
            description: "Well done on executing your stop-loss on the GOOGL trade. This demonstrates good discipline.",
          },
          {
            type: "info",
            category: "Market Conditions",
            title: "Increased Volatility",
            description:
              "Market volatility has increased. Consider adjusting your position sizes and being more selective with entries.",
          },
        ],
      })
    }, 1000)
  })
}

