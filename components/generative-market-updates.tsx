"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, TrendingUp, Zap, Globe } from "lucide-react"

interface MarketUpdate {
  id: string
  type: "price" | "news" | "trend" | "alert"
  content: string
  impact: "positive" | "negative" | "neutral"
  timestamp: Date
}

const generateMockUpdates = (): MarketUpdate[] => {
  const types = ["price", "news", "trend", "alert"]
  const impacts = ["positive", "negative", "neutral"]

  return Array.from({ length: 10 }, (_, i) => ({
    id: `update-${i}`,
    type: types[Math.floor(Math.random() * types.length)] as "price" | "news" | "trend" | "alert",
    content: `Generated market update ${i + 1}`,
    impact: impacts[Math.floor(Math.random() * impacts.length)] as "positive" | "negative" | "neutral",
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)),
  }))
}

export function GenerativeMarketUpdates() {
  const [updates, setUpdates] = useState<MarketUpdate[]>(generateMockUpdates())

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdates((prevUpdates) => {
        const newUpdate = generateMockUpdates()[0]
        return [newUpdate, ...prevUpdates.slice(0, -1)]
      })
    }, 5000) // Generate a new update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "price":
        return <TrendingUp className="h-4 w-4" />
      case "news":
        return <Globe className="h-4 w-4" />
      case "trend":
        return <ArrowUpRight className="h-4 w-4" />
      case "alert":
        return <Zap className="h-4 w-4" />
      default:
        return null
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive":
        return "bg-green-500/10 text-green-500"
      case "negative":
        return "bg-red-500/10 text-red-500"
      case "neutral":
        return "bg-yellow-500/10 text-yellow-500"
      default:
        return ""
    }
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Real-Time Market Updates</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0 overflow-y-auto max-h-[400px]">
          {updates.map((update) => (
            <div
              key={update.id}
              className="p-4 border-b last:border-b-0 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getImpactColor(update.impact)}`}>{getUpdateIcon(update.type)}</div>
                <div>
                  <p className="text-sm font-medium">{update.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {update.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={getImpactColor(update.impact)}>
                {update.type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

