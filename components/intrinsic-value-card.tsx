"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface IntrinsicValueData {
  symbol: string
  intrinsicValue: number
  currentPrice: number
  dcfValue?: number
  relativeValue?: number
  overvaluation: number
}

interface IntrinsicValueCardProps {
  data: IntrinsicValueData
  expanded?: boolean
}

export function IntrinsicValueCard({ data, expanded = false }: IntrinsicValueCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{data.symbol} Intrinsic Value</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold text-primary">
              {formatCurrency(data.intrinsicValue).replace("$", "")}
            </span>
            <span className="text-xl text-muted-foreground">USD</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Intrinsic Value</span>
              <Badge variant="destructive" className="bg-red-500/10 text-red-500">
                OVERVALUATION {data.overvaluation}%
              </Badge>
            </div>
            <Progress value={70} className="h-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Price</span>
              <span className="text-sm text-muted-foreground">{formatCurrency(data.currentPrice)}</span>
            </div>
          </div>

          {expanded && data.dcfValue && data.relativeValue && (
            <div className="mt-6 space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground mb-1">DCF Value</div>
                      <div className="text-2xl font-bold text-blue-500">{formatCurrency(data.dcfValue)}</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground mb-1">Relative Value</div>
                      <div className="text-2xl font-bold text-teal-500">{formatCurrency(data.relativeValue)}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <Info className="h-4 w-4 mr-1" />
                      How is this calculated?
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p>
                      Intrinsic value is calculated using both DCF (Discounted Cash Flow) and Relative valuation
                      methods. The final value is a weighted average of these two approaches.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

