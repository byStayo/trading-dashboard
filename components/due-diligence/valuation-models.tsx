import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function ValuationModels({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Valuation Models</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">DCF Valuation</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Intrinsic Value</TableCell>
                  <TableCell>${data.dcf.intrinsicValue.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Current Price</TableCell>
                  <TableCell>${data.dcf.currentPrice.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Upside/Downside</TableCell>
                  <TableCell>
                    <Badge variant={data.dcf.upside >= 0 ? "success" : "destructive"}>
                      {data.dcf.upside >= 0 ? "+" : ""}
                      {data.dcf.upside.toFixed(2)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">EV/EBITDA Valuation</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Company EV/EBITDA</TableCell>
                  <TableCell>{data.evEbitda.companyRatio.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Industry Average EV/EBITDA</TableCell>
                  <TableCell>{data.evEbitda.industryAverage.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Valuation</TableCell>
                  <TableCell>
                    <Badge variant={data.evEbitda.valuation === "Undervalued" ? "success" : "destructive"}>
                      {data.evEbitda.valuation}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Peer Benchmarking</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Peer Average</TableHead>
                  <TableHead>Valuation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.peerBenchmarking).map(([metric, values]) => (
                  <TableRow key={metric}>
                    <TableCell>{metric}</TableCell>
                    <TableCell>{values.company.toFixed(2)}</TableCell>
                    <TableCell>{values.peerAverage.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={values.valuation === "Undervalued" ? "success" : "destructive"}>
                        {values.valuation}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

