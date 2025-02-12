import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GenerativeNewsUpdates } from "@/components/generative-news-updates"

export function NewsPanel() {
  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="text-sm font-semibold mb-2">Latest Market News</h4>
        <ScrollArea className="h-[200px]">
          <GenerativeNewsUpdates />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

