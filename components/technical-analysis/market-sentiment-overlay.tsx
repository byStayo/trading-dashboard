import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface MarketSentimentOverlayProps {
  data: {
    bullishPercentage: number
    bearishPercentage: number
    neutralPercentage: number
  }
}

export function MarketSentimentOverlay({ data }: MarketSentimentOverlayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Bullish</span>
              <span className="text-sm font-medium">{data.bullishPercentage}%</span>
            </div>
            <Progress value={data.bullishPercentage} className="bg-red-200">
              <div className="bg-green-500 h-full" style={{ width: `${data.bullishPercentage}%` }} />
            </Progress>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Bearish</span>
              <span className="text-sm font-medium">{data.bearishPercentage}%</span>
            </div>
            <Progress value={data.bearishPercentage} className="bg-green-200">
              <div className="bg-red-500 h-full" style={{ width: `${data.bearishPercentage}%` }} />
            </Progress>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Neutral</span>
              <span className="text-sm font-medium">{data.neutralPercentage}%</span>
            </div>
            <Progress value={data.neutralPercentage} className="bg-gray-200">
              <div className="bg-gray-500 h-full" style={{ width: `${data.neutralPercentage}%` }} />
            </Progress>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

