"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Badge } from "@/components/ui/badge"

interface FlowData {
  ticker: string
  netFlow: number
  inflow: number
  outflow: number
}

const generateRandomData = (): FlowData[] => {
  const tickers = ["AAPL", "GOOGL", "MSFT", "AMZN", "FB", "TSLA", "NVDA", "JPM", "V", "JNJ"]
  return tickers.map((ticker) => {
    const inflow = Math.random() * 1000000
    const outflow = Math.random() * 1000000
    return {
      ticker,
      netFlow: inflow - outflow,
      inflow,
      outflow,
    }
  })
}

export function SmartMoneyFlow() {
  const [data, setData] = useState<FlowData[]>(generateRandomData())

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateRandomData())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Smart Money Flow</CardTitle>
        <p className="text-sm text-muted-foreground">Institutional investor activity</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <XAxis dataKey="ticker" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="inflow" fill="#4ade80" name="Inflow" />
            <Bar dataKey="outflow" fill="#f87171" name="Outflow" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {data.map((item) => (
            <div key={item.ticker} className="flex items-center justify-between">
              <span className="font-medium">{item.ticker}</span>
              <Badge variant={item.netFlow > 0 ? "success" : "destructive"}>
                ${Math.abs(item.netFlow).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

