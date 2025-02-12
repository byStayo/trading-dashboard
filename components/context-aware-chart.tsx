"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCompletion } from "ai/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface ChartData {
  date: string
  [key: string]: number | string
}

export function ContextAwareChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [userQuery, setUserQuery] = useState("")
  const [chartTitle, setChartTitle] = useState("Custom Chart")
  const [chartDescription, setChartDescription] = useState("Generated based on your query")
  const [error, setError] = useState<string | null>(null)
  const [chartType, setChartType] = useState<"line" | "area" | "bar">("line")
  const [isLoading, setIsLoading] = useState(false)

  const { complete } = useCompletion({
    api: "/api/generate",
  })

  const generateChartData = useCallback(async () => {
    if (!userQuery) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await complete(`Generate chart data for the query: ${userQuery}`)
      let parsedData
      try {
        parsedData = JSON.parse(response)
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError)
        setError("Failed to parse AI response. Please try again.")
        return
      }

      if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
        setChartData(parsedData.data)
        setChartTitle(parsedData.title || "Custom Chart")
        setChartDescription(parsedData.description || "Generated based on your query")
      } else {
        setError("Invalid data format received. Please try a different query.")
      }
    } catch (error) {
      console.error("Error generating chart data:", error)
      setError("Failed to generate chart data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [userQuery, complete])

  useEffect(() => {
    if (userQuery) {
      generateChartData()
    }
  }, [userQuery, generateChartData])

  const renderChart = () => {
    if (!chartData.length) return null

    const ChartComponent = chartType === "bar" ? BarChart : chartType === "area" ? AreaChart : LineChart

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(chartData[0])
            .filter((key) => key !== "date")
            .map((key, index) => {
              const Component = chartType === "bar" ? Bar : chartType === "area" ? Area : Line
              return (
                <Component
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                  fill={chartType === "area" ? `#${Math.floor(Math.random() * 16777215).toString(16)}` : undefined}
                />
              )
            })}
        </ChartComponent>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{chartTitle}</CardTitle>
        <CardDescription>{chartDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="Enter your chart query (e.g., 'Show SPX vs VIX last month')"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="flex-1"
          />
          <Select value={chartType} onValueChange={(value: "line" | "area" | "bar") => setChartType(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateChartData} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Generate"}
          </Button>
        </div>
        {error && <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        {chartData.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex items-center justify-center h-[400px] border rounded-lg bg-muted/5">
            <p className="text-muted-foreground">Describe what you want to visualize and click Generate</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

