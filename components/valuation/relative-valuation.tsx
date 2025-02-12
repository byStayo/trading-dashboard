"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Info } from "lucide-react"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CompanyMetrics {
  symbol: string
  name: string
  peRatio: number
  evEbitda: number
  priceToBook: number
  priceToSales: number
  dividendYield: number
  marketCap: number
}

const mockPeers: CompanyMetrics[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    peRatio: 28.5,
    evEbitda: 21.3,
    priceToBook: 35.9,
    priceToSales: 7.8,
    dividendYield: 0.5,
    marketCap: 2900,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    peRatio: 32.1,
    evEbitda: 24.5,
    priceToBook: 15.7,
    priceToSales: 12.4,
    dividendYield: 0.8,
    marketCap: 2800,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    peRatio: 25.4,
    evEbitda: 15.8,
    priceToBook: 6.2,
    priceToSales: 5.9,
    dividendYield: 0,
    marketCap: 1900,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    peRatio: 60.3,
    evEbitda: 22.7,
    priceToBook: 8.4,
    priceToSales: 2.7,
    dividendYield: 0,
    marketCap: 1750,
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    peRatio: 34.2,
    evEbitda: 13.6,
    priceToBook: 6.8,
    priceToSales: 6.5,
    dividendYield: 0,
    marketCap: 1000,
  },
]

export function RelativeValuation() {
  const [selectedMetric, setSelectedMetric] = useState("peRatio")
  const [selectedCompany, setSelectedCompany] = useState("AAPL")

  const getMetricName = (metric: string) => {
    switch (metric) {
      case "peRatio":
        return "P/E Ratio"
      case "evEbitda":
        return "EV/EBITDA"
      case "priceToBook":
        return "Price/Book"
      case "priceToSales":
        return "Price/Sales"
      case "dividendYield":
        return "Dividend Yield"
      default:
        return metric
    }
  }

  const getMetricValue = (company: CompanyMetrics, metric: string) => {
    return company[metric as keyof CompanyMetrics]
  }

  const getComparisonData = () => {
    return mockPeers.map((company) => ({
      name: company.symbol,
      value: getMetricValue(company, selectedMetric),
    }))
  }

  const getPercentileDifference = (company: CompanyMetrics) => {
    const values = mockPeers.map((peer) => getMetricValue(peer, selectedMetric))
    const avg = values.reduce((a, b) => a + b) / values.length
    const diff = ((getMetricValue(company, selectedMetric) - avg) / avg) * 100
    return diff
  }

  const getMetricTooltip = (metric: string) => {
    switch (metric) {
      case "peRatio":
        return "Price-to-Earnings Ratio: Measures the company's current share price relative to its earnings per share."
      case "evEbitda":
        return "Enterprise Value to EBITDA: Compares the value of a company, debt included, to the company's cash earnings less non-cash expenses."
      case "priceToBook":
        return "Price-to-Book Ratio: Compares a company's market value to its book value."
      case "priceToSales":
        return "Price-to-Sales Ratio: Compares a company's stock price to its revenues."
      case "dividendYield":
        return "Dividend Yield: Shows how much a company pays out in dividends each year relative to its stock price."
      default:
        return ""
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Relative Valuation</CardTitle>
            <CardDescription>Compare valuation metrics across peers</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {mockPeers.map((company) => (
                  <SelectItem key={company.symbol} value={company.symbol}>
                    {company.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="peRatio">P/E Ratio</SelectItem>
                <SelectItem value="evEbitda">EV/EBITDA</SelectItem>
                <SelectItem value="priceToBook">Price/Book</SelectItem>
                <SelectItem value="priceToSales">Price/Sales</SelectItem>
                <SelectItem value="dividendYield">Dividend Yield</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getComparisonData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead className="text-right">Market Cap ($B)</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end">
                  {getMetricName(selectedMetric)}
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{getMetricTooltip(selectedMetric)}</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead className="text-right">vs. Peers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPeers.map((company) => (
              <TableRow key={company.symbol}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell className="text-right">{company.marketCap.toFixed(1)}</TableCell>
                <TableCell className="text-right">{getMetricValue(company, selectedMetric).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={getPercentileDifference(company) > 0 ? "destructive" : "success"}>
                    {getPercentileDifference(company) > 0 ? "+" : ""}
                    {getPercentileDifference(company).toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

