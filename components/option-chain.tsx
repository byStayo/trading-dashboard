"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface OptionData {
  strike: number
  callBid: number
  callAsk: number
  callVolume: number
  putBid: number
  putAsk: number
  putVolume: number
}

interface StockData {
  symbol: string
  price: number
  change: number
  expirations: string[]
}

const generateMockOptionData = (strike: number): OptionData => ({
  strike,
  callBid: Number((Math.random() * 5).toFixed(2)),
  callAsk: Number((Math.random() * 5 + 0.1).toFixed(2)),
  callVolume: Math.floor(Math.random() * 1000),
  putBid: Number((Math.random() * 5).toFixed(2)),
  putAsk: Number((Math.random() * 5 + 0.1).toFixed(2)),
  putVolume: Math.floor(Math.random() * 1000),
})

const generateMockStockData = (): StockData[] => [
  {
    symbol: "AAPL",
    price: 150.25,
    change: 1.5,
    expirations: ["2023-05-19", "2023-05-26", "2023-06-02", "2023-06-09"],
  },
  {
    symbol: "GOOGL",
    price: 2250.75,
    change: -0.8,
    expirations: ["2023-05-19", "2023-05-26", "2023-06-02", "2023-06-09"],
  },
  {
    symbol: "MSFT",
    price: 305.5,
    change: 0.5,
    expirations: ["2023-05-19", "2023-05-26", "2023-06-02", "2023-06-09"],
  },
]

export function OptionChain() {
  const [stockData, setStockData] = useState<StockData[]>(generateMockStockData())
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL")
  const [selectedExpiration, setSelectedExpiration] = useState<string>("2023-05-19")
  const [optionData, setOptionData] = useState<OptionData[]>([])

  useEffect(() => {
    const selectedStock = stockData.find((stock) => stock.symbol === selectedSymbol)
    if (selectedStock) {
      const strikes = Array.from({ length: 11 }, (_, i) => selectedStock.price + (i - 5) * 5)
      setOptionData(strikes.map(generateMockOptionData))
    }
  }, [selectedSymbol, stockData])

  useEffect(() => {
    const interval = setInterval(() => {
      setStockData(generateMockStockData())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const selectedStock = stockData.find((stock) => stock.symbol === selectedSymbol)

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Option Chain</CardTitle>
            <p className="text-sm text-muted-foreground">View and analyze option data</p>
          </div>
          <div className="flex space-x-2">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select symbol" />
              </SelectTrigger>
              <SelectContent>
                {stockData.map((stock) => (
                  <SelectItem key={stock.symbol} value={stock.symbol}>
                    {stock.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedExpiration} onValueChange={setSelectedExpiration}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Expiration" />
              </SelectTrigger>
              <SelectContent>
                {selectedStock?.expirations.map((exp) => (
                  <SelectItem key={exp} value={exp}>
                    {exp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedStock && (
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">${selectedStock.price.toFixed(2)}</p>
              <Badge variant={selectedStock.change >= 0 ? "success" : "destructive"}>
                {selectedStock.change >= 0 ? "+" : ""}
                {selectedStock.change.toFixed(2)}%
              </Badge>
            </div>
            <Input
              type="text"
              placeholder="Search Strike"
              className="w-[200px]"
              onChange={(e) => {
                const value = Number.parseFloat(e.target.value)
                if (!isNaN(value)) {
                  const strikes = Array.from({ length: 11 }, (_, i) => value + (i - 5) * 5)
                  setOptionData(strikes.map(generateMockOptionData))
                }
              }}
            />
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">Call Vol</TableHead>
                <TableHead className="text-right">Call Bid</TableHead>
                <TableHead className="text-right">Call Ask</TableHead>
                <TableHead className="text-center">Strike</TableHead>
                <TableHead className="text-right">Put Bid</TableHead>
                <TableHead className="text-right">Put Ask</TableHead>
                <TableHead className="text-right">Put Vol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {optionData.map((option) => (
                <TableRow key={option.strike}>
                  <TableCell className="text-right">{option.callVolume}</TableCell>
                  <TableCell className="text-right">{option.callBid.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{option.callAsk.toFixed(2)}</TableCell>
                  <TableCell className="text-center font-bold">{option.strike.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{option.putBid.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{option.putAsk.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{option.putVolume}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

