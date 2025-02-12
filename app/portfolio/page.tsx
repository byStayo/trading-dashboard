"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts"
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Plus } from "lucide-react"

// Mock data
const portfolioOverview = {
  totalValue: 125000,
  cashBalance: 10000,
  performance: {
    day: 2.5,
    week: -1.2,
    month: 5.8,
    year: 12.3,
  },
}

const assetAllocation = [
  { name: "Stocks", value: 70000 },
  { name: "Bonds", value: 30000 },
  { name: "Real Estate", value: 15000 },
  { name: "Crypto", value: 5000 },
  { name: "Cash", value: 5000 },
]

const holdings = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    quantity: 50,
    averagePrice: 150,
    currentPrice: 175,
    value: 8750,
    change: 16.67,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    quantity: 20,
    averagePrice: 2000,
    currentPrice: 2200,
    value: 44000,
    change: 10,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    quantity: 30,
    averagePrice: 220,
    currentPrice: 280,
    value: 8400,
    change: 27.27,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    quantity: 15,
    averagePrice: 3000,
    currentPrice: 3200,
    value: 48000,
    change: 6.67,
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    quantity: 25,
    averagePrice: 600,
    currentPrice: 650,
    value: 16250,
    change: 8.33,
  },
]

const performanceData = [
  { date: "2023-01-01", value: 100000 },
  { date: "2023-02-01", value: 102000 },
  { date: "2023-03-01", value: 105000 },
  { date: "2023-04-01", value: 103000 },
  { date: "2023-05-01", value: 108000 },
  { date: "2023-06-01", value: 112000 },
  { date: "2023-07-01", value: 125000 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function PortfolioPage() {
  const [timeframe, setTimeframe] = useState("1Y")

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Portfolio</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolioOverview.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +${(portfolioOverview.totalValue - portfolioOverview.cashBalance).toLocaleString()} since last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${portfolioOverview.cashBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available for trading</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day Change</CardTitle>
            {portfolioOverview.performance.day >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioOverview.performance.day >= 0 ? "+" : ""}
              {portfolioOverview.performance.day}%
            </div>
            <p className="text-xs text-muted-foreground">
              ${((portfolioOverview.totalValue * portfolioOverview.performance.day) / 100).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Return</CardTitle>
            {portfolioOverview.performance.year >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portfolioOverview.performance.year >= 0 ? "+" : ""}
              {portfolioOverview.performance.year}%
            </div>
            <p className="text-xs text-muted-foreground">
              ${((portfolioOverview.totalValue * portfolioOverview.performance.year) / 100).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Breakdown of your portfolio by asset class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {assetAllocation.map((entry, index) => (
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

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Historical performance of your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end space-x-2 mb-4">
              <Button variant={timeframe === "1M" ? "secondary" : "outline"} onClick={() => setTimeframe("1M")}>
                1M
              </Button>
              <Button variant={timeframe === "3M" ? "secondary" : "outline"} onClick={() => setTimeframe("3M")}>
                3M
              </Button>
              <Button variant={timeframe === "6M" ? "secondary" : "outline"} onClick={() => setTimeframe("6M")}>
                6M
              </Button>
              <Button variant={timeframe === "1Y" ? "secondary" : "outline"} onClick={() => setTimeframe("1Y")}>
                1Y
              </Button>
              <Button variant={timeframe === "ALL" ? "secondary" : "outline"} onClick={() => setTimeframe("ALL")}>
                ALL
              </Button>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Holdings</CardTitle>
              <CardDescription>Your current investment positions</CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Position
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Avg Price</TableHead>
                <TableHead className="text-right">Current Price</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => (
                <TableRow key={holding.symbol}>
                  <TableCell className="font-medium">{holding.symbol}</TableCell>
                  <TableCell>{holding.name}</TableCell>
                  <TableCell className="text-right">{holding.quantity}</TableCell>
                  <TableCell className="text-right">${holding.averagePrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${holding.currentPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${holding.value.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={holding.change >= 0 ? "default" : "destructive"}>
                      {holding.change >= 0 ? "+" : ""}
                      {holding.change.toFixed(2)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Analysis</CardTitle>
          <CardDescription>Key metrics and insights about your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="space-y-4">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="diversification">Diversification</TabsTrigger>
            </TabsList>
            <TabsContent value="performance">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+15.8%</div>
                    <p className="text-xs text-muted-foreground">Since inception</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Annualized Return</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+8.2%</div>
                    <p className="text-xs text-muted-foreground">Per year on average</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dividend Yield</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2.3%</div>
                    <p className="text-xs text-muted-foreground">Annual yield based on current prices</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="risk">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Beta</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1.2</div>
                    <p className="text-xs text-muted-foreground">Relative to S&P 500</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Shar pe Ratio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0.8</div>
                    <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">-15.3%</div>
                    <p className="text-xs text-muted-foreground">Largest peak-to-trough decline</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="diversification">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Sector Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: "Technology", value: 35 },
                              { name: "Healthcare", value: 20 },
                              { name: "Financials", value: 15 },
                              { name: "Consumer", value: 10 },
                              { name: "Energy", value: 10 },
                              { name: "Others", value: 10 },
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Geographic Exposure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "North America", value: 60 },
                                { name: "Europe", value: 20 },
                                { name: "Asia", value: 15 },
                                { name: "Other", value: 5 },
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {COLORS.map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Correlation Matrix</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Correlation between your top holdings (1 = perfect correlation, -1 = perfect negative correlation)
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Symbol</TableHead>
                          {holdings.slice(0, 5).map((holding) => (
                            <TableHead key={holding.symbol} className="text-right">
                              {holding.symbol}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {holdings.slice(0, 5).map((holding, i) => (
                          <TableRow key={holding.symbol}>
                            <TableCell className="font-medium">{holding.symbol}</TableCell>
                            {holdings.slice(0, 5).map((_, j) => (
                              <TableCell key={j} className="text-right">
                                {i === j ? "1.00" : (Math.random() * 2 - 1).toFixed(2)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

