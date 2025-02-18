"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface VolumeData {
  time: string
  volume: number
}

interface SymbolData {
  symbol: string
  data: VolumeData[]
  totalVolume: number
  averageVolume: number
}

const generateMockData = (): SymbolData[] => {
  const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "FB"]
  return symbols.map((symbol) => {
    const data: VolumeData[] = []
    let totalVolume = 0
    for (let i = 0; i < 12; i++) {
      const volume = Math.floor(Math.random() * 1000000) + 500000
      totalVolume += volume
      data.push({
        time: `${i + 9}:00`,
        volume,
      })
    }
    return {
      symbol,
      data,
      totalVolume,
      averageVolume: Math.floor(totalVolume / 12),
    }
  })
}

const initialData = [
  {
    symbol: "AAPL",
    data: Array(12).fill(null).map((_, i) => ({
      time: `${i + 9}:00`,
      volume: 500000 // Fixed initial volume
    })),
    totalVolume: 6000000,
    averageVolume: 500000
  },
  // Add other symbols with fixed initial data
  {
    symbol: "GOOGL",
    data: Array(12).fill(null).map((_, i) => ({
      time: `${i + 9}:00`,
      volume: 500000
    })),
    totalVolume: 6000000,
    averageVolume: 500000
  }
]

export function TradingVolume() {
  const [data, setData] = useState<SymbolData[]>(initialData)
  const [isHydrated, setIsHydrated] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL")

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    const interval = setInterval(() => {
      setData(generateMockData())
    }, 5000)

    return () => clearInterval(interval)
  }, [isHydrated])

  const selectedData = data.find((item) => item.symbol === selectedSymbol) || data[0]

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trading Volume</CardTitle>
            <p className="text-sm text-muted-foreground">Intraday trading volume analysis</p>
          </div>
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select symbol" />
            </SelectTrigger>
            <SelectContent>
              {data.map((item) => (
                <SelectItem key={item.symbol} value={item.symbol}>
                  {item.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-2xl font-bold">{selectedData.totalVolume.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Volume</p>
          </div>
          <Badge variant="outline" className="text-lg">
            Avg: {selectedData.averageVolume.toLocaleString()}
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={selectedData.data}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => new Intl.NumberFormat("en").format(value)}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Legend />
            <Bar dataKey="volume" fill="#8884d8" name="Volume" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Highest Volume</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              {Math.max(...selectedData.data.map((d) => d.volume)).toLocaleString()}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Lowest Volume</span>
            <Badge variant="outline" className="bg-red-500/10 text-red-500">
              {Math.min(...selectedData.data.map((d) => d.volume)).toLocaleString()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

