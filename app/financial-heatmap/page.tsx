"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heatmap } from "@/components/financial-heatmap/heatmap"
import { HeatmapLegend } from "@/components/financial-heatmap/heatmap-legend"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getHeatmapData, subscribeToRealtimeUpdates } from "@/lib/api/financial-heatmap"
import { useToast } from "@/components/ui/use-toast"

export default function FinancialHeatmapPage() {
  const [heatmapData, setHeatmapData] = useState([])
  const [selectedMetric, setSelectedMetric] = useState("performance")
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D")
  const [showAIInsights, setShowAIInsights] = useState(true)
  const [alerts, setAlerts] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHeatmapData(selectedMetric, selectedTimeframe)
        setHeatmapData(data)
      } catch (error) {
        console.error("Error fetching heatmap data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch heatmap data. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchData()

    const unsubscribe = subscribeToRealtimeUpdates((update) => {
      setHeatmapData((prevData) => {
        return prevData.map((sector) => {
          if (sector.id === update.sectorId) {
            return {
              ...sector,
              value: update.value,
              aiInsights: update.aiInsights,
            }
          }
          return sector
        })
      })

      if (update.alert) {
        setAlerts((prevAlerts) => [...prevAlerts, update.alert])
        toast({
          title: "Smart Alert",
          description: update.alert,
          variant: "default",
        })
      }
    })

    return () => unsubscribe()
  }, [selectedMetric, selectedTimeframe, toast])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">AI-Powered Financial Heatmap</h1>

      <Card>
        <CardHeader>
          <CardTitle>Market Heatmap</CardTitle>
          <CardDescription>Visualize market performance and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="space-x-2">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="volatility">Volatility</SelectItem>
                  <SelectItem value="marketCap">Market Cap</SelectItem>
                  <SelectItem value="peRatio">P/E Ratio</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">1 Day</SelectItem>
                  <SelectItem value="1W">1 Week</SelectItem>
                  <SelectItem value="1M">1 Month</SelectItem>
                  <SelectItem value="3M">3 Months</SelectItem>
                  <SelectItem value="1Y">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="ai-insights" checked={showAIInsights} onCheckedChange={setShowAIInsights} />
              <Label htmlFor="ai-insights">Show AI Insights</Label>
            </div>
          </div>

          <Heatmap data={heatmapData} showAIInsights={showAIInsights} />
          <HeatmapLegend metric={selectedMetric} />

          <Tabs defaultValue="sectorRotation" className="mt-6">
            <TabsList>
              <TabsTrigger value="sectorRotation">Sector Rotation</TabsTrigger>
              <TabsTrigger value="capitalFlow">Capital Flow</TabsTrigger>
              <TabsTrigger value="institutionalActivity">Institutional Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="sectorRotation">
              {/* Implement sector rotation analysis */}
              <p>Sector rotation analysis coming soon...</p>
            </TabsContent>
            <TabsContent value="capitalFlow">
              {/* Implement capital flow visualization */}
              <p>Capital flow visualization coming soon...</p>
            </TabsContent>
            <TabsContent value="institutionalActivity">
              {/* Implement institutional activity tracking */}
              <p>Institutional activity tracking coming soon...</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Smart Alerts</CardTitle>
          <CardDescription>AI-detected anomalies and significant market events</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length > 0 ? (
            <ul className="space-y-2">
              {alerts.map((alert, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{alert}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">Details</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Alert Details</AlertDialogTitle>
                        <AlertDialogDescription>
                          {/* Implement detailed alert information */}
                          Detailed information about this alert will be displayed here.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              ))}
            </ul>
          ) : (
            <p>No active alerts at the moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

