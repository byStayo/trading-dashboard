"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Target,
  Shield,
  AlertTriangle,
  DollarSign,
  Users,
  Building,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts"

// Mock data for demonstration
const mockStockData = {
  symbol: "AAPL",
  name: "Apple Inc.",
  price: 185.92,
  change: 2.45,
  changePercent: 1.34,
  marketCap: "3.02T",
  peRatio: 28.5,
  beta: 1.2,
  alphaSpreads: {
    valueSpread: 15.2,
    growthSpread: 8.4,
    qualitySpread: 12.7,
    momentumSpread: 6.8,
  },
  historicalPrices: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    price: 180 + Math.random() * 20,
    volume: Math.floor(Math.random() * 1000000),
  })),
  financials: {
    revenue: [
      { year: "2020", value: 274.5 },
      { year: "2021", value: 365.8 },
      { year: "2022", value: 394.3 },
      { year: "2023", value: 383.9 },
    ],
    margins: {
      gross: 43.5,
      operating: 30.2,
      net: 25.8,
    },
  },
}

const investmentThesis = [
  {
    title: "Market Leadership",
    description: "Dominant position in premium consumer electronics with strong brand loyalty",
    sentiment: "positive",
  },
  {
    title: "Services Growth",
    description: "Expanding high-margin services business with recurring revenue",
    sentiment: "positive",
  },
  {
    title: "Innovation Pipeline",
    description: "Strong R&D investments in AI, AR/VR, and autonomous systems",
    sentiment: "positive",
  },
  {
    title: "Competition Risk",
    description: "Increasing competition in key markets and product categories",
    sentiment: "negative",
  },
]

export default function StockAnalysisPage() {
  const [stockSymbol, setStockSymbol] = useState("")
  const [stockData, setStockData] = useState(mockStockData)

  const handleSearch = () => {
    // In a real application, this would fetch data from an API
    console.log("Searching for:", stockSymbol)
    // For now, we'll just update the stock symbol in our mock data
    setStockData({ ...mockStockData, symbol: stockSymbol })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Enter stock symbol (e.g., AAPL)"
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
            className="max-w-sm"
          />
        </div>
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Analyze
        </Button>
      </div>

      {stockData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{stockData.symbol}</CardTitle>
                    <CardDescription>{stockData.name}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${stockData.price}</div>
                    <Badge variant={stockData.change >= 0 ? "success" : "destructive"}>
                      {stockData.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {stockData.change > 0 ? "+" : ""}
                      {stockData.change} ({stockData.changePercent}%)
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockData.historicalPrices}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={["auto", "auto"]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="price" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alpha Spread Analysis</CardTitle>
                <CardDescription>Relative value metrics compared to peers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stockData.alphaSpreads).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{key.replace("Spread", "")}</span>
                        <span className="text-sm font-medium">{value}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="thesis" className="space-y-4">
            <TabsList>
              <TabsTrigger value="thesis">Investment Thesis</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
              <TabsTrigger value="valuation">Valuation</TabsTrigger>
            </TabsList>

            <TabsContent value="thesis">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Thesis</CardTitle>
                  <CardDescription>Key investment considerations and analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {investmentThesis.map((point, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex items-start space-x-2">
                            {point.sentiment === "positive" ? (
                              <Target className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                            <div>
                              <h3 className="font-semibold">{point.title}</h3>
                              <p className="text-sm text-muted-foreground">{point.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financials">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Performance</CardTitle>
                  <CardDescription>Revenue growth and margin analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-4">Revenue Growth</h3>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stockData.financials.revenue}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-4">Margin Analysis</h3>
                      <div className="space-y-4">
                        {Object.entries(stockData.financials.margins).map(([key, value]) => (
                          <div key={key}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium capitalize">{key} Margin</span>
                              <span className="text-sm font-medium">{value}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risks">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Analysis</CardTitle>
                  <CardDescription>Key risk factors and metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <BarChart2 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                          <div className="text-2xl font-bold">{stockData.beta}</div>
                          <div className="text-sm text-muted-foreground">Beta</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <div className="text-2xl font-bold">{stockData.peRatio}</div>
                          <div className="text-sm text-muted-foreground">P/E Ratio</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Shield className="h-8 w-8 mx-auto mb-2 text-red-500" />
                          <div className="text-2xl font-bold">{stockData.marketCap}</div>
                          <div className="text-sm text-muted-foreground">Market Cap</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">Risk Factors</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                        <span>Market volatility and economic uncertainties</span>
                      </li>
                      <li className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                        <span>Regulatory changes and compliance risks</span>
                      </li>
                      <li className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                        <span>Competitive pressures in the tech industry</span>
                      </li>
                      <li className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                        <span>Supply chain disruptions and geopolitical risks</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="valuation">
              <Card>
                <CardHeader>
                  <CardTitle>Valuation Metrics</CardTitle>
                  <CardDescription>Key valuation indicators and comparisons</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <div className="text-2xl font-bold">{stockData.peRatio}</div>
                          <div className="text-sm text-muted-foreground">P/E Ratio</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <BarChart2 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                          <div className="text-2xl font-bold">2.5</div>
                          <div className="text-sm text-muted-foreground">P/B Ratio</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <div className="text-2xl font-bold">1.8%</div>
                          <div className="text-sm text-muted-foreground">Dividend Yield</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Building className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                          <div className="text-2xl font-bold">{stockData.marketCap}</div>
                          <div className="text-sm text-muted-foreground">Market Cap</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-semibold mb-4">Industry Comparison</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: "P/E Ratio", company: stockData.peRatio, industry: 22.5 },
                            { name: "P/B Ratio", company: 2.5, industry: 3.2 },
                            { name: "Dividend Yield", company: 1.8, industry: 2.1 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="company" fill="#8884d8" name={stockData.symbol} />
                          <Bar dataKey="industry" fill="#82ca9d" name="Industry Average" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Company Overview</CardTitle>
              <CardDescription>Key information about {stockData.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">About {stockData.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {stockData.name} is a leading technology company that designs, develops, and sells consumer
                    electronics, computer software, and online services. Known for its innovative products including the
                    iPhone, iPad, Mac, and Apple Watch, the company has a strong focus on user experience and ecosystem
                    integration.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Key Statistics</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex justify-between">
                      <span>Founded:</span>
                      <span className="font-medium">1976</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Headquarters:</span>
                      <span className="font-medium">Cupertino, California</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Employees:</span>
                      <span className="font-medium">~147,000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>CEO:</span>
                      <span className="font-medium">Tim Cook</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Industry:</span>
                      <span className="font-medium">Consumer Electronics, Software</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Global Presence</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { region: "Americas", revenue: 51.5 },
                        { region: "Europe", revenue: 25.3 },
                        { region: "Greater China", revenue: 18.8 },
                        { region: "Japan", revenue: 7.2 },
                        { region: "Rest of Asia Pacific", revenue: 6.8 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Revenue distribution by geographic region (in billions USD)
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

