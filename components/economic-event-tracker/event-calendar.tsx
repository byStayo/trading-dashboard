import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function EventCalendar({ events }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Economic Events</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Previous</TableHead>
              <TableHead>Forecast</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event, index) => (
              <TableRow key={index}>
                <TableCell>{event.date}</TableCell>
                <TableCell>{event.name}</TableCell>
                <TableCell>{event.country}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      event.impact === "High" ? "destructive" : event.impact === "Medium" ? "warning" : "default"
                    }
                  >
                    {event.impact}
                  </Badge>
                </TableCell>
                <TableCell>{event.previous}</TableCell>
                <TableCell>{event.forecast}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

