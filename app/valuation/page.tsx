"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { StockSelector } from "@/components/valuation/stock-selector"
import { IntrinsicValueDashboard } from "@/components/intrinsic-value-dashboard"
import { DCFAnalysis } from "@/components/valuation/dcf-analysis"
import { RelativeValuation } from "@/components/valuation/relative-valuation"
import { SensitivityAnalysis } from "@/components/valuation/sensitivity-analysis"
import { MonteCarloSimulation } from "@/components/valuation/monte-carlo"
import { CompanyHealthMetrics } from "@/components/valuation/company-health-metrics"
import { AnalystEstimates } from "@/components/valuation/analyst-estimates"
import { fetchStockData } from "@/lib/api/stock-data"
import { ErrorMessage } from "@/components/error-message"
import { Loader2 } from "lucide-react"

export default function ValuationPage() {
  const [activeTab, setActiveTab] = useState("select")
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [stockData, setStockData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectStock = async (symbol: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchStockData(symbol)
      setStockData(data)
      setSelectedStock(symbol)
      setActiveTab("overview")
    } catch (err) {
      setError("Failed to fetch stock data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Stock Valuation Analysis</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Select a stock to analyze its intrinsic value and financial metrics
          </p>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="border-b">
                <TabsList className="w-full h-auto inline-flex p-0 bg-transparent">
                  <TabsTrigger
                    value="select"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-12"
                  >
                    Select Stock
                  </TabsTrigger>
                  <TabsTrigger
                    value="overview"
                    disabled={!selectedStock}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-12"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="dcf"
                    disabled={!selectedStock}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-12"
                  >
                    DCF Analysis
                  </TabsTrigger>
                  <TabsTrigger
                    value="relative"
                    disabled={!selectedStock}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-12"
                  >
                    Relative
                  </TabsTrigger>
                  <TabsTrigger
                    value="sensitivity"
                    disabled={!selectedStock}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-12"
                  >
                    Sensitivity
                  </TabsTrigger>
                  <TabsTrigger
                    value="simulation"
                    disabled={!selectedStock}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-12"
                  >
                    Monte Carlo
                  </TabsTrigger>
                  <TabsTrigger
                    value="analyst"
                    disabled={!selectedStock}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex-1 h-12"
                  >
                    Analyst Views
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="mt-6">
                <TabsContent value="select" className="m-0">
                  <StockSelector onSelectStock={handleSelectStock} />
                </TabsContent>

                {error ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <ErrorMessage message={error} onRetry={() => handleSelectStock(selectedStock!)} />
                  </div>
                ) : (
                  stockData && (
                    <>
                      <TabsContent value="overview" className="m-0 space-y-6">
                        <CompanyHealthMetrics {...stockData.healthMetrics} />
                        <IntrinsicValueDashboard />
                      </TabsContent>

                      <TabsContent value="dcf" className="m-0">
                        <DCFAnalysis />
                      </TabsContent>

                      <TabsContent value="relative" className="m-0">
                        <RelativeValuation />
                      </TabsContent>

                      <TabsContent value="sensitivity" className="m-0">
                        <SensitivityAnalysis />
                      </TabsContent>

                      <TabsContent value="simulation" className="m-0">
                        <MonteCarloSimulation />
                      </TabsContent>

                      <TabsContent value="analyst" className="m-0">
                        <AnalystEstimates
                          companyName={stockData.basicInfo.name}
                          priceTargets={stockData.analystData.priceTargets}
                          revenueEstimates={stockData.analystData.revenueEstimates}
                        />
                      </TabsContent>
                    </>
                  )
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

