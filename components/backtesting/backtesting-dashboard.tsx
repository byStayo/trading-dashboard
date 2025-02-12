"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BacktestResults } from "./backtest-results"
import { StrategyOptimizer } from "./strategy-optimizer"
import { AssetSelector } from "./asset-selector"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { runBacktest } from "@/lib/api/backtesting"

export function BacktestingDashboard() {
  const [selectedAssets, setSelectedAssets] = useState([])
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [strategy, setStrategy] = useState("")
  const [parameters, setParameters] = useState({})
  const [results, setResults] = useState(null)

  const handleRunBacktest = async () => {
    try {
      const backtestResults = await runBacktest(selectedAssets, dateRange, strategy, parameters)
      setResults(backtestResults)
    } catch (error) {
      console.error("Error running backtest:", error)
      // TODO: Add error handling UI
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Trading Strategy Backtesting</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <AssetSelector selectedAssets={selectedAssets} setSelectedAssets={setSelectedAssets} />
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      <div className="mb-4">
        <Select
          value={strategy}
          onValueChange={setStrategy}
          options={[
            { value: "moving_average_crossover", label: "Moving Average Crossover" },
            { value: "rsi_overbought_oversold", label: "RSI Overbought/Oversold" },
            { value: "breakout", label: "Breakout" },
            { value: "mean_reversion", label: "Mean Reversion" },
          ]}
          placeholder="Select a strategy"
        />
      </div>
      <Button onClick={handleRunBacktest}>Run Backtest</Button>

      {results && (
        <Tabs defaultValue="results" className="mt-4">
          <TabsList>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="optimizer">Strategy Optimizer</TabsTrigger>
          </TabsList>
          <TabsContent value="results">
            <BacktestResults results={results} />
          </TabsContent>
          <TabsContent value="optimizer">
            <StrategyOptimizer strategy={strategy} initialParameters={parameters} onOptimized={setParameters} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

