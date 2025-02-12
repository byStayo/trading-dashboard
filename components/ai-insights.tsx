"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, Loader2 } from "lucide-react"

interface Insight {
  type: "bullish" | "bearish" | "neutral"
  content: string
}

const mockInsights: Insight[] = [
  { type: "bullish", content: "Tech sector showing strong momentum" },
  { type: "bearish", content: "Energy stocks face headwinds due to policy changes" },
  { type: "neutral", content: "Market awaits Fed's decision on interest rates" },
  { type: "bullish", content: "Positive earnings surprises in healthcare sector" },
  { type: "bearish", content: "Inflation concerns weigh on consumer discretionary stocks" },
]

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setInsights(mockInsights)
      } finally {
        setIsLoading(false)
      }
    }

    loadInsights()
  }, [])

  const getBadgeVariant = (type: Insight["type"]) => {
    switch (type) {
      case "bullish":
        return "default"
      case "bearish":
        return "destructive"
      case "neutral":
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>AI-Generated Market Insights</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>AI-Generated Market Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {insights.map((insight, index) => (
            <li key={index} className="flex items-start space-x-2">
              {insight.type === "bullish" && <TrendingUp className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />}
              {insight.type === "bearish" && <TrendingDown className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />}
              {insight.type === "neutral" && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />}
              <div>
                <Badge variant={getBadgeVariant(insight.type)} className="mb-1">
                  {insight.type.toUpperCase()}
                </Badge>
                <p className="text-sm text-muted-foreground">{insight.content}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

