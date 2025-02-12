import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function Benchmarking({ data }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.benchmarkComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="portfolio" fill="#8884d8" />
                <Bar dataKey="benchmark" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hedge Fund Strategy Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Strategy</TableHead>
                <TableHead>Your Performance</TableHead>
                <TableHead>Strategy Average</TableHead>
                <TableHead>Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.hedgeFundComparison.map((strategy, index) => (
                <TableRow key={index}>
                  <TableCell>{strategy.name}</TableCell>
                  <TableCell>{strategy.portfolioPerformance.toFixed(2)}%</TableCell>
                  <TableCell>{strategy.strategyAverage.toFixed(2)}%</TableCell>
                  <TableCell className={strategy.difference > 0 ? "text-green-600" : "text-red-600"}>
                    {strategy.difference > 0 ? "+" : ""}
                    {strategy.difference.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

