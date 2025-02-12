"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const mockStocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 150.25, peRatio: 28.5, marketCap: "2.5T" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 2750.8, peRatio: 25.4, marketCap: "1.9T" },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 305.5, peRatio: 32.1, marketCap: "2.3T" },
]

export function StockScreener() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("symbol")

  const filteredStocks = mockStocks
    .filter((stock) => stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Screener</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="Search by symbol"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="symbol">Symbol</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="peRatio">P/E Ratio</SelectItem>
              <SelectItem value="marketCap">Market Cap</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>P/E Ratio</TableHead>
              <TableHead>Market Cap</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.map((stock) => (
              <TableRow key={stock.symbol}>
                <TableCell>{stock.symbol}</TableCell>
                <TableCell>{stock.name}</TableCell>
                <TableCell>${stock.price.toFixed(2)}</TableCell>
                <TableCell>{stock.peRatio.toFixed(2)}</TableCell>
                <TableCell>{stock.marketCap}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

