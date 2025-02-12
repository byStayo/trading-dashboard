import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface BenchmarkData {
  comparisons: Array<{
    benchmark: string
    performance: number
    correlation: number
  }>
  historicalPerformance: Array<{
    date: string
    portfolio: number
    [key: string]: number | string // For benchmark values
  }>
}

interface BenchmarkComparisonProps {
  data: BenchmarkData
}

export function BenchmarkComparison({ data }: BenchmarkComparisonProps) {
  const benchmarkColors = {
    portfolio: "#8884d8",
    "S&P 500": "#82ca9d",
    "NASDAQ": "#ffc658",
    "DJIA": "#ff7300"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance vs Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.historicalPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.entries(benchmarkColors).map(([key, color]) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key.toLowerCase()}
                    stroke={color}
                    strokeWidth={key === "portfolio" ? 2 : 1}
                    dot={false}
                    name={key === "portfolio" ? "Portfolio" : key}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benchmark Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Benchmark</TableHead>
                <TableHead>Relative Performance</TableHead>
                <TableHead>Correlation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.comparisons.map((comparison) => (
                <TableRow key={comparison.benchmark}>
                  <TableCell className="font-medium">{comparison.benchmark}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Badge variant={comparison.performance >= 0 ? "default" : "destructive"} className="mr-2">
                        {comparison.performance >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(comparison.performance).toFixed(2)}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        vs {comparison.benchmark}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        comparison.correlation > 0.7 
                          ? "bg-yellow-500/10 text-yellow-500"
                          : comparison.correlation > 0.3
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-green-500/10 text-green-500"
                      }
                    >
                      {(comparison.correlation * 100).toFixed(1)}%
                    </Badge>
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