import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMarketIndices } from "@/lib/hooks/use-market-indices"

interface ChartData {
  time: number
  value: number
}

interface IndexData {
  name: string
  value: number
  change: number
}

interface SectorPerformance {
  name: string
  value: number
}

const mockIndices: IndexData[] = [
  { name: "S&P 500", value: 4185.81, change: 0.45 },
  { name: "NASDAQ", value: 12888.28, change: 0.73 },
  { name: "DOW", value: 33875.4, change: -0.23 },
  { name: "VIX", value: 15.65, change: -5.21 },
]

const mockChartData: ChartData[] = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  value: 1000 + Math.random() * 200,
}))

const mockSectorPerformance: SectorPerformance[] = [
  { name: "Technology", value: 2.31 },
  { name: "Healthcare", value: -0.54 },
  { name: "Financials", value: 1.12 },
  { name: "Energy", value: -1.87 },
  { name: "Consumer", value: 0.76 },
]

export const DEFAULT_CONFIG: TickerConfig = {
  preset: "trending" as TickerPreset,
  customTickers: [],
  maxTickers: 20,
  sector: undefined // Optional field
}

export function MarketOverview() {
  const { indices, isLoading, error } = useMarketIndices()

  if (error) {
    return (
      <div className="text-sm text-red-500 p-4">
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          {indices.map((index) => (
            <div key={index.symbol} className="text-center">
              <div className="text-sm font-medium">{index.name}</div>
              <div className="text-lg font-bold">{index.value.toFixed(2)}</div>
              <Badge variant={index.changePercent >= 0 ? "default" : "destructive"}>
                {index.changePercent >= 0 ? "+" : ""}
                {index.changePercent.toFixed(2)}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function LiveTickerWrapper() {
  // Initialize with DEFAULT_CONFIG immediately
  const [config, setConfig] = useState<TickerConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load config from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY)
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig)
        // Validate the config structure
        if (
          parsedConfig &&
          typeof parsedConfig === 'object' &&
          'preset' in parsedConfig &&
          'customTickers' in parsedConfig &&
          'maxTickers' in parsedConfig &&
          Array.isArray(parsedConfig.customTickers)
        ) {
          setConfig(parsedConfig)
        }
      }
    } catch (error) {
      console.error('Error loading ticker config:', error)
      // Keep using DEFAULT_CONFIG if there's an error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Rest of the component remains the same...
}

export function TickerConfigDialog({ 
  open, 
  onOpenChange, 
  onSave,
  currentConfig = DEFAULT_CONFIG // Provide default value
}: TickerConfigDialogProps) {
  const [config, setConfig] = useState<TickerConfig>(currentConfig)

  // Update local state when currentConfig changes
  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig)
    }
  }, [currentConfig])

  // Rest of the component remains the same...
}

