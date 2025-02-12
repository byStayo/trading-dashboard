import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SectorPerformance {
  name: string
  value: number
}

const mockSectorPerformance: SectorPerformance[] = [
  { name: "Technology", value: 2.31 },
  { name: "Healthcare", value: -0.54 },
  { name: "Financials", value: 1.12 },
  { name: "Energy", value: -1.87 },
  { name: "Consumer", value: 0.76 },
  { name: "Industrials", value: 0.95 },
  { name: "Materials", value: -0.32 },
  { name: "Utilities", value: 0.18 },
]

export function SectorPerformance() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockSectorPerformance.map((sector) => (
            <div key={sector.name} className="flex justify-between items-center">
              <span className="text-sm font-medium">{sector.name}</span>
              <Badge variant={sector.value >= 0 ? "success" : "destructive"}>
                {sector.value > 0 ? "+" : ""}
                {sector.value.toFixed(2)}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

