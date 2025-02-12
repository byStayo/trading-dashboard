"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PriceData {
  date: string
  price: number
}

interface LevelData {
  price: number
  type: "support" | "resistance"
  strength: "weak" | "medium" | "strong"
}

const generateRandomData = (days: number): PriceData[] => {
  const data: PriceData[] = []
  let price = 100
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    price += (Math.random() - 0.5) * 5
    data.push({ date: date.toISOString().split("T")[0], price })
  }
  return data
}

const generateLevels = (data: PriceData[]): LevelData[] => {
  const prices = data.map((d) => d.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min
  return [
    { price: min + range * 0.236, type: "support", strength: "weak" },
    { price: min + range * 0.382, type: "support", strength: "medium" },
    { price: min + range * 0.618, type: "resistance", strength: "medium" },
    { price: min + range * 0.786, type: "resistance", strength: "strong" },
  ]
}

const tickers = ["AAPL", "GOOGL", "MSFT", "AMZN", "FB"]

export function SupportResistanceLevels() {
  const [selectedTicker, setSelectedTicker] = useState(tickers[0])
  const [data, setData] = useState<PriceData[]>(generateRandomData(30))
  const [levels, setLevels] = useState<LevelData[]>(generateLevels(data))

  useEffect(() => {
    setData(generateRandomData(30))
  }, [])

  useEffect(() => {
    setLevels(generateLevels(data))
  }, [data])

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Support & Resistance Levels</CardTitle>
            <p className="text-sm text-muted-foreground">Key price levels for {selectedTicker}</p>
          </div>
          <Select value={selectedTicker} onValueChange={setSelectedTicker}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a ticker" />
            </SelectTrigger>
            <SelectContent>
              {tickers.map((ticker) => (
                <SelectItem key={ticker} value={ticker}>
                  {ticker}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />
            {levels.map((level, index) => (
              <ReferenceLine
                key={index}
                y={level.price}
                stroke={level.type === "support" ? "#4ade80" : "#f87171"}
                strokeDasharray={level.strength === "strong" ? "0" : level.strength === "medium" ? "3 3" : "5 5"}
                label={{
                  value: `${level.type.charAt(0).toUpperCase() + level.type.slice(1)} (${level.strength})`,
                  position: "insideLeft",
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

