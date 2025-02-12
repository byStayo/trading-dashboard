"use client"

import { useState, useEffect } from "react"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface MarketData {
  symbol: string
  price: number
  change: number
}

export function LiveTickerBar() {
  const [data, setData] = useState<MarketData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // In a real application, you would fetch this data from an API
      // For now, we'll use mock data
      const mockData: MarketData[] = [
        { symbol: "AAPL", price: 150.25, change: 2.5 },
        { symbol: "GOOGL", price: 2750.8, change: -15.2 },
        { symbol: "MSFT", price: 305.15, change: 1.8 },
        { symbol: "AMZN", price: 3380.5, change: -22.3 },
        { symbol: "FB", price: 325.75, change: 5.2 },
      ]
      setData(mockData)
      setIsLoading(false)
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex space-x-4 h-8 bg-muted/30 items-center px-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-8 bg-muted/30">
      <div className="ticker">
        <div className="ticker-track">
          {[...data, ...data, ...data].map((item, index) => (
            <span key={index} className="ticker-item mx-4 inline-flex items-center text-sm">
              <span className="font-medium">{item.symbol}</span>
              <span className="ml-2">${item.price.toFixed(2)}</span>
              <span 
                className={`ml-2 inline-flex items-center ${
                  item.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.change >= 0 ? "+" : ""}
                {item.change.toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

