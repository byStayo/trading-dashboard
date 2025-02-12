"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface WatchlistItem {
  symbol: string
  price: number
  change: number
  changePercent: number
}

const mockWatchlistData: WatchlistItem[] = [
  { symbol: "AAPL", price: 150.25, change: 2.5, changePercent: 1.69 },
  { symbol: "GOOGL", price: 2750.8, change: -15.2, changePercent: -0.55 },
  { symbol: "MSFT", price: 305.15, change: 1.8, changePercent: 0.59 },
  { symbol: "AMZN", price: 3380.5, change: -22.3, changePercent: -0.66 },
  { symbol: "FB", price: 325.75, change: 5.2, changePercent: 1.62 },
]

export function WatchlistTable({ searchTerm }: { searchTerm: string }) {
  const [watchlistData, setWatchlistData] = useState<WatchlistItem[]>(mockWatchlistData)

  useEffect(() => {
    // In a real application, you would fetch the watchlist data here
    // and update it periodically
  }, [])

  const filteredData = watchlistData.filter((item) => item.symbol.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Change</TableHead>
          <TableHead>Change %</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((item) => (
          <TableRow key={item.symbol}>
            <TableCell className="font-medium">{item.symbol}</TableCell>
            <TableCell>${item.price.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant={item.change >= 0 ? "success" : "destructive"} className="flex items-center space-x-1">
                {item.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span>${Math.abs(item.change).toFixed(2)}</span>
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={item.changePercent >= 0 ? "success" : "destructive"}
                className="flex items-center space-x-1"
              >
                {item.changePercent >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span>{Math.abs(item.changePercent).toFixed(2)}%</span>
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

