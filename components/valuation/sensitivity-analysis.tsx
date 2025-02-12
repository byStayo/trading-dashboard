"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SensitivityMatrix {
  growthRates: number[]
  discountRates: number[]
  values: number[][]
}

export function SensitivityAnalysis() {
  const [baseValue, setBaseValue] = useState(100)
  const [growthRateRange, setGrowthRateRange] = useState([-2, 2])
  const [discountRateRange, setDiscountRateRange] = useState([-2, 2])
  const [matrix, setMatrix] = useState<SensitivityMatrix>({
    growthRates: [],
    discountRates: [],
    values: [],
  })

  useEffect(() => {
    calculateMatrix()
  }, [baseValue, growthRateRange, discountRateRange]) //This line was already correct

  const calculateMatrix = () => {
    const growthRates = Array.from({ length: 5 }, (_, i) => i + growthRateRange[0]).map((x) => x + 3) // Center around 3%
    const discountRates = Array.from({ length: 5 }, (_, i) => i + discountRateRange[0]).map((x) => x + 10) // Center around 10%
    const values: number[][] = []

    for (let i = 0; i < growthRates.length; i++) {
      values[i] = []
      for (let j = 0; j < discountRates.length; j++) {
        const growth = growthRates[i] / 100
        const discount = discountRates[j] / 100
        // Simple perpetuity formula with growth
        const value = (baseValue * (1 + growth)) / (discount - growth)
        values[i][j] = value
      }
    }

    setMatrix({ growthRates, discountRates, values })
  }

  const getValueColor = (value: number) => {
    const baseCase = matrix.values[2][2] // Center value
    const percentDiff = ((value - baseCase) / baseCase) * 100

    if (percentDiff > 20) return "bg-green-500/10 text-green-500"
    if (percentDiff > 10) return "bg-green-400/10 text-green-400"
    if (percentDiff < -20) return "bg-red-500/10 text-red-500"
    if (percentDiff < -10) return "bg-red-400/10 text-red-400"
    return "bg-yellow-500/10 text-yellow-500"
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Sensitivity Analysis</CardTitle>
        <CardDescription>Analyze how growth and discount rates affect valuation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Base FCF Value</label>
              <Input
                type="number"
                value={baseValue}
                onChange={(e) => setBaseValue(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Growth Rate Range</label>
              <Slider
                value={growthRateRange}
                onValueChange={setGrowthRateRange}
                min={-5}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{growthRateRange[0]}%</span>
                <span>{growthRateRange[1]}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Discount Rate Range</label>
              <Slider
                value={discountRateRange}
                onValueChange={setDiscountRateRange}
                min={-5}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{discountRateRange[0]}%</span>
                <span>{discountRateRange[1]}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-5 w-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    This matrix shows how the valuation changes with different combinations of growth and discount
                    rates. The center value represents the base case scenario.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {matrix.values.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Growth Rate ↓ Discount Rate →</TableHead>
                  {matrix.discountRates.map((rate) => (
                    <TableHead key={rate} className="text-center">
                      {rate}%
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrix.growthRates.map((growth, i) => (
                  <TableRow key={growth}>
                    <TableCell className="font-medium text-center">{growth}%</TableCell>
                    {matrix.values[i].map((value, j) => (
                      <TableCell key={j} className="text-center">
                        <Badge variant="outline" className={getValueColor(value)}>
                          {value.toFixed(1)}
                        </Badge>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>
            This matrix shows how the valuation changes with different combinations of growth and discount rates. The
            center value represents the base case scenario.
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Green values indicate potential upside scenarios</li>
            <li>Red values indicate potential downside scenarios</li>
            <li>Yellow values are close to the base case</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

