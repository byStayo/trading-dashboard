"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OrderBookEntry {
  price: number
  size: number
}

interface OrderBook {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
}

const generateOrderBook = (basePrice: number): OrderBook => {
  const bids: OrderBookEntry[] = []
  const asks: OrderBookEntry[] = []

  for (let i = 0; i < 10; i++) {
    bids.push({
      price: basePrice - i * 0.01 - Math.random() * 0.005,
      size: Math.floor(Math.random() * 1000) + 100,
    })
    asks.push({
      price: basePrice + i * 0.01 + Math.random() * 0.005,
      size: Math.floor(Math.random() * 1000) + 100,
    })
  }

  return { bids, asks }
}

export function OrderBookVisualization() {
  const [orderBook, setOrderBook] = useState<OrderBook>(generateOrderBook(100))
  const [basePrice, setBasePrice] = useState(100)
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USD")

  const updateOrderBook = useCallback(() => {
    const newBasePrice = basePrice + (Math.random() - 0.5) * 0.1
    setBasePrice(newBasePrice)
    setOrderBook(generateOrderBook(newBasePrice))
  }, [basePrice])

  useEffect(() => {
    const interval = setInterval(updateOrderBook, 2000) // Update every 2 seconds
    return () => clearInterval(interval)
  }, [updateOrderBook])

  const maxSize = Math.max(...orderBook.bids.map((bid) => bid.size), ...orderBook.asks.map((ask) => ask.size))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Real-time Order Book</CardTitle>
            <CardDescription>Live visualization of bids and asks</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Symbol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                <SelectItem value="ETH/USD">ETH/USD</SelectItem>
                <SelectItem value="AAPL">AAPL</SelectItem>
                <SelectItem value="GOOGL">GOOGL</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={updateOrderBook}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">Size</TableHead>
                <TableHead className="text-right">Bid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderBook.bids.map((bid, index) => (
                <TableRow key={index}>
                  <TableCell className="text-right">{bid.size}</TableCell>
                  <TableCell className="text-right text-green-500">
                    {bid.price.toFixed(2)}
                    <div className="h-1 bg-green-200" style={{ width: `${(bid.size / maxSize) * 100}%` }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ask</TableHead>
                <TableHead>Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderBook.asks.map((ask, index) => (
                <TableRow key={index}>
                  <TableCell className="text-left text-red-500">
                    {ask.price.toFixed(2)}
                    <div className="h-1 bg-red-200" style={{ width: `${(ask.size / maxSize) * 100}%` }} />
                  </TableCell>
                  <TableCell className="text-left">{ask.size}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

