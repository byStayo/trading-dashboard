"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const mockCryptos = [
  { symbol: "BTC", name: "Bitcoin", price: 45000, marketCap: "850B", volume24h: "30B" },
  { symbol: "ETH", name: "Ethereum", price: 3000, marketCap: "350B", volume24h: "20B" },
  { symbol: "ADA", name: "Cardano", price: 2.1, marketCap: "70B", volume24h: "5B" },
]

export function CryptoScreener() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("symbol")

  const filteredCryptos = mockCryptos
    .filter((crypto) => crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crypto Screener</CardTitle>
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
              <SelectItem value="marketCap">Market Cap</SelectItem>
              <SelectItem value="volume24h">24h Volume</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Market Cap</TableHead>
              <TableHead>24h Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCryptos.map((crypto) => (
              <TableRow key={crypto.symbol}>
                <TableCell>{crypto.symbol}</TableCell>
                <TableCell>{crypto.name}</TableCell>
                <TableCell>${crypto.price.toFixed(2)}</TableCell>
                <TableCell>{crypto.marketCap}</TableCell>
                <TableCell>{crypto.volume24h}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

