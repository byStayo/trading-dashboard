"use client"

import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts"

interface ChartData {
  time: string
  SP500: number
  NASDAQ: number
  DOW: number
}

interface ChartProps {
  data: ChartData[]
}

export default function MarketOverviewChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="time" fontSize={10} />
        <YAxis fontSize={10} />
        <Tooltip />
        <Legend iconSize={8} iconType="circle" />
        <Line type="monotone" dataKey="SP500" stroke="#8884d8" dot={false} />
        <Line type="monotone" dataKey="NASDAQ" stroke="#82ca9d" dot={false} />
        <Line type="monotone" dataKey="DOW" stroke="#ffc658" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
} 