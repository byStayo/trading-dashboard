import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const trendingTopics = [
  { topic: "Artificial Intelligence", sentiment: "positive", mentions: 1500 },
  { topic: "Cryptocurrency Regulations", sentiment: "neutral", mentions: 1200 },
  { topic: "Green Energy Stocks", sentiment: "positive", mentions: 1000 },
  { topic: "Supply Chain Disruptions", sentiment: "negative", mentions: 800 },
  { topic: "Interest Rate Hikes", sentiment: "negative", mentions: 750 },
]

export function TrendingTopics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Market Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {trendingTopics.map((topic, index) => (
            <li key={index} className="flex items-center justify-between">
              <span className="font-medium">{topic.topic}</span>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    topic.sentiment === "positive"
                      ? "success"
                      : topic.sentiment === "negative"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {topic.sentiment}
                </Badge>
                <span className="text-sm text-muted-foreground">{topic.mentions} mentions</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

