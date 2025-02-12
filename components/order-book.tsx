"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Order {
  price: number
  size: number
}

interface OrderBook {
  bids: Order[]
  asks: Order[]
}

const mockOrderBook: OrderBook = {
  bids: [
    { price: 100.0, size: 100 },
    { price: 99.95, size: 200 },
    { price: 99.9, size: 300 },
    { price: 99.85, size: 150 },
    { price: 99.8, size: 250 },
  ],
  asks: [
    { price: 100.05, size: 150 },
    { price: 100.1, size: 250 },
    { price: 100.15, size: 100 },
    { price: 100.2, size: 300 },
    { price: 100.25, size: 200 },
  ],
}

export function OrderBook() {
  const [orderBook, setOrderBook] = useState<OrderBook>(mockOrderBook)

  useEffect(() => {
    // In a real application, you would fetch the order book data here
    // and update it periodically
    const interval = setInterval(() => {
      // Simulate order book updates
      setOrderBook((prevOrderBook) => ({
        bids: prevOrderBook.bids.map((bid) => ({ ...bid, size: bid.size + Math.floor(Math.random() * 10) - 5 })),
        asks: prevOrderBook.asks.map((ask) => ({ ...ask, size: ask.size + Math.floor(Math.random() * 10) - 5 })),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Order Book</CardTitle>
        <CardDescription>Real-time market depth</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Bids</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Price</TableHead>
                  <TableHead>Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderBook.bids.map((bid, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-green-500">{bid.price.toFixed(2)}</TableCell>
                    <TableCell>{bid.size}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Asks</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Price</TableHead>
                  <TableHead>Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderBook.asks.map((ask, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-red-500">{ask.price.toFixed(2)}</TableCell>
                    <TableCell>{ask.size}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

