"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StrategyOptimizer } from "./strategy-optimizer"
import { AssetSelector } from "./asset-selector"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { runBacktest } from "@/lib/api/backtesting"
import { DateRange } from "react-day-picker"
import { Strategy } from "@/types/backtesting"

export function BacktestingDashboard() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>("momentum")
  const [backtestResults, setBacktestResults] = useState<BacktestResults | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(new Date().setMonth(new Date().getMonth() + 1))
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range)
    }
  }

  const handleStrategyChange = (value: string) => {
    setSelectedStrategy(value as Strategy)
  }

  const handleRunBacktest = async () => {
    if (!dateRange.from || !dateRange.to || selectedAssets.length === 0) return

    setIsLoading(true)
    try {
      const results = await runBacktest({
        assets: selectedAssets,
        strategy: selectedStrategy,
        startDate: dateRange.from,
        endDate: dateRange.to,
      })
      setBacktestResults(results)
    } catch (error) {
      console.error("Error running backtest:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Backtest Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <AssetSelector selectedAssets={selectedAssets} setSelectedAssets={setSelectedAssets} />
            <DatePickerWithRange date={dateRange} onSelect={handleDateRangeChange} />
          </div>
          <div className="mb-4">
            <Select value={selectedStrategy} onValueChange={handleStrategyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="momentum">Momentum</SelectItem>
                <SelectItem value="meanReversion">Mean Reversion</SelectItem>
                <SelectItem value="trendFollowing">Trend Following</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleRunBacktest} disabled={isLoading}>
            {isLoading ? "Running..." : "Run Backtest"}
          </Button>
        </CardContent>
      </Card>

      {backtestResults && (
        <Card>
          <CardHeader>
            <CardTitle>Backtest Results</CardTitle>
          </CardHeader>
          <CardContent>
            <StrategyOptimizer results={backtestResults} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

