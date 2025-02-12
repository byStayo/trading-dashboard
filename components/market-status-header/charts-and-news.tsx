import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { GenerativeNewsUpdates } from "@/components/generative-news-updates"

interface ChartData {
  time: number
  value: number
}

interface SectorPerformance {
  name: string
  value: number
}

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

export function ChartsAndNews() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Card className="col-span-1">
        <CardContent className="p-2">
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
                    <span className="text-xs">{sector.name}</span>
                    <Badge variant={sector.value >= 0 ? "success" : "destructive"} className="text-xs">
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
      <Card className="col-span-1">
        <CardContent className="p-2">
          <h4 className="text-xs font-semibold mb-2">Latest Market News</h4>
          <ScrollArea className="h-[200px]">
            <GenerativeNewsUpdates />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

