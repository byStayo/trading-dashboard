"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { optimizeStrategy } from "@/lib/api/backtesting"

export function StrategyOptimizer({ strategy, initialParameters, onOptimized }) {
  const [parameters, setParameters] = useState(initialParameters)
  const [isOptimizing, setIsOptimizing] = useState(false)

  useEffect(() => {
    setParameters(initialParameters)
  }, [initialParameters])

  const handleOptimize = async () => {
    setIsOptimizing(true)
    try {
      const optimizedParams = await optimizeStrategy(strategy, parameters)
      setParameters(optimizedParams)
      onOptimized(optimizedParams)
    } catch (error) {
      console.error("Error optimizing strategy:", error)
      // TODO: Add error handling UI
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Strategy Optimizer</h2>
      {Object.entries(parameters).map(([key, value]) => (
        <div key={key} className="flex items-center space-x-2">
          <label htmlFor={key} className="w-1/3">
            {key}:
          </label>
          <Input
            id={key}
            type="number"
            value={value}
            onChange={(e) => setParameters({ ...parameters, [key]: Number.parseFloat(e.target.value) })}
            className="w-2/3"
          />
        </div>
      ))}
      <Button onClick={handleOptimize} disabled={isOptimizing}>
        {isOptimizing ? "Optimizing..." : "Optimize Strategy"}
      </Button>
    </div>
  )
}

