"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Info } from "lucide-react"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SimulationResult {
  value: number
  frequency: number
  percentile: number
}

export function MonteCarloSimulation() {
  const [baseValue, setBaseValue] = useState(100)
  const [volatility, setVolatility] = useState(20)
  const [simulations, setSimulations] = useState<SimulationResult[]>([])
  const [confidenceInterval, setConfidenceInterval] = useState<{
    lower: number
    upper: number
  }>({ lower: 0, upper: 0 })

  useEffect(() => {
    runSimulation()
  }, []) // Only run simulation when the component mounts or when the dependency array changes.  In this case, no dependencies are needed.

  const runSimulation = () => {
    const numSimulations = 10000
    const results: number[] = []

    for (let i = 0; i < numSimulations; i++) {
      // Box-Muller transform to generate normally distributed random numbers
      const u1 = Math.random()
      const u2 = Math.random()
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)

      // Calculate simulated value using geometric Brownian motion
      const simulatedValue = baseValue * Math.exp((volatility / 100) * z)
      results.push(simulatedValue)
    }

    // Sort results for percentile calculations
    results.sort((a, b) => a - b)

    // Create histogram
    const min = Math.min(...results)
    const max = Math.max(...results)
    const bins = 50
    const binWidth = (max - min) / bins
    const histogram: SimulationResult[] = []

    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binWidth
      const binEnd = binStart + binWidth
      const count = results.filter((v) => v >= binStart && v < binEnd).length
      histogram.push({
        value: (binStart + binEnd) / 2,
        frequency: count,
        percentile: ((i + 0.5) / bins) * 100,
      })
    }

    setSimulations(histogram)
    setConfidenceInterval({
      lower: results[Math.floor(numSimulations * 0.05)],
      upper: results[Math.floor(numSimulations * 0.95)],
    })
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Monte Carlo Simulation</CardTitle>
        <CardDescription>Simulate possible valuation outcomes using probability distribution</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Value</label>
              <Input
                type="number"
                value={baseValue}
                onChange={(e) => setBaseValue(Number(e.target.value))}
                className="w-full"
              />
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The current or expected value of the asset</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Volatility (%): {volatility}</label>
              <Slider
                value={[volatility]}
                onValueChange={(value) => setVolatility(value[0])}
                min={5}
                max={50}
                step={1}
              />
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The expected annual volatility of the asset's returns</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="space-y-4">
            {confidenceInterval.upper > 0 && (
              <>
                <div className="text-center">
                  <div className="text-sm font-medium text-muted-foreground">90% Confidence Interval</div>
                  <div className="text-lg font-bold">
                    ${confidenceInterval.lower.toFixed(2)} - ${confidenceInterval.upper.toFixed(2)}
                  </div>
                </div>

                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simulations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="value"
                        tickFormatter={(value) => value.toFixed(0)}
                        label={{ value: "Simulated Value", position: "insideBottom", offset: -5 }}
                      />
                      <YAxis label={{ value: "Frequency", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        formatter={(value: number, name: string) =>
                          name === "frequency" ? [value, "Frequency"] : [value.toFixed(2), name]
                        }
                      />
                      <Area type="monotone" dataKey="frequency" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            This simulation uses Monte Carlo methods to estimate the range of possible valuation outcomes. The chart
            shows the distribution of simulated values, with the 90% confidence interval indicating the range where the
            true value is likely to fall.
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>The x-axis represents the simulated asset values</li>
            <li>The y-axis shows the frequency of each simulated value</li>
            <li>The confidence interval provides a range for the likely asset value</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

