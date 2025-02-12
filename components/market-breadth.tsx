"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MarketBreadthData {
  advancing: number
  declining: number
  unchanged: number
}

interface IndexData {
  name: string
  data: MarketBreadthData
}

const generateMockData = (): IndexData[] => {
  return [
    {
      name: "S&P 500",
      data: {
        advancing: Math.floor(Math.random() * 300) + 200,
        declining: Math.floor(Math.random() * 200) + 100,
        unchanged: Math.floor(Math.random() * 50),
      },
    },
    {
      name: "NASDAQ",
      data: {
        advancing: Math.floor(Math.random() * 1500) + 1000,
        declining: Math.floor(Math.random() * 1000) + 500,
        unchanged: Math.floor(Math.random() * 200),
      },
    },
    {
      name: "NYSE",
      data: {
        advancing: Math.floor(Math.random() * 1000) + 700,
        declining: Math.floor(Math.random() * 700) + 300,
        unchanged: Math.floor(Math.random() * 100),
      },
    },
  ]
}

const COLORS = ["#4ade80", "#f87171", "#fbbf24"]

export function MarketBreadth() {
  const [data, setData] = useState<IndexData[]>(generateMockData())
  const [selectedIndex, setSelectedIndex] = useState<string>("S&P 500")

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const selectedData = data.find((item) => item.name === selectedIndex)?.data || data[0].data

  const pieData = [
    { name: "Advancing", value: selectedData.advancing },
    { name: "Declining", value: selectedData.declining },
    { name: "Unchanged", value: selectedData.unchanged },
  ]

  const totalIssues = selectedData.advancing + selectedData.declining + selectedData.unchanged
  const advanceDeclineRatio = (selectedData.advancing / selectedData.declining).toFixed(2)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Market Breadth</CardTitle>
            <CardDescription>Overview of market-wide trends</CardDescription>
          </div>
          <Select value={selectedIndex} onValueChange={setSelectedIndex}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select index" />
            </SelectTrigger>
            <SelectContent>
              {data.map((item) => (
                <SelectItem key={item.name} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-2xl font-bold">{totalIssues}</p>
            <p className="text-sm text-muted-foreground">Total Issues</p>
          </div>
          <Badge variant="outline" className="text-lg">
            A/D Ratio: {advanceDeclineRatio}
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Advancing</span>
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              {selectedData.advancing}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Declining</span>
            <Badge variant="outline" className="bg-red-500/10 text-red-500">
              {selectedData.declining}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Unchanged</span>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
              {selectedData.unchanged}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

