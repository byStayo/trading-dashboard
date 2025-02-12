"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { Badge } from "@/components/ui/badge"

interface PortfolioItem {
  symbol: string
  value: number
  change: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const generateRandomPortfolio = (): PortfolioItem[] => {
  const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"]
  return symbols.map((symbol) => ({
    symbol,
    value: Math.random() * 10000 + 5000,
    change: (Math.random() - 0.5) * 10,
  }))
}

export function PortfolioOverview() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(generateRandomPortfolio())

  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolio(generateRandomPortfolio())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const totalValue = portfolio.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Portfolio Overview</CardTitle>
        <CardDescription>Your current holdings and performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Value</p>
          </div>
          <Badge variant="outline" className="text-lg">
            {portfolio.reduce((sum, item) => sum + item.change, 0).toFixed(2)}%
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={portfolio}
              dataKey="value"
              nameKey="symbol"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {portfolio.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {portfolio.map((item) => (
            <div key={item.symbol} className="flex justify-between items-center">
              <span className="font-medium">{item.symbol}</span>
              <div className="flex items-center space-x-2">
                <span>${item.value.toFixed(2)}</span>
                <Badge variant={item.change >= 0 ? "success" : "destructive"}>{item.change.toFixed(2)}%</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

