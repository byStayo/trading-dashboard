import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const peterLynchMetrics = [
  { name: "P/E Ratio", value: 15.2, benchmark: 20, isBetter: true },
  { name: "PEG Ratio", value: 1.2, benchmark: 1, isBetter: false },
  { name: "Dividend Yield", value: 2.5, benchmark: 2, isBetter: true },
  { name: "Debt-to-Equity", value: 0.8, benchmark: 1, isBetter: true },
]

export function PeterLynchValuation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Peter Lynch Valuation</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {peterLynchMetrics.map((metric) => (
            <li key={metric.name} className="flex items-center justify-between">
              <span className="font-medium">{metric.name}</span>
              <div className="flex items-center space-x-2">
                <span>{metric.value}</span>
                <Badge variant={metric.isBetter ? "success" : "destructive"}>
                  {metric.isBetter ? "Better" : "Worse"} than {metric.benchmark}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

