"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function PitchBuilderPage() {
  const [clientName, setClientName] = useState("")
  const [pitchTitle, setPitchTitle] = useState("")
  const [investmentGoal, setInvestmentGoal] = useState("")
  const [riskTolerance, setRiskTolerance] = useState("")
  const [timeHorizon, setTimeHorizon] = useState("")
  const [portfolioAllocation, setPortfolioAllocation] = useState([
    { name: "Stocks", value: 60 },
    { name: "Bonds", value: 30 },
    { name: "Cash", value: 10 },
  ])
  const [projectedReturns, setProjectedReturns] = useState([
    { year: "2023", conservative: 20000, moderate: 22000, aggressive: 25000 },
    { year: "2024", conservative: 21000, moderate: 24000, aggressive: 28000 },
    { year: "2025", conservative: 22000, moderate: 26000, aggressive: 32000 },
    { year: "2026", conservative: 23000, moderate: 28000, aggressive: 36000 },
    { year: "2027", conservative: 24000, moderate: 30000, aggressive: 40000 },
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle pitch submission logic here
    console.log("Pitch submitted")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Pitch Builder</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Enter the basic details for your pitch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="clientName" className="text-sm font-medium">
                  Client Name
                </label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="pitchTitle" className="text-sm font-medium">
                  Pitch Title
                </label>
                <Input
                  id="pitchTitle"
                  value={pitchTitle}
                  onChange={(e) => setPitchTitle(e.target.value)}
                  placeholder="Enter pitch title"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="investmentGoal" className="text-sm font-medium">
                Investment Goal
              </label>
              <Textarea
                id="investmentGoal"
                value={investmentGoal}
                onChange={(e) => setInvestmentGoal(e.target.value)}
                placeholder="Describe the client's investment goals"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="riskTolerance" className="text-sm font-medium">
                  Risk Tolerance
                </label>
                <Select value={riskTolerance} onValueChange={setRiskTolerance}>
                  <SelectTrigger id="riskTolerance">
                    <SelectValue placeholder="Select risk tolerance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="timeHorizon" className="text-sm font-medium">
                  Time Horizon
                </label>
                <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                  <SelectTrigger id="timeHorizon">
                    <SelectValue placeholder="Select time horizon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short-term">Short-term (0-3 years)</SelectItem>
                    <SelectItem value="medium-term">Medium-term (3-7 years)</SelectItem>
                    <SelectItem value="long-term">Long-term (7+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
            <CardDescription>Visualize the proposed asset allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioAllocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {portfolioAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projected Returns</CardTitle>
            <CardDescription>Visualize potential investment outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart">
              <TabsList>
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
              <TabsContent value="chart">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectedReturns}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="conservative" stroke="#8884d8" />
                      <Line type="monotone" dataKey="moderate" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="aggressive" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="table">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Year</th>
                        <th className="text-right">Conservative</th>
                        <th className="text-right">Moderate</th>
                        <th className="text-right">Aggressive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectedReturns.map((row) => (
                        <tr key={row.year}>
                          <td>{row.year}</td>
                          <td className="text-right">${row.conservative.toLocaleString()}</td>
                          <td className="text-right">${row.moderate.toLocaleString()}</td>
                          <td className="text-right">${row.aggressive.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Generate Pitch</Button>
        </div>
      </form>
    </div>
  )
}

