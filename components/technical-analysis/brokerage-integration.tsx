"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { executeOrder } from "@/lib/api/brokerage"

type BrokerageIntegrationProps = {}

export function BrokerageIntegration({}: BrokerageIntegrationProps) {
  const [orderType, setOrderType] = useState("market")
  const [quantity, setQuantity] = useState("")
  const [limitPrice, setLimitPrice] = useState("")
  const [symbol, setSymbol] = useState("")

  const handleExecuteOrder = async () => {
    try {
      const success = await executeOrder({
        type: orderType as "market" | "limit",
        quantity: Number.parseInt(quantity),
        limitPrice: orderType === "limit" ? Number.parseFloat(limitPrice) : undefined,
        symbol: symbol,
      })
      if (success) {
        // Order executed successfully, you can add additional logic here if needed
      }
    } catch (error) {
      console.error("Error executing order:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execute Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Symbol (e.g., AAPL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <Select value={orderType} onValueChange={setOrderType}>
            <SelectTrigger>
              <SelectValue placeholder="Order Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market">Market Order</SelectItem>
              <SelectItem value="limit">Limit Order</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          {orderType === "limit" && (
            <Input
              type="number"
              placeholder="Limit Price"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
            />
          )}
          <Button onClick={handleExecuteOrder}>Execute Order</Button>
        </div>
      </CardContent>
    </Card>
  )
}

