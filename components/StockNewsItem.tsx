import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type StockNewsItemProps = {
  headline: string
  summary: string
  source: string
  publishedUtc?: string
}

export function StockNewsItem({ headline, summary, source, publishedUtc }: StockNewsItemProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{headline}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">{summary}</p>
        <div className="flex justify-between items-center">
          <Badge variant="secondary">{source}</Badge>
          {publishedUtc && (
            <span className="text-xs text-muted-foreground">{new Date(publishedUtc).toLocaleString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

