"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PortfolioOverview } from "./portfolio-overview"
import { PerformanceAnalysis } from "./performance-analysis"
import { BenchmarkComparison } from "./benchmark-comparison"
import { AIRecommendations } from "./ai-recommendations"
import { TaxOptimization } from "./tax-optimization"
import { RiskAnalysis } from "./risk-analysis"
import { ESGScorecard } from "./esg-scorecard"
import { getPortfolioAnalytics } from "@/lib/api/portfolio-analytics"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface PortfolioData {
  overview: {
    totalValue: number
    returns: number
    riskScore: number
    diversificationScore: number
  }
  performance: {
    returns: Array<{ date: string; value: number }>
    volatility: number
    sharpeRatio: number
    maxDrawdown: number
  }
  benchmarking: {
    comparisons: Array<{
      benchmark: string
      performance: number
      correlation: number
    }>
  }
  recommendations: Array<{
    type: string
    description: string
    impact: string
    confidence: number
  }>
  taxOptimization: {
    harvestingOpportunities: Array<{
      security: string
      potentialSavings: number
      daysUntilQualified: number
    }>
    taxEfficiency: number
  }
  riskAnalysis: {
    factorExposures: Record<string, number>
    stressTests: Array<{
      scenario: string
      impact: number
    }>
  }
  esgScorecard: {
    overall: number
    environmental: number
    social: number
    governance: number
    controversies: string[]
  }
}

export function PortfolioAnalyticsDashboard() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPortfolioAnalytics = async () => {
      try {
        const data = await getPortfolioAnalytics()
        setPortfolioData(data as PortfolioData)
      } catch (error) {
        console.error("Error fetching portfolio analytics:", error)
        toast({
          title: "Error",
          description: "Failed to fetch portfolio analytics. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPortfolioAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!portfolioData) {
    return <div>No portfolio data available.</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Portfolio Analytics</h1>

      <PortfolioOverview data={portfolioData.overview} />

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="tax-optimization">Tax Optimization</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="esg-scorecard">ESG Scorecard</TabsTrigger>
        </TabsList>
        <TabsContent value="performance">
          <PerformanceAnalysis data={portfolioData.performance} />
        </TabsContent>
        <TabsContent value="benchmarking">
          <BenchmarkComparison data={portfolioData.benchmarking} />
        </TabsContent>
        <TabsContent value="recommendations">
          <AIRecommendations data={portfolioData.recommendations} />
        </TabsContent>
        <TabsContent value="tax-optimization">
          <TaxOptimization data={portfolioData.taxOptimization} />
        </TabsContent>
        <TabsContent value="risk-analysis">
          <RiskAnalysis data={portfolioData.riskAnalysis} />
        </TabsContent>
        <TabsContent value="esg-scorecard">
          <ESGScorecard data={portfolioData.esgScorecard} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

