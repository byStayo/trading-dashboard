"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowUpRight, ArrowDownRight, RefreshCw, Target, Shield } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useCompletion } from "ai/react"
import { Progress } from "@/components/ui/progress"

interface TradingIdea {
  id: string
  ticker: string
  type: "long" | "short"
  entry: number
  target: number
  stopLoss: number
  timeframe: string
  confidence: number
  reasoning: string
  signals: {
    technical: number
    sentiment: number
    fundamental: number
  }
  riskLevel: "low" | "medium" | "high"
  expectedReturn: number
  timestamp: Date
}

const fixedIdeas: TradingIdea[] = [
  {
    id: "1",
    ticker: "AAPL",
    type: "long",
    entry: 150,
    target: 165,
    stopLoss: 145,
    timeframe: "2 weeks",
    confidence: 75,
    reasoning: "Strong technical setup with bullish divergence on RSI",
    signals: {
      technical: 80,
      sentiment: 65,
      fundamental: 70,
    },
    riskLevel: "medium",
    expectedReturn: 10,
    timestamp: new Date(),
  },
  {
    id: "2",
    ticker: "TSLA",
    type: "short",
    entry: 800,
    target: 750,
    stopLoss: 820,
    timeframe: "1 week",
    confidence: 65,
    reasoning: "Bearish trend continuation after breaking key support",
    signals: {
      technical: 75,
      sentiment: 60,
      fundamental: 55,
    },
    riskLevel: "high",
    expectedReturn: 6.25,
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
  },
]

export function GenerativeTradingIdeas() {
  const [ideas, setIdeas] = useState<TradingIdea[]>(fixedIdeas)
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [filter, setFilter] = useState<"all" | "long" | "short">("all")
  const [confidenceThreshold, setConfidenceThreshold] = useState(60)
  const [error, setError] = useState<string | null>(null)

  const { complete } = useCompletion({
    api: "/api/generate-trades",
  })

  const generateIdea = useCallback(async (): Promise<TradingIdea | null> => {
    try {
      const response = await complete("Generate a new trading idea")
      if (response) {
        const newIdea: TradingIdea = JSON.parse(response)
        return newIdea
      }
      return null
    } catch (error: any) {
      console.error("Error generating idea:", error)
      setError("Failed to generate a trading idea. Please try again.")
      return null
    }
  }, [complete])

  const generateNewIdeas = useCallback(async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const newIdea = await generateIdea()
      if (newIdea) {
        setIdeas((prevIdeas) => [newIdea, ...prevIdeas.slice(0, 4)])
      } else {
        setError("Failed to generate a new trading idea. Please try again.")
      }
    } catch (error) {
      console.error("Error generating trading ideas:", error)
      setError("Failed to generate trading ideas. Please try again later.")
    } finally {
      setIsGenerating(false)
    }
  }, [generateIdea])

  useEffect(() => {
    const interval = setInterval(generateNewIdeas, 60000) // Generate a new idea every minute
    return () => clearInterval(interval)
  }, [generateNewIdeas])

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-500"
    if (confidence >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500">
            Low Risk
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
            Medium Risk
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500">
            High Risk
          </Badge>
        )
      default:
        return null
    }
  }

  const filteredIdeas = ideas.filter(
    (idea) => (filter === "all" || idea.type === filter) && idea.confidence >= confidenceThreshold,
  )

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Trade Suggestions</CardTitle>
            <p className="text-sm text-muted-foreground">Generated trading opportunities based on market analysis</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={filter} onValueChange={(value: "all" | "long" | "short") => setFilter(value)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateNewIdeas} disabled={isGenerating}>
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="text-sm font-medium">Confidence Threshold: {confidenceThreshold}%</label>
          <Slider
            value={[confidenceThreshold]}
            onValueChange={(value) => setConfidenceThreshold(value[0])}
            min={0}
            max={100}
            step={1}
          />
        </div>
        {error && <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {filteredIdeas.map((idea) => (
              <Card key={idea.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {idea.type === "long" ? (
                      <ArrowUpRight className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">${idea.ticker}</h3>
                      <p className="text-sm text-muted-foreground">
                        {idea.type.toUpperCase()} • {idea.timeframe}
                      </p>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className={`${getConfidenceColor(idea.confidence)}`}>
                          {idea.confidence}% Confidence
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>AI-generated confidence score based on multiple factors</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Target className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">Entry</span>
                    </div>
                    <p className="font-semibold">${idea.entry}</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Target</span>
                    </div>
                    <p className="font-semibold text-green-500">${idea.target}</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Shield className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-muted-foreground">Stop Loss</span>
                    </div>
                    <p className="font-semibold text-red-500">${idea.stopLoss}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm">{idea.reasoning}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Technical Analysis</span>
                      <span className="text-sm font-medium">{idea.signals.technical}%</span>
                    </div>
                    <Progress value={idea.signals.technical} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Sentiment Analysis</span>
                      <span className="text-sm font-medium">{idea.signals.sentiment}%</span>
                    </div>
                    <Progress value={idea.signals.sentiment} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Fundamental Analysis</span>
                      <span className="text-sm font-medium">{idea.signals.fundamental}%</span>
                    </div>
                    <Progress value={idea.signals.fundamental} className="h-2" />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    {getRiskBadge(idea.riskLevel)}
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                      {idea.expectedReturn}% Expected Return
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">Generated {idea.timestamp.toLocaleTimeString()}</span>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

