import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, Zap } from "lucide-react"
import type React from "react" // Import React

interface AIInsight {
  type: string
  content: string
  icon: React.ElementType
}

interface EconomicEvent {
  time: string
  event: string
  impact: "high" | "medium" | "low"
}

const mockAIInsights: AIInsight[] = [
  { type: "trend", content: "Tech sector showing bullish momentum", icon: TrendingUp },
  { type: "alert", content: "Potential market volatility due to upcoming Fed announcement", icon: AlertTriangle },
  { type: "prediction", content: "AI predicts 70% chance of S&P 500 closing higher", icon: Zap },
]

const mockEconomicEvents: EconomicEvent[] = [
  { time: "10:00", event: "US Consumer Confidence", impact: "high" },
  { time: "14:00", event: "Fed Interest Rate Decision", impact: "high" },
  { time: "16:30", event: "EIA Crude Oil Stocks Change", impact: "medium" },
]

export function RightSidebar() {
  return (
    <div className="col-span-3 space-y-2">
      <Card>
        <CardContent className="p-2">
          <h4 className="text-xs font-semibold mb-2">AI Market Insights</h4>
          <ScrollArea className="h-[120px]">
            {mockAIInsights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2 mb-2">
                <insight.icon className="h-4 w-4 mt-0.5 text-primary" />
                <p className="text-xs">{insight.content}</p>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-2">
          <h4 className="text-xs font-semibold mb-2">Economic Calendar</h4>
          <ScrollArea className="h-[120px]">
            <div className="space-y-2">
              {mockEconomicEvents.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-xs">{item.time}</span>
                  <span className="text-xs flex-1 mx-2">{item.event}</span>
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

