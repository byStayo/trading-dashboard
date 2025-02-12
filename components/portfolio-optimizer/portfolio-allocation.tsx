import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useEffect, useState, useCallback } from "react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B", "#6B8E23", "#483D8B"]

interface AllocationData {
  name: string
  value: number
}

interface PortfolioAllocationProps {
  data: AllocationData[]
}

export function PortfolioAllocation({ data }: PortfolioAllocationProps) {
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 })

  const updateDimensions = useCallback(() => {
    const container = document.getElementById('portfolio-allocation-container')
    if (container) {
      const { width, height } = container.getBoundingClientRect()
      setChartDimensions({
        width: width,
        height: Math.min(height, width * 0.75) // Keep aspect ratio reasonable
      })
    }
  }, [])

  useEffect(() => {
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [updateDimensions])

  const calculateRadius = () => {
    const minDimension = Math.min(chartDimensions.width, chartDimensions.height)
    return Math.min(minDimension * 0.4, 150) // Cap at 150px
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div id="portfolio-allocation-container" className="w-full h-[calc(100vh-20rem)] min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={calculateRadius()}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry: AllocationData, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

