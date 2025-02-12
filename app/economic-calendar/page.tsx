"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getEconomicEvents } from "@/lib/api/economic-calendar"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { DateRange } from "react-day-picker"

interface EconomicEvent {
  id: string
  date: string
  time: string
  currency: string
  event: string
  importance: "low" | "medium" | "high"
  actual: string
  forecast: string
  previous: string
}

export default function EconomicCalendarPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(new Date().setMonth(new Date().getMonth() + 1))
  })
  const [importance, setImportance] = useState<string>("all")
  const [events, setEvents] = useState<EconomicEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
  }

  useEffect(() => {
    const fetchEvents = async () => {
      if (!dateRange?.from || !dateRange?.to) return

      setIsLoading(true)
      try {
        const data = await getEconomicEvents({
          from: dateRange.from,
          to: dateRange.to,
          importance: importance === "all" ? undefined : importance,
        })
        setEvents(data)
      } catch (error) {
        console.error("Error fetching economic events:", error)
        toast({
          title: "Error",
          description: "Failed to load economic events. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [dateRange, importance, toast])

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Economic Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <DatePickerWithRange date={dateRange} onSelect={handleDateRangeChange} />
          <Select value={importance} onValueChange={setImportance}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select importance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="low">Low Impact</SelectItem>
              <SelectItem value="medium">Medium Impact</SelectItem>
              <SelectItem value="high">High Impact</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] w-full">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : events.length > 0 ? (
              <table className="w-full">
                <thead className="sticky top-0 bg-background border-b">
                  <tr>
                    <th className="text-left p-4">Date/Time</th>
                    <th className="text-left p-4">Currency</th>
                    <th className="text-left p-4">Event</th>
                    <th className="text-center p-4">Importance</th>
                    <th className="text-right p-4">Actual</th>
                    <th className="text-right p-4">Forecast</th>
                    <th className="text-right p-4">Previous</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>{new Date(event.date).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">{event.time}</div>
                      </td>
                      <td className="p-4">{event.currency}</td>
                      <td className="p-4">{event.event}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            event.importance === "high"
                              ? "bg-destructive/20 text-destructive"
                              : event.importance === "medium"
                              ? "bg-yellow-500/20 text-yellow-700"
                              : "bg-green-500/20 text-green-700"
                          }`}
                        >
                          {event.importance}
                        </span>
                      </td>
                      <td className="p-4 text-right">{event.actual}</td>
                      <td className="p-4 text-right">{event.forecast}</td>
                      <td className="p-4 text-right">{event.previous}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                No economic events found for the selected criteria
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

