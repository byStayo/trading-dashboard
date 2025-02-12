"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getTechnicalAnalysisData, subscribeToTradeSignals } from "@/lib/api/technical-analysis"
import { ChartPatterns } from "@/components/technical-analysis/chart-patterns"
import { TrendlineOverlay } from "@/components/technical-analysis/trendline-overlay"
import { FibonacciRetracement } from "@/components/technical-analysis/fibonacci-retracement"
import { TradeSignalGenerator } from "@/components/technical-analysis/trade-signal-generator"
import { MarketSentimentOverlay } from "@/components/technical-analysis/market-sentiment-overlay"
import { BrokerageIntegration } from "@/components/technical-analysis/brokerage-integration"

export function TechnicalAnalysis() {
  const [symbol, setSymbol] = useState("AAPL")
  const [timeframe, setTimeframe] = useState("1D")
  const [technicalData, setTechnicalData] = useState(null)
  const [selectedPatterns, setSelectedPatterns] = useState([])
  const [showTrendlines, setShowTrendlines] = useState(false)
  const [showFibonacci, setShowFibonacci] = useState(false)
  const [showSentiment, setShowSentiment] = useState(false)
  const [tradeSignals, setTradeSignals] = useState([])

  const fetchData = useCallback(async () => {
    const data = await getTechnicalAnalysisData(symbol, timeframe)
    setTechnicalData(data)
  }, [symbol, timeframe])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const unsubscribe = subscribeToTradeSignals((signal) => {
      setTradeSignals((prevSignals) => [signal, ...prevSignals])
    })

    return () => unsubscribe()
  }, [])

  if (!technicalData) {
    return <div>Loading...</div>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>AI-Enhanced Technical Analysis</CardTitle>
            <CardDescription>Advanced chart analysis and trade signals</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-24"
            />
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1 Day</SelectItem>
                <SelectItem value="1W">1 Week</SelectItem>
                <SelectItem value="1M">1 Month</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchData}>Update</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          </TabsList>
          <TabsContent value="chart">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={technicalData.priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="price" stroke="#8884d8" />
                  {showTrendlines && <TrendlineOverlay data={technicalData.trendlines} />}
                  {showFibonacci && <FibonacciRetracement data={technicalData.fibonacciLevels} />}
                  {showSentiment && <MarketSentimentOverlay data={technicalData.sentimentData} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-4">
              <div className="space-x-2">
                <Checkbox id="show-trendlines" checked={showTrendlines} onCheckedChange={setShowTrendlines} />
                <label htmlFor="show-trendlines">Show Trendlines</label>
              </div>
              <div className="space-x-2">
                <Checkbox id="show-fibonacci" checked={showFibonacci} onCheckedChange={setShowFibonacci} />
                <label htmlFor="show-fibonacci">Show Fibonacci</label>
              </div>
              <div className="space-x-2">
                <Checkbox id="show-sentiment" checked={showSentiment} onCheckedChange={setShowSentiment} />
                <label htmlFor="show-sentiment">Show Sentiment</label>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="patterns">
            <ChartPatterns
              patterns={technicalData.detectedPatterns}
              selectedPatterns={selectedPatterns}
              setSelectedPatterns={setSelectedPatterns}
            />
          </TabsContent>
          <TabsContent value="signals">
            <TradeSignalGenerator signals={tradeSignals} />
          </TabsContent>
          <TabsContent value="sentiment">
            <MarketSentimentOverlay data={technicalData.sentimentData} />
          </TabsContent>
        </Tabs>
        <BrokerageIntegration />
      </CardContent>
    </Card>
  )
}

