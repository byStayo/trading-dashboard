import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function SECFilingsAnalysis({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEC Filings Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filing Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Key Insights</TableHead>
              <TableHead>Sentiment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((filing, index) => (
              <TableRow key={index}>
                <TableCell>{filing.type}</TableCell>
                <TableCell>{filing.date}</TableCell>
                <TableCell>{filing.keyInsights}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      filing.sentiment === "Positive"
                        ? "success"
                        : filing.sentiment === "Negative"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {filing.sentiment}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

