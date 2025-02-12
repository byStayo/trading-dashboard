import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface QuickSummaryProps {
  marketHours: string
}

export function QuickSummary({ marketHours }: QuickSummaryProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Market Quick Summary</CardTitle>
        <CardDescription>Overview of current market conditions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Market Status</p>
            <Badge variant={marketHours === "during" ? "default" : "secondary"}>
              {marketHours === "during" ? "Open" : marketHours === "pre" ? "Pre-Market" : "After-Hours"}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium">S&P 500</p>
            <p className="text-2xl font-bold">4,185.81</p>
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              +0.45%
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium">NASDAQ</p>
            <p className="text-2xl font-bold">12,888.28</p>
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              +0.73%
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium">DOW</p>
            <p className="text-2xl font-bold">33,875.40</p>
            <Badge variant="outline" className="bg-red-500/10 text-red-500">
              -0.23%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

