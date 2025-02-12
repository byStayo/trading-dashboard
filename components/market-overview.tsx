"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { ScrollArea } from "@/components/ui/scroll-area"

const Chart = dynamic(() => import("./market-overview-chart"), { ssr: false })

interface IndexData {
  name: string
  value: number
  change: number
}

// Static chart data with fixed points
const chartData = [
  { time: "9:30", SP500: 4150, NASDAQ: 12800, DOW: 33800 },
  { time: "10:00", SP500: 4165, NASDAQ: 12850, DOW: 33850 },
  { time: "10:30", SP500: 4180, NASDAQ: 12900, DOW: 33900 },
  { time: "11:00", SP500: 4175, NASDAQ: 12880, DOW: 33880 },
  { time: "11:30", SP500: 4185, NASDAQ: 12920, DOW: 33920 },
  { time: "12:00", SP500: 4190, NASDAQ: 12950, DOW: 33950 },
  { time: "12:30", SP500: 4188, NASDAQ: 12940, DOW: 33940 },
  { time: "13:00", SP500: 4192, NASDAQ: 12960, DOW: 33960 },
  { time: "13:30", SP500: 4185, NASDAQ: 12930, DOW: 33930 },
  { time: "14:00", SP500: 4186, NASDAQ: 12935, DOW: 33935 },
]

const mockIndices: IndexData[] = [
  { name: "S&P 500", value: 4185.81, change: 0.45 },
  { name: "NASDAQ", value: 12888.28, change: 0.73 },
  { name: "DOW", value: 33875.4, change: -0.23 },
  { name: "VIX", value: 15.65, change: -5.21 },
]

const mockNews = [
  {
    id: 1,
    title: "Fed Signals Potential Rate Changes",
    time: "14:30",
    impact: "high",
  },
  {
    id: 2,
    title: "Tech Sector Leads Market Rally",
    time: "13:45",
    impact: "medium",
  },
  {
    id: 3,
    title: "Oil Prices Stabilize After Recent Drop",
    time: "13:15",
    impact: "medium",
  },
]

export function MarketOverview() {
  return (
    <div className="grid grid-cols-12 gap-2 h-full">
      <Card className="col-span-12">
        <CardContent className="py-2">
          <div className="grid grid-cols-4 gap-2">
            {mockIndices.map((index) => (
              <div key={index.name} className="text-center">
                <div className="text-xs font-medium">{index.name}</div>
                <div className="text-sm font-bold">{index.value.toFixed(2)}</div>
                <Badge variant={index.change >= 0 ? "default" : "destructive"} className="text-xs">
                  {index.change > 0 ? "+" : ""}
                  {index.change.toFixed(2)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-6">
        <CardContent className="p-2">
          <div className="h-[100px]">
            <Chart data={chartData} />
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-6">
        <CardContent className="p-2">
          <ScrollArea className="h-[100px]">
            <div className="space-y-1">
              {mockNews.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-xs truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.time}</p>
                  </div>
                  <Badge variant={item.impact === "high" ? "destructive" : "secondary"} className="text-[10px]">
                    {item.impact}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

