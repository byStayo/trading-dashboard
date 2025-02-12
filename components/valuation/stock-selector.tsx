"use client"

import { useState } from "react"
import { Search, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface StockResult {
  symbol: string
  name: string
  price: number
  change: number
  marketCap: string
  sector: string
}

const popularStocks: StockResult[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 185.92,
    change: 1.25,
    marketCap: "3.02T",
    sector: "Technology",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 420.55,
    change: 2.15,
    marketCap: "2.95T",
    sector: "Technology",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.65,
    change: -0.45,
    marketCap: "1.85T",
    sector: "Technology",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 172.35,
    change: 1.75,
    marketCap: "1.78T",
    sector: "Consumer Cyclical",
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    price: 485.12,
    change: 3.25,
    marketCap: "1.25T",
    sector: "Technology",
  },
]

interface StockSelectorProps {
  onSelectStock: (symbol: string) => void
}

export function StockSelector({ onSelectStock }: StockSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<StockResult[]>([])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim() === "") {
      setSearchResults([])
      return
    }

    const results = popularStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase()),
    )
    setSearchResults(results)
  }

  const displayStocks = searchQuery ? searchResults : popularStocks

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by company name or symbol..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Popular Stocks
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead>Market Cap</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayStocks.map((stock) => (
              <TableRow key={stock.symbol}>
                <TableCell className="font-medium">{stock.symbol}</TableCell>
                <TableCell>{stock.name}</TableCell>
                <TableCell className="text-right">${stock.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={stock.change >= 0 ? "success" : "destructive"}>
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change}%
                  </Badge>
                </TableCell>
                <TableCell>${stock.marketCap}</TableCell>
                <TableCell>{stock.sector}</TableCell>
                <TableCell className="text-right">
                  <Button variant="secondary" size="sm" onClick={() => onSelectStock(stock.symbol)}>
                    Analyze
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

