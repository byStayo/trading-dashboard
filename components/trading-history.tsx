"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Trade {
  id: number
  date: string
  symbol: string
  type: "buy" | "sell"
  quantity: number
  price: number
}

const mockTrades: Trade[] = [
  { id: 1, date: "2023-06-05 14:30:00", symbol: "AAPL", type: "buy", quantity: 100, price: 180.5 },
  { id: 2, date: "2023-06-05 14:35:00", symbol: "GOOGL", type: "sell", quantity: 50, price: 125.75 },
  { id: 3, date: "2023-06-05 14:40:00", symbol: "MSFT", type: "buy", quantity: 75, price: 335.25 },
  { id: 4, date: "2023-06-05 14:45:00", symbol: "AMZN", type: "buy", quantity: 25, price: 124.5 },
  { id: 5, date: "2023-06-05 14:50:00", symbol: "TSLA", type: "sell", quantity: 30, price: 215.0 },
]

export function TradingHistory() {
  const [trades, setTrades] = useState<Trade[]>(mockTrades)

  useEffect(() => {
    // In a real application, you would fetch the trading history here
    // and potentially update it in real-time
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Trading History</CardTitle>
        <CardDescription>Your recent trading activities</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell>{trade.date}</TableCell>
                <TableCell>{trade.symbol}</TableCell>
                <TableCell>
                  <Badge variant={trade.type === "buy" ? "success" : "destructive"}>{trade.type.toUpperCase()}</Badge>
                </TableCell>
                <TableCell>{trade.quantity}</TableCell>
                <TableCell>${trade.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

