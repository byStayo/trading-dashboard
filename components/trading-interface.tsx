"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TradingInterface() {
  const [symbol, setSymbol] = useState("")
  const [quantity, setQuantity] = useState("")
  const [orderType, setOrderType] = useState("market")
  const [price, setPrice] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle order submission logic here
    console.log("Order submitted:", { symbol, quantity, orderType, price })
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Trading Interface</CardTitle>
        <CardDescription>Place your stock orders</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="symbol">Symbol</label>
            <Input
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Enter stock symbol"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="quantity">Quantity</label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="orderType">Order Type</label>
            <Select value={orderType} onValueChange={setOrderType}>
              <SelectTrigger id="orderType">
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="limit">Limit</SelectItem>
                <SelectItem value="stop">Stop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {orderType !== "market" && (
            <div className="space-y-2">
              <label htmlFor="price">Price</label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                required
              />
            </div>
          )}
          <Button type="submit" className="w-full">
            Place Order
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

