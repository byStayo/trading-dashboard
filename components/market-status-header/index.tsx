"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe2, Moon, Sun, Clock } from "lucide-react"
import { useMarketHours } from "@/lib/hooks/use-market-hours"
import { LiveTickerBar } from "@/components/live-ticker-bar"
import { TickerConfig } from "./ticker-config-dialog"

export function MarketStatusHeader() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const { marketHours, isLoading: isLoadingHours, isError: isErrorHours } = useMarketHours()
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [tickerConfig, setTickerConfig] = useState<TickerConfig>({
    preset: 'trending',
    sector: undefined,
    customTickers: [],
    maxTickers: 20
  })

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Only start the timer after hydration
  useEffect(() => {
    if (!mounted) return
    
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [mounted])

  const getMarketStatusIcon = (status: string) => {
    switch (status) {
      case "during":
        return <Globe2 className="h-4 w-4 text-green-500" />
      case "after":
        return <Moon className="h-4 w-4 text-gray-500" />
      case "pre":
        return <Sun className="h-4 w-4 text-yellow-500" />
      default:
        return <Globe2 className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formattedTime = mounted && currentTime
    ? currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Loading..."

  return (
    <Card className="rounded-none border-x-0">
      <CardContent className="p-2">
        <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-6 w-6"
              disabled={!mounted}
            >
              {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
            </Button>
            {!isLoadingHours && !isErrorHours && marketHours && (
              <Badge
                variant={marketHours === "during" ? "default" : marketHours === "after" ? "secondary" : "outline"}
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
              {formattedTime}
            </span>
          </div>
        </div>
        <LiveTickerBar config={tickerConfig} onConfigUpdate={setTickerConfig} />
      </CardContent>
    </Card>
  )
}

