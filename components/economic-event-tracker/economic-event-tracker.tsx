"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { EventCalendar } from "./event-calendar"
import { EventImpactAnalysis } from "./event-impact-analysis"
import { AIRecommendations } from "./ai-recommendations"
import { EconomicEventData } from "@/types/economic-events"

export function EconomicEventTracker() {
  const [economicEvents, setEconomicEvents] = useState<EconomicEventData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEconomicEvents = async () => {
      try {
        const response = await fetch("/api/economic-events")
        if (!response.ok) {
          throw new Error("Failed to fetch economic events")
        }
        const data: EconomicEventData = await response.json()
        setEconomicEvents(data)
      } catch (error) {
        console.error("Error fetching economic events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEconomicEvents()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!economicEvents) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Economic Event Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No economic events data available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="calendar">
      <TabsList>
        <TabsTrigger value="calendar">Event Calendar</TabsTrigger>
        <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
        <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
      </TabsList>
      <TabsContent value="calendar">
        <EventCalendar events={economicEvents.upcomingEvents} />
      </TabsContent>
      <TabsContent value="impact">
        <EventImpactAnalysis events={economicEvents.highImpactEvents} />
      </TabsContent>
      <TabsContent value="recommendations">
        <AIRecommendations recommendations={economicEvents.aiRecommendations} />
      </TabsContent>
    </Tabs>
  )
}

