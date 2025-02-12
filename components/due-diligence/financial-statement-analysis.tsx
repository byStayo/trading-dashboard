import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function FinancialStatementAnalysis({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Statement Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Key Metrics</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>YoY Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.keyMetrics).map(([metric, values]) => (
                  <TableRow key={metric}>
                    <TableCell>{metric}</TableCell>
                    <TableCell>{values.value}</TableCell>
                    <TableCell>{values.yoyChange}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Revenue and Earnings Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenueEarningsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" />
                <Line yAxisId="right" type="monotone" dataKey="earnings" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

