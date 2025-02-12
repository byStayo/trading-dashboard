"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BacktestResults } from "@/types/backtesting"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface StrategyOptimizerProps {
  results: BacktestResults
}

export function StrategyOptimizer({ results }: StrategyOptimizerProps) {
  const chartData = results.dates.map((date, index) => ({
    date,
    return: results.returns[index],
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Return</div>
              <div className="text-2xl font-bold">{results.metrics.totalReturn.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Annualized Return</div>
              <div className="text-2xl font-bold">{results.metrics.annualizedReturn.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Sharpe Ratio</div>
              <div className="text-2xl font-bold">{results.metrics.sharpeRatio.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Max Drawdown</div>
              <div className="text-2xl font-bold">{results.metrics.maxDrawdown.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Volatility</div>
              <div className="text-2xl font-bold">{results.metrics.volatility.toFixed(2)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="return" stroke="#8884d8" name="Return %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.trades.map((trade, index) => (
              <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{trade.asset}</div>
                  <div className="text-sm text-muted-foreground">{trade.date}</div>
                </div>
                <div>
                  <div className={`font-medium ${trade.type === "buy" ? "text-green-600" : "text-red-600"}`}>
                    {trade.type.toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {trade.quantity} @ ${trade.price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

