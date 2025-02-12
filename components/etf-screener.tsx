"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const mockETFs = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", expense: 0.09, aum: "374B", yield: 1.52 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", expense: 0.2, aum: "160B", yield: 0.67 },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", expense: 0.03, aum: "270B", yield: 1.48 },
]

export function ETFScreener() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("symbol")

  const filteredETFs = mockETFs
    .filter((etf) => etf.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1))

  return (
    <Card>
      <CardHeader>
        <CardTitle>ETF Screener</CardTitle>
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
              <SelectItem value="expense">Expense Ratio</SelectItem>
              <SelectItem value="aum">AUM</SelectItem>
              <SelectItem value="yield">Yield</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Expense Ratio</TableHead>
              <TableHead>AUM</TableHead>
              <TableHead>Yield</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredETFs.map((etf) => (
              <TableRow key={etf.symbol}>
                <TableCell>{etf.symbol}</TableCell>
                <TableCell>{etf.name}</TableCell>
                <TableCell>{etf.expense.toFixed(2)}%</TableCell>
                <TableCell>{etf.aum}</TableCell>
                <TableCell>{etf.yield.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

