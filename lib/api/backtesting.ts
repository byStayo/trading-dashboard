import { BacktestParameters, BacktestResults, Strategy, StrategyParameters } from "@/types/backtesting"

export async function runBacktest(params: BacktestParameters): Promise<BacktestResults> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Generate mock backtest results
  const dates = Array.from({ length: 180 }, (_, i) => {
    const date = new Date(params.startDate)
    date.setDate(date.getDate() + i)
    return date.toISOString().split('T')[0]
  })

  const returns = dates.map(() => (Math.random() - 0.48) * 2) // Slightly positive bias
  const cumulativeReturns = returns.reduce((acc, curr) => [...acc, (acc[acc.length - 1] || 1) * (1 + curr)], [] as number[])

  return {
    returns,
    dates,
    metrics: {
      totalReturn: (cumulativeReturns[cumulativeReturns.length - 1] - 1) * 100,
      annualizedReturn: 12.3,
      sharpeRatio: 1.8,
      maxDrawdown: -15.2,
      volatility: 18.5
    },
    trades: [
      {
        date: dates[10],
        type: "buy",
        asset: params.assets[0],
        price: 150.25,
        quantity: 100
      },
      {
        date: dates[50],
        type: "sell",
        asset: params.assets[0],
        price: 165.50,
        quantity: 50
      },
      {
        date: dates[90],
        type: "buy",
        asset: params.assets[1],
        price: 280.75,
        quantity: 75
      },
      {
        date: dates[130],
        type: "sell",
        asset: params.assets[1],
        price: 295.25,
        quantity: 75
      }
    ]
  }
}

export async function optimizeStrategy(
  strategy: Strategy,
  initialParameters: StrategyParameters
): Promise<StrategyParameters> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Return slightly modified parameters to simulate optimization
  return Object.entries(initialParameters).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: value * (1 + (Math.random() - 0.5) * 0.2) // Adjust by ±10%
  }), {} as StrategyParameters)
}

function generateMockPerformanceData() {
  const startDate = new Date("2022-01-01")
  const data = []
  let strategyValue = 100
  let benchmarkValue = 100

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    strategyValue *= 1 + (Math.random() - 0.5) * 0.02
    benchmarkValue *= 1 + (Math.random() - 0.5) * 0.015

    data.push({
      date: date.toISOString().split("T")[0],
      strategy: strategyValue,
      benchmark: benchmarkValue,
    })
  }

  return data
}

