"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowUpRight, ArrowDownRight, Search, Loader2 } from "lucide-react"
import { ErrorMessage } from "@/components/error-message"

interface MarketData {
  symbol: string
  price: number
  change: number
  volume: number
  marketCap: number
}

const generateMockData = (): MarketData[] => {
  const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "FB", "TSLA", "NVDA", "JPM", "V", "JNJ"]
  return symbols.map((symbol) => ({
    symbol,
    price: Number((Math.random() * 1000 + 50).toFixed(2)),
    change: Number((Math.random() * 10 - 5).toFixed(2)),
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Number((Math.random() * 1000 + 100).toFixed(2)),
  }))
}

export function LiveMarketData() {
  const [data, setData] = useState<MarketData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
        const mockData = generateMockData()
        setData(mockData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load market data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Simulate real-time updates
    const interval = setInterval(() => {
      setData(generateMockData())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const filteredData = useMemo(
    () => data.filter((item) => item.symbol.toLowerCase().includes(searchTerm.toLowerCase())),
    [data, searchTerm],
  )

  const renderBadge = useCallback(
    (change: number) => (
      <Badge variant={change >= 0 ? "default" : "destructive"} className="flex items-center justify-center gap-1">
        {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {Math.abs(change).toFixed(2)}%
      </Badge>
    ),
    [],
  )

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Live Market Data</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Live Market Data</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <ErrorMessage message={error} onRetry={() => setIsLoading(true)} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Live Market Data</CardTitle>
            <p className="text-sm text-muted-foreground">Real-time stock prices and market information</p>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">Volume</TableHead>
                <TableHead className="text-right">Market Cap (B)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.symbol}>
                  <TableCell className="font-medium">{item.symbol}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{renderBadge(item.change)}</TableCell>
                  <TableCell className="text-right">{item.volume.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${item.marketCap.toFixed(2)}B</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

