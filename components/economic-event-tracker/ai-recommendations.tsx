import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function AIRecommendations({ recommendations }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Generated Investment Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Recommendation</TableHead>
              <TableHead>Rationale</TableHead>
              <TableHead>Time Horizon</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recommendations.map((rec, index) => (
              <TableRow key={index}>
                <TableCell>{rec.asset}</TableCell>
                <TableCell>
                  <Badge variant={rec.type === "Buy" ? "default" : "secondary"}>{rec.type}</Badge>
                </TableCell>
                <TableCell>{rec.recommendation}</TableCell>
                <TableCell>{rec.rationale}</TableCell>
                <TableCell>{rec.timeHorizon}</TableCell>
                <TableCell>
                  <Button size="sm">Execute</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

