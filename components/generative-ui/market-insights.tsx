"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCompletion } from "ai/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrendingUp, TrendingDown, RefreshCw, Search, LineChart } from "lucide-react"
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip } from "recharts"

interface InsightCard {
  title: string
  description: string
  type: "bullish" | "bearish" | "neutral"
  probability: number
  timeframe: string
  tickers: string[]
  chart?: any[]
}

export function GenerativeMarketInsights() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("generated")
  const [insights, setInsights] = useState<InsightCard[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const { complete } = useCompletion({
    api: "/api/generate-insights",
  })

  const generateInsights = async () => {
    setIsGenerating(true)
    try {
      const response = await complete(searchQuery || "Generate market insights for major indices")
      const newInsights = JSON.parse(response)
      setInsights(newInsights)
    } catch (error) {
      console.error("Error generating insights:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "bullish":
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case "bearish":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      default:
        return <LineChart className="h-5 w-5 text-yellow-500" />
    }
  }

  const renderChart = (data: any[]) => {
    if (!data) return null

    return (
      <div className="h-[150px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data}>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke={
                insights[0]?.type === "bullish" ? "#10B981" : insights[0]?.type === "bearish" ? "#EF4444" : "#F59E0B"
              }
              dot={false}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Market Insights</CardTitle>
            <CardDescription>Generated analysis and predictions</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search or describe market conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px]"
            />
            <Button onClick={generateInsights} disabled={isGenerating}>
              {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="generated">Generated Insights</TabsTrigger>
            <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
            <TabsTrigger value="sentiment">Market Sentiment</TabsTrigger>
          </TabsList>
          <TabsContent value="generated">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div>
                          <h3 className="font-semibold mb-1">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {insight.tickers.map((ticker) => (
                              <Badge key={ticker} variant="outline">
                                ${ticker}
                              </Badge>
                            ))}
                            <Badge
                              variant="outline"
                              className={
                                insight.type === "bullish"
                                  ? "bg-green-500/10 text-green-500"
                                  : insight.type === "bearish"
                                    ? "bg-red-500/10 text-red-500"
                                    : "bg-yellow-500/10 text-yellow-500"
                              }
                            >
                              {insight.probability}% Probability
                            </Badge>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                              {insight.timeframe}
                            </Badge>
                          </div>
                          {renderChart(insight.chart)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          {/* Add content for other tabs */}
        </Tabs>
      </CardContent>
    </Card>
  )
}

