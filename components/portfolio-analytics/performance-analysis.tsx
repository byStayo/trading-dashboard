import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface PerformanceData {
  returns: Array<{ date: string; value: number }>
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
}

interface PerformanceAnalysisProps {
  data: PerformanceData
}

export function PerformanceAnalysis({ data }: PerformanceAnalysisProps) {
  const renderMetricCard = (title: string, value: number, isPercentage: boolean = true) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Badge variant={value >= 0 ? "default" : "destructive"} className="ml-2">
            {value >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
            {Math.abs(value).toFixed(2)}{isPercentage ? "%" : ""}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.returns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  name="Portfolio Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {renderMetricCard("Volatility", data.volatility)}
        {renderMetricCard("Sharpe Ratio", data.sharpeRatio, false)}
        {renderMetricCard("Maximum Drawdown", data.maxDrawdown)}
      </div>
    </div>
  )
} 