import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

export function TrendOpportunities({ trends }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Economic Trends and Trading Opportunities</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trend</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Potential Opportunities</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trends.map((trend, index) => (
              <TableRow key={index}>
                <TableCell>{trend.name}</TableCell>
                <TableCell>
                  {trend.direction === "up" ? (
                    <TrendingUp className="text-green-500" />
                  ) : (
                    <TrendingDown className="text-red-500" />
                  )}
                </TableCell>
                <TableCell>{trend.duration}</TableCell>
                <TableCell>
                  <Badge variant={trend.confidence >= 70 ? "default" : "secondary"}>{trend.confidence}%</Badge>
                </TableCell>
                <TableCell>
                  <ul className="list-disc pl-4">
                    {trend.opportunities.map((opp, idx) => (
                      <li key={idx}>{opp}</li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

