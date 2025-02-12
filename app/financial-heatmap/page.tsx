"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getHeatmapData } from "@/lib/api/financial-heatmap"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface HeatmapData {
  symbol: string
  name: string
  sector: string
  value: number
  change: number
}

export default function FinancialHeatmapPage() {
  const [selectedMetric, setSelectedMetric] = useState<string>("price")
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1d")
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await getHeatmapData(selectedMetric, selectedTimeframe)
        setHeatmapData(data)
      } catch (error) {
        console.error("Error fetching heatmap data:", error)
        toast({
          title: "Error",
          description: "Failed to load heatmap data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedMetric, selectedTimeframe, toast])

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Market Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price Change</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="volatility">Volatility</SelectItem>
                <SelectItem value="rsi">RSI</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1 Day</SelectItem>
                <SelectItem value="1w">1 Week</SelectItem>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-[500px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {heatmapData.map((item) => (
                <Card key={item.symbol}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.symbol}</div>
                        <div className="text-sm text-muted-foreground">{item.sector}</div>
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          item.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {item.change >= 0 ? "+" : ""}
                        {item.change.toFixed(2)}%
                      </div>
                    </div>
                    <div
                      className="mt-2 h-2 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${
                          item.value >= 0 ? "rgb(34 197 94)" : "rgb(239 68 68)"
                        } ${Math.abs(item.value)}%, transparent ${Math.abs(item.value)}%)`,
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

