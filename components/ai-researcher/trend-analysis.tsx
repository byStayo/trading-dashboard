import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TrendAnalysisProps {
  data: {
    trends: {
      name: string
      impact: "positive" | "negative" | "neutral"
      description: string
    }[]
  }
}

export function TrendAnalysis({ data }: TrendAnalysisProps) {
  return (
    <div className="space-y-4">
      {data.trends.map((trend, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{trend.name}</span>
              <Badge
                variant={
                  trend.impact === "positive" ? "default" : trend.impact === "negative" ? "destructive" : "secondary"
                }
              >
                {trend.impact}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{trend.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

