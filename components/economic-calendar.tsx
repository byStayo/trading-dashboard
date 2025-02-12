import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface EconomicEvent {
  time: string
  event: string
  impact: "high" | "medium" | "low"
}

const mockEvents: EconomicEvent[] = [
  { time: "08:30", event: "US Nonfarm Payrolls", impact: "high" },
  { time: "10:00", event: "EU Consumer Confidence", impact: "medium" },
  { time: "14:00", event: "Fed Interest Rate Decision", impact: "high" },
  { time: "22:30", event: "AU Unemployment Rate", impact: "medium" },
]

export function EconomicCalendar() {
  return (
    <Card>
      <CardContent className="p-4">
        <ul className="space-y-3">
          {mockEvents.map((event, index) => (
            <li key={index} className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium mr-2">{event.time}</span>
                <span className="text-sm">{event.event}</span>
              </div>
              <Badge
                variant={event.impact === "high" ? "destructive" : event.impact === "medium" ? "secondary" : "outline"}
              >
                {event.impact.toUpperCase()}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

