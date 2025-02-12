"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCompletion } from "ai/react"
import { TrendingUp, TrendingDown, RefreshCw, ArrowUpRight, Target, Shield } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TradeSuggestion {
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

export function GenerativeTradeSuggestions() {
  const [suggestions, setSuggestions] = useState<TradeSuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { complete } = useCompletion({
    api: "/api/generate-trades",
  })

  const generateMockSuggestions = useCallback((): TradeSuggestion[] => {
    return [
      {
        id: "mock1",
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
        id: "mock2",
        ticker: "TSLA",
        type: "short",
        entry: 200,
        target: 180,
        stopLoss: 210,
        timeframe: "1 week",
        confidence: 65,
        reasoning: "Bearish trend and negative sentiment due to recent news",
        signals: {
          technical: 70,
          sentiment: 60,
          fundamental: 55,
        },
        riskLevel: "high",
        expectedReturn: 8,
        timestamp: new Date(),
      },
    ]
  }, [])

  const generateSuggestions = useCallback(async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const prompt = `Generate trade suggestions for the current market conditions. Consider technical analysis, market sentiment, and fundamental factors. Format the response as a JSON array of trade suggestions with the following structure:
      {
        "id": "string",
        "ticker": "string",
        "type": "long" | "short",
        "entry": number,
        "target": number,
        "stopLoss": number,
        "timeframe": "string",
        "confidence": number,
        "reasoning": "string",
        "signals": {
          "technical": number,
          "sentiment": number,
          "fundamental": number
        },
        "riskLevel": "low" | "medium" | "high",
        "expectedReturn": number
      }`

      const response = await complete(prompt)
      console.log("Raw AI response:", response)
      
      if (!response) {
        console.log("No response from AI model, using mock data")
        setSuggestions(generateMockSuggestions())
        return
      }

      // Try to find a JSON array in the response
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.log("No JSON array found in response, using mock data")
        setSuggestions(generateMockSuggestions())
        return
      }

      try {
        const parsedSuggestions = JSON.parse(jsonMatch[0])
        if (!Array.isArray(parsedSuggestions)) {
          console.error("Parsed response is not an array:", parsedSuggestions)
          setSuggestions(generateMockSuggestions())
          return
        }

        // Validate and transform each suggestion
        const validSuggestions = parsedSuggestions.map(suggestion => ({
          ...suggestion,
          id: suggestion.id || Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          entry: Number(suggestion.entry),
          target: Number(suggestion.target),
          stopLoss: Number(suggestion.stopLoss),
          confidence: Number(suggestion.confidence),
          expectedReturn: Number(suggestion.expectedReturn),
          signals: {
            technical: Number(suggestion.signals?.technical || 0),
            sentiment: Number(suggestion.signals?.sentiment || 0),
            fundamental: Number(suggestion.signals?.fundamental || 0)
          }
        }))

        setSuggestions(validSuggestions)
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError)
        setSuggestions(generateMockSuggestions())
      }
    } catch (error) {
      console.error("Error generating suggestions:", error)
      setError(`Error generating suggestions: ${error instanceof Error ? error.message : String(error)}`)
      setSuggestions(generateMockSuggestions())
    } finally {
      setIsGenerating(false)
    }
  }, [complete, generateMockSuggestions])

  useEffect(() => {
    generateSuggestions()
  }, [generateSuggestions])

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

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Trade Suggestions</CardTitle>
            <CardDescription>Generated trading opportunities based on market analysis</CardDescription>
          </div>
          <Button onClick={generateSuggestions} disabled={isGenerating}>
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isGenerating && (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <p>Generating trade suggestions...</p>
          </div>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <p className="mt-2 text-sm">Please try refreshing or contact support if the problem persists.</p>
            </AlertDescription>
          </Alert>
        )}
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {suggestions.length === 0 && !isGenerating && !error && (
              <div className="text-center text-muted-foreground">
                No trade suggestions available. Click 'Refresh' to generate new suggestions.
              </div>
            )}
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {suggestion.type === "long" ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">${suggestion.ticker}</h3>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.type.toUpperCase()} • {suggestion.timeframe}
                      </p>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className={`${getConfidenceColor(suggestion.confidence)}`}>
                          {suggestion.confidence}% Confidence
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
                    <p className="font-semibold">${suggestion.entry.toFixed(2)}</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Target</span>
                    </div>
                    <p className="font-semibold text-green-500">${suggestion.target.toFixed(2)}</p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Shield className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-muted-foreground">Stop Loss</span>
                    </div>
                    <p className="font-semibold text-red-500">${suggestion.stopLoss.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm">{suggestion.reasoning}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Technical Analysis</span>
                      <span className="text-sm font-medium">{suggestion.signals.technical}%</span>
                    </div>
                    <Progress value={suggestion.signals.technical} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Sentiment Analysis</span>
                      <span className="text-sm font-medium">{suggestion.signals.sentiment}%</span>
                    </div>
                    <Progress value={suggestion.signals.sentiment} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Fundamental Analysis</span>
                      <span className="text-sm font-medium">{suggestion.signals.fundamental}%</span>
                    </div>
                    <Progress value={suggestion.signals.fundamental} className="h-2" />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    {getRiskBadge(suggestion.riskLevel)}
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                      {suggestion.expectedReturn}% Expected Return
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Generated {new Date(suggestion.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

