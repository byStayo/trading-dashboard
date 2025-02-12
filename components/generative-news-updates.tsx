"use client"

import { useState, useEffect } from "react"
import { useCompletion } from "ai/react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"

interface NewsUpdate {
  id: string
  content: string
  timestamp: Date
}

interface GenerativeNewsUpdatesProps {
  updateInterval?: number
}

export function GenerativeNewsUpdates({ updateInterval = 30000 }: GenerativeNewsUpdatesProps) {
  const [newsUpdates, setNewsUpdates] = useState<NewsUpdate[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { complete } = useCompletion({
    api: "/api/generate-news",
  })

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setIsLoading(true)
        const update = await complete("Generate a brief market update")
        if (update) {
          setNewsUpdates((prevUpdates) => [
            { id: Date.now().toString(), content: update, timestamp: new Date() },
            ...prevUpdates.slice(0, 9), // Keep only the 10 most recent updates
          ])
        }
      } catch (error) {
        console.error("Failed to fetch market updates:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchUpdates()

    // Set up interval for updates
    const interval = setInterval(fetchUpdates, updateInterval)
    return () => clearInterval(interval)
  }, [complete, updateInterval])

  const getMessageIcon = (content: string) => {
    if (content.toLowerCase().includes("up") || content.toLowerCase().includes("gain")) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />
    }
    if (content.toLowerCase().includes("down") || content.toLowerCase().includes("loss")) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />
    }
    return <TrendingUp className="h-4 w-4 text-blue-500" />
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-2">
        {newsUpdates.map((update) => (
          <div
            key={update.id}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
          >
            {getMessageIcon(update.content)}
            <div className="flex-1">
              <p className="text-sm">{update.content}</p>
              <p className="text-xs text-muted-foreground">
                {update.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
              AI Generated
            </Badge>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

