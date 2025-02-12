"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, TrendingUp, TrendingDown, BarChart2, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCompletion } from "ai/react"

interface NewsItem {
  id: string
  title: string
  summary: string
  sentiment: "positive" | "negative" | "neutral"
  importance: "high" | "medium" | "low"
  tickers: string[]
  aiSummary?: string
  timestamp: Date
  source: string
}

const fixedNews: NewsItem[] = [
  {
    id: "1",
    title: "Fed Signals Potential Rate Cuts in 2024",
    summary: "Federal Reserve officials indicated they expect to cut interest rates next year...",
    sentiment: "positive",
    importance: "high",
    tickers: ["SPY", "QQQ", "IWM"],
    timestamp: new Date(),
    source: "Wall Street Journal",
  },
  {
    id: "2",
    title: "Tech Giants Face New Antitrust Scrutiny",
    summary: "Major technology companies are under investigation for potential monopolistic practices...",
    sentiment: "negative",
    importance: "medium",
    tickers: ["AAPL", "GOOGL", "MSFT", "AMZN"],
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    source: "Reuters",
  },
  {
    id: "3",
    title: "Oil Prices Surge Amid Middle East Tensions",
    summary: "Crude oil prices have spiked due to escalating geopolitical tensions...",
    sentiment: "neutral",
    importance: "high",
    tickers: ["USO", "XLE", "CVX", "XOM"],
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    source: "Bloomberg",
  },
]

export function GenerativeNewsPanel() {
  const [news, setNews] = useState<NewsItem[]>(fixedNews)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all")
  const [sortBy, setSortBy] = useState<"latest" | "importance">("latest")

  const { complete } = useCompletion({
    api: "/api/generate-insights",
  })

  const fetchNews = useCallback(async () => {
    // Simulating API call to fetch new articles
    const newArticle: NewsItem = {
      id: Date.now().toString(),
      title: `Breaking: Major market movement in ${["tech", "finance", "healthcare", "energy"][Math.floor(Math.random() * 4)]} sector`,
      summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      sentiment: ["positive", "negative", "neutral"][Math.floor(Math.random() * 3)] as
        | "positive"
        | "negative"
        | "neutral",
      importance: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as "high" | "medium" | "low",
      tickers: ["AAPL", "GOOGL", "MSFT", "AMZN"].slice(0, Math.floor(Math.random() * 3) + 1),
      timestamp: new Date(),
      source: ["Bloomberg", "Reuters", "CNBC", "Wall Street Journal"][Math.floor(Math.random() * 4)],
    }

    setNews((prevNews) => [newArticle, ...prevNews.slice(0, 9)])

    // Generate AI summary for the new article
    const aiSummary = await complete(JSON.stringify(newArticle))
    setNews((prevNews) => prevNews.map((item) => (item.id === newArticle.id ? { ...item, aiSummary } : item)))
  }, [complete])

  useEffect(() => {
    const interval = setInterval(fetchNews, 30000) // Fetch news every 30 seconds
    return () => clearInterval(interval)
  }, [fetchNews])

  const filteredNews = news
    .filter((item) => (filter === "all" ? true : item.importance === filter))
    .sort((a, b) => {
      if (sortBy === "latest") {
        return b.timestamp.getTime() - a.timestamp.getTime()
      } else {
        const importanceOrder = { high: 3, medium: 2, low: 1 }
        return importanceOrder[b.importance] - importanceOrder[a.importance]
      }
    })

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <BarChart2 className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Live Market Updates</CardTitle>
            <CardDescription>AI-enhanced news analysis and market impact</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={filter} onValueChange={(value: "all" | "high" | "medium" | "low") => setFilter(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: "latest" | "importance") => setSortBy(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="importance">Importance</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={fetchNews}>
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh news</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {filteredNews.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getSentimentIcon(item.sentiment)}
                      <h3 className="font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.summary}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {item.tickers.map((ticker) => (
                        <Badge key={ticker} variant="outline">
                          ${ticker}
                        </Badge>
                      ))}
                      <Badge
                        variant={
                          item.importance === "high"
                            ? "destructive"
                            : item.importance === "medium"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {item.importance === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {item.importance.toUpperCase()}
                      </Badge>
                    </div>
                    {expandedItem === item.id && item.aiSummary && (
                      <div className="mt-2 p-2 bg-muted rounded-md">
                        <p className="text-sm">{item.aiSummary}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {item.source} • {item.timestamp.toLocaleTimeString()}
                      </span>
                      {item.aiSummary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        >
                          {expandedItem === item.id ? (
                            <>
                              Less <ChevronUp className="ml-1 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              AI Analysis <ChevronDown className="ml-1 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

