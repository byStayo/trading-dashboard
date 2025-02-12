import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export function EventImpactAnalysis({ events }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>High-Impact Event Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Market Implications</TableHead>
              <TableHead>Affected Sectors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event, index) => (
              <TableRow key={index}>
                <TableCell>{event.name}</TableCell>
                <TableCell>{event.date}</TableCell>
                <TableCell>
                  <Badge variant="destructive">High</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {event.marketImplications.direction === "up" && <TrendingUp className="text-green-500" />}
                    {event.marketImplications.direction === "down" && <TrendingDown className="text-red-500" />}
                    {event.marketImplications.direction === "neutral" && <Minus className="text-yellow-500" />}
                    <span>{event.marketImplications.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {event.affectedSectors.map((sector, idx) => (
                    <Badge key={idx} variant="outline" className="mr-1">
                      {sector}
                    </Badge>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

