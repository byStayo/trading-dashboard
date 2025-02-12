"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const transactions = [
  { id: 1, date: "2023-06-01", type: "Buy", symbol: "AAPL", quantity: 10, price: 180.95 },
  { id: 2, date: "2023-06-02", type: "Sell", symbol: "GOOGL", quantity: 5, price: 124.67 },
  { id: 3, date: "2023-06-03", type: "Buy", symbol: "MSFT", quantity: 15, price: 335.4 },
  { id: 4, date: "2023-06-04", type: "Buy", symbol: "AMZN", quantity: 8, price: 124.25 },
  { id: 5, date: "2023-06-05", type: "Sell", symbol: "TSLA", quantity: 12, price: 213.97 },
]

export function PortfolioTransactions() {
  const [filter, setFilter] = useState("all")

  const filteredTransactions =
    filter === "all" ? transactions : transactions.filter((t) => t.type.toLowerCase() === filter)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest portfolio activities</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>{transaction.symbol}</TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell>${transaction.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

