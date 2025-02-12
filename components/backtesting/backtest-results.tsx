"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function BacktestResults({ results }) {
  const { performanceData, metrics, comparisonData } = results

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Performance Chart</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="strategy" stroke="#8884d8" />
            <Line type="monotone" dataKey="benchmark" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Performance Metrics</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(metrics).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell>{key}</TableCell>
                <TableCell>{typeof value === "number" ? value.toFixed(2) : value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Benchmark Comparisons</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Benchmark</TableHead>
              <TableHead>Return</TableHead>
              <TableHead>Sharpe Ratio</TableHead>
              <TableHead>Max Drawdown</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisonData.map((benchmark) => (
              <TableRow key={benchmark.name}>
                <TableCell>{benchmark.name}</TableCell>
                <TableCell>{benchmark.return.toFixed(2)}%</TableCell>
                <TableCell>{benchmark.sharpeRatio.toFixed(2)}</TableCell>
                <TableCell>{benchmark.maxDrawdown.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

