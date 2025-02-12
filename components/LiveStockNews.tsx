"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

interface NewsItem {
  id: string
  headline: string
  summary: string
  source: string
  publishedAt: string
}

const mockNews: NewsItem[] = [
  {
    id: "1",
    headline: "Tech Stocks Surge as AI Adoption Accelerates",
    summary:
      "Major tech companies see significant gains as artificial intelligence integration boosts investor confidence.",
    source: "TechWire",
    publishedAt: "2023-06-15T10:30:00Z",
  },
  {
    id: "2",
    headline: "Oil Prices Stabilize Amid Global Supply Concerns",
    summary: "Crude oil markets show resilience as geopolitical tensions ease and production levels normalize.",
    source: "EnergyInsider",
    publishedAt: "2023-06-15T11:15:00Z",
  },
  {
    id: "3",
    headline: "Federal Reserve Hints at Potential Rate Hike",
    summary: "Central bank officials suggest a possible increase in interest rates to combat inflation pressures.",
    source: "EconomyWatch",
    publishedAt: "2023-06-15T12:00:00Z",
  },
]

function LiveStockNews() {
  const [news, setNews] = useState<NewsItem[]>(mockNews)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchNews = () => {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        const newItem: NewsItem = {
          id: Date.now().toString(),
          headline: `Breaking: ${["AAPL", "GOOGL", "AMZN", "MSFT"][Math.floor(Math.random() * 4)]} Announces Quarterly Earnings`,
          summary: "The company's financial results exceed market expectations, driving stock price movements.",
          source: "MarketBeat",
          publishedAt: new Date().toISOString(),
        }
        setNews((prevNews) => [newItem, ...prevNews.slice(0, 4)])
        setIsLoading(false)
      }, 1500)
    }

    const interval = setInterval(fetchNews, 15000) // Fetch every 15 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Live Stock News
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {news.map((item) => (
            <Card key={item.id} className="mb-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{item.headline}</h3>
                <p className="text-sm text-muted-foreground mb-2">{item.summary}</p>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">{item.source}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.publishedAt).toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default LiveStockNews

