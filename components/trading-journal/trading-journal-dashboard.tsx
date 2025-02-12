"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TradeLog } from "./trade-log"
import { BehaviorAnalysis } from "./behavior-analysis"
import { PerformanceReview } from "./performance-review"
import { RealtimeFeedback } from "./realtime-feedback"
import { getTradeData } from "@/lib/api/trading-journal"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface TradeData {
  trades: any[]
  behaviorAnalysis: any
  performanceReview: any
  realtimeFeedback: any
}

export function TradingJournalDashboard() {
  const [tradeData, setTradeData] = useState<TradeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTradeData = async () => {
      try {
        const data = await getTradeData()
        setTradeData(data as TradeData)
      } catch (error) {
        console.error("Error fetching trade data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch trade data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTradeData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!tradeData) {
    return <div>No trade data available.</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">AI-Enhanced Trading Journal</h1>

      <Tabs defaultValue="trade-log">
        <TabsList>
          <TabsTrigger value="trade-log">Trade Log</TabsTrigger>
          <TabsTrigger value="behavior-analysis">Behavior Analysis</TabsTrigger>
          <TabsTrigger value="performance-review">Performance Review</TabsTrigger>
          <TabsTrigger value="realtime-feedback">Real-time Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="trade-log">
          <TradeLog trades={tradeData.trades} />
        </TabsContent>
        <TabsContent value="behavior-analysis">
          <BehaviorAnalysis behaviorData={tradeData.behaviorAnalysis} />
        </TabsContent>
        <TabsContent value="performance-review">
          <PerformanceReview performanceData={tradeData.performanceReview} />
        </TabsContent>
        <TabsContent value="realtime-feedback">
          <RealtimeFeedback feedbackData={tradeData.realtimeFeedback} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

