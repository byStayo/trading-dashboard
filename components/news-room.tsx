import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

const newsItems = [
  {
    title: "Company X Announces Record Profits",
    source: "Financial Times",
    time: "2 hours ago",
    sentiment: "positive",
  },
  {
    title: "Market Volatility Increases Amid Global Tensions",
    source: "Wall Street Journal",
    time: "4 hours ago",
    sentiment: "negative",
  },
  {
    title: "New Tech IPO Sees Strong First Day Trading",
    source: "TechCrunch",
    time: "6 hours ago",
    sentiment: "positive",
  },
  {
    title: "Central Bank Hints at Potential Rate Cut",
    source: "Bloomberg",
    time: "8 hours ago",
    sentiment: "neutral",
  },
]

export function NewsRoom() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>News Room</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <ul className="space-y-4">
            {newsItems.map((item, index) => (
              <li key={index} className="border-b pb-2">
                <h3 className="font-medium">{item.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">
                    {item.source} • {item.time}
                  </span>
                  <Badge
                    variant={
                      item.sentiment === "positive"
                        ? "success"
                        : item.sentiment === "negative"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {item.sentiment}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

