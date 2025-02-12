"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Globe2, Moon, Clock, Sun } from "lucide-react"
import { LiveTickerBar } from "@/components/live-ticker-bar"
import { useMarketData } from "@/lib/hooks/use-swr-market-data"
import { useMarketHours } from "@/lib/hooks/use-market-hours"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { MarketOverview } from "./market-overview"

export function MarketStatusHeader() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { marketHours, isLoading: isLoadingHours, isError: isErrorHours } = useMarketHours()
  const { marketData, isLoading: isLoadingData, isError: isErrorData } = useMarketData()
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getMarketStatusIcon = (status: string) => {
    switch (status) {
      case "during":
        return <Globe2 className="h-4 w-4 text-green-500" />
      case "after":
        return <Moon className="h-4 w-4 text-blue-500" />
      case "pre":
        return <Sun className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Card className="rounded-none border-x-0">
      <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-6 w-6" disabled={!mounted}>
            {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
          </Button>
          {!isLoadingHours && !isErrorHours && marketHours && (
            <Badge
              variant={marketHours === "during" ? "success" : marketHours === "after" ? "default" : "warning"}
              className="text-xs px-2 py-0.5 flex items-center"
            >
              {getMarketStatusIcon(marketHours)}
              <span className="ml-1">
                {marketHours === "during" ? "Market Open" : marketHours === "after" ? "After Hours" : "Pre-Market"}
              </span>
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium">
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
      <LiveTickerBar data={marketData || []} isLoading={isLoadingData} isError={isErrorData} />
      <div className="h-[200px]">
        <MarketOverview />
      </div>
    </Card>
  )
}

