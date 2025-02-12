"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCompletion } from "ai/react"
import {
  LineChart,
  BarChart,
  PieChart,
  Pie,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Settings, LineChartIcon, BarChartIcon, PieChartIcon, LoaderIcon } from "lucide-react"

interface ChartConfig {
  type: "line" | "bar" | "pie"
  data: any[]
  title: string
  description?: string
  metrics: string[]
  colors: string[]
}

export function GenerativeDataVisualization() {
  const [query, setQuery] = useState("")
  const [chartType, setChartType] = useState<"line" | "bar" | "pie">("line")
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { complete } = useCompletion({
    api: "/api/generate-visualization",
  })

  const generateVisualization = async () => {
    if (!query.trim()) {
      return
    }

    setIsLoading(true)
    try {
      const prompt = `Generate a data visualization configuration for: ${query}
      Format the response as a JSON object with the following structure:
      {
        "type": "line" | "bar" | "pie",
        "data": Array<{ name: string, [key: string]: number }>,
        "title": string,
        "description": string,
        "metrics": string[],
        "colors": string[]
      }`

      const response = await complete(prompt)
      if (!response) {
        throw new Error("No response from AI model")
      }

      // Try to find a JSON object in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("Invalid response format")
      }

      try {
        const config = JSON.parse(jsonMatch[0])
        
        // Validate the config
        if (!config.type || !config.data || !config.title || !config.metrics || !config.colors) {
          throw new Error("Missing required fields in configuration")
        }

        // Ensure the type matches the selected chart type
        config.type = chartType

        // Ensure colors are valid hex codes
        config.colors = config.colors.map((color: string) => {
          if (!/^#[0-9A-F]{6}$/i.test(color)) {
            return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
          }
          return color
        })

        // Ensure data is properly formatted
        config.data = config.data.map((item: any) => {
          const formattedItem: any = { name: String(item.name || '') }
          config.metrics.forEach((metric: string) => {
            formattedItem[metric] = Number(item[metric]) || 0
          })
          return formattedItem
        })

        setChartConfig(config)
      } catch (parseError) {
        console.error("Error parsing configuration:", parseError)
        throw new Error("Failed to parse visualization configuration")
      }
    } catch (error) {
      console.error("Error generating visualization:", error)
      // Show error state in UI
      setChartConfig({
        type: chartType,
        data: [],
        title: "Error Generating Visualization",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        metrics: [],
        colors: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderChart = () => {
    if (!chartConfig) return null

    const ChartComponent = chartType === "line" ? LineChart : chartType === "bar" ? BarChart : PieChart

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={chartConfig.data}>
          {chartType !== "pie" && (
            <>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
            </>
          )}
          <Tooltip />
          <Legend />
          {chartType === "line" &&
            chartConfig.metrics.map((metric, index) => (
              <Line key={metric} type="monotone" dataKey={metric} stroke={chartConfig.colors[index]} strokeWidth={2} />
            ))}
          {chartType === "bar" &&
            chartConfig.metrics.map((metric, index) => (
              <Bar key={metric} dataKey={metric} fill={chartConfig.colors[index]} />
            ))}
          {chartType === "pie" &&
            chartConfig.metrics.map((metric, index) => (
              <Pie
                key={metric}
                data={chartConfig.data}
                dataKey={metric}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill={chartConfig.colors[index]}
                label
              />
            ))}
        </ChartComponent>
      </ResponsiveContainer>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Generative Data Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-6">
          <Input
            placeholder="Describe what you want to visualize..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Select value={chartType} onValueChange={(value: "line" | "bar" | "pie") => setChartType(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">
                <div className="flex items-center">
                  <LineChartIcon className="w-4 h-4 mr-2" />
                  Line Chart
                </div>
              </SelectItem>
              <SelectItem value="bar">
                <div className="flex items-center">
                  <BarChartIcon className="w-4 h-4 mr-2" />
                  Bar Chart
                </div>
              </SelectItem>
              <SelectItem value="pie">
                <div className="flex items-center">
                  <PieChartIcon className="w-4 h-4 mr-2" />
                  Pie Chart
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateVisualization} disabled={isLoading}>
            {isLoading ? <LoaderIcon className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
            Generate
          </Button>
        </div>
        {chartConfig ? (
          <div>
            <h3 className="text-lg font-semibold mb-2">{chartConfig.title}</h3>
            {chartConfig.description && <p className="text-sm text-muted-foreground mb-4">{chartConfig.description}</p>}
            {renderChart()}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[400px] border rounded-lg bg-muted/5">
            <p className="text-muted-foreground">Describe what you want to visualize and click Generate</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

