"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IntrinsicValueCard } from "@/components/intrinsic-value-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface StockValuation {
  symbol: string
  intrinsicValue: number
  currentPrice: number
  dcfValue: number
  relativeValue: number
  overvaluation: number
}

const mockValuations: StockValuation[] = [
  {
    symbol: "AAPL",
    intrinsicValue: 164.29,
    currentPrice: 213.58,
    dcfValue: 126.91,
    relativeValue: 201.66,
    overvaluation: 30,
  },
  {
    symbol: "GOOGL",
    intrinsicValue: 163.94,
    currentPrice: 186.89,
    dcfValue: 145.32,
    relativeValue: 182.56,
    overvaluation: 14,
  },
  {
    symbol: "MSFT",
    intrinsicValue: 333.54,
    currentPrice: 400.25,
    dcfValue: 312.45,
    relativeValue: 354.63,
    overvaluation: 20,
  },
]

export function IntrinsicValueDashboard() {
  const [valuations, setValuations] = useState<StockValuation[]>(mockValuations)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("overvaluation")

  const filteredAndSortedValuations = valuations
    .filter((val) => val.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "overvaluation":
          return b.overvaluation - a.overvaluation
        case "value":
          return b.intrinsicValue - a.intrinsicValue
        case "symbol":
          return a.symbol.localeCompare(b.symbol)
        default:
          return 0
      }
    })

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Intrinsic Value Analysis</CardTitle>
            <CardDescription>Compare stock prices to their intrinsic values</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[150px]"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overvaluation">Overvaluation</SelectItem>
                <SelectItem value="value">Intrinsic Value</SelectItem>
                <SelectItem value="symbol">Symbol</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedValuations.map((valuation) => (
            <IntrinsicValueCard
              key={valuation.symbol}
              data={valuation}
              expanded={filteredAndSortedValuations.length === 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

