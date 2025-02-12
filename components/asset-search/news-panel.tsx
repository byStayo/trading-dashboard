import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NewsItem {
  id: string
  title: string
  source: string
  date: string
  sentiment: "positive" | "negative" | "neutral"
  url: string
}

interface NewsPanelProps {
  news: NewsItem[]
}

export function NewsPanel({ news }: NewsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {news.map((item) => (
            <div key={item.id} className="mb-4 pb-4 border-b last:border-b-0">
              <h3 className="font-semibold mb-1">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {item.title}
                </a>
              </h3>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{item.source}</span>
                <span>{item.date}</span>
              </div>
              <Badge
                variant={
                  item.sentiment === "positive"
                    ? "success"
                    : item.sentiment === "negative"
                      ? "destructive"
                      : "secondary"
                }
                className="mt-2"
              >
                {item.sentiment}
              </Badge>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

