import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"

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
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          {mockIndices.map((index) => (
            <div key={index.name} className="text-center">
              <div className="text-sm font-medium">{index.name}</div>
              <div className="text-lg font-bold">{index.value.toFixed(2)}</div>
              <Badge variant={index.change >= 0 ? "success" : "destructive"}>
                {index.change > 0 ? "+" : ""}
                {index.change.toFixed(2)}%
              </Badge>
            </div>
          ))}
        </div>
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="chart" className="text-xs">
              Market Overview
            </TabsTrigger>
            <TabsTrigger value="sectors" className="text-xs">
              Sector Performance
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="mt-2">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mockChartData}>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="sectors" className="mt-2">
            <div className="space-y-1">
              {mockSectorPerformance.map((sector) => (
                <div key={sector.name} className="flex justify-between items-center">
                  <span className="text-sm">{sector.name}</span>
                  <Badge variant={sector.value >= 0 ? "success" : "destructive"}>
                    {sector.value > 0 ? "+" : ""}
                    {sector.value.toFixed(2)}%
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
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

