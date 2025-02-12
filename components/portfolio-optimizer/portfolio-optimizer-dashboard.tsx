"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { PortfolioAllocation } from "./portfolio-allocation"
import { CorrelationMatrix } from "./correlation-matrix"
import { PerformanceMetrics } from "./performance-metrics"
import { TradeSuggestions } from "./trade-suggestions"
import { optimizePortfolio, getPortfolioData } from "@/lib/api/portfolio-optimizer"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import type { PortfolioData, OptimizationSettings } from "@/types/portfolio-optimizer"

export function PortfolioOptimizerDashboard() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [riskTolerance, setRiskTolerance] = useState(5)
  const [rebalanceFrequency, setRebalanceFrequency] = useState<OptimizationSettings["rebalanceFrequency"]>("daily")
  const [isOptimizing, setIsOptimizing] = useState(false)

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const data = await getPortfolioData()
        setPortfolioData(data)
      } catch (error) {
        console.error("Error fetching portfolio data:", error)
        toast({
          title: "Error",
          description: "Failed to fetch portfolio data. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchPortfolioData()
  }, [])

  const handleOptimize = async () => {
    setIsOptimizing(true)
    try {
      const optimizedData = await optimizePortfolio(riskTolerance, rebalanceFrequency)
      setPortfolioData(optimizedData)
      toast({
        title: "Portfolio Optimized",
        description: "Your portfolio has been successfully optimized.",
      })
    } catch (error) {
      console.error("Error optimizing portfolio:", error)
      toast({
        title: "Optimization Error",
        description: "Failed to optimize portfolio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  if (!portfolioData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">AI-Driven Portfolio Allocation Optimizer</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Optimization Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Risk Tolerance</label>
            <Slider
              value={[riskTolerance]}
              onValueChange={(value) => setRiskTolerance(value[0])}
              min={1}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Conservative</span>
              <span>Aggressive</span>
            </div>
          </div>
          <div className="w-full md:w-48">
            <label className="text-sm font-medium">Rebalance Frequency</label>
            <Select value={rebalanceFrequency} onValueChange={setRebalanceFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleOptimize} disabled={isOptimizing} className="w-full md:w-auto">
            {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Optimize Portfolio
          </Button>
        </CardContent>
      </Card>

      <div className="h-[calc(100vh-20rem)] min-h-[500px]">
        <Tabs defaultValue="allocation" className="h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trades">Trade Suggestions</TabsTrigger>
          </TabsList>
          <div className="h-[calc(100%-3rem)]">
            <TabsContent value="allocation" className="h-full mt-0">
              <PortfolioAllocation data={portfolioData.allocation} />
            </TabsContent>
            <TabsContent value="correlation" className="h-full mt-0">
              <CorrelationMatrix data={portfolioData.correlation} />
            </TabsContent>
            <TabsContent value="performance" className="h-full mt-0">
              <PerformanceMetrics data={portfolioData.performance} />
            </TabsContent>
            <TabsContent value="trades" className="h-full mt-0">
              <TradeSuggestions data={portfolioData.tradeSuggestions} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

