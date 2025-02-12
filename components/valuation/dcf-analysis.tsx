"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Info } from "lucide-react"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DCFInputs {
  revenueGrowth: number
  ebitdaMargin: number
  taxRate: number
  discountRate: number
  perpetualGrowth: number
  yearsToProject: number
}

interface CashFlow {
  year: number
  revenue: number
  ebitda: number
  freeCashFlow: number
  presentValue: number
}

export function DCFAnalysis() {
  const [inputs, setInputs] = useState<DCFInputs>({
    revenueGrowth: 10,
    ebitdaMargin: 25,
    taxRate: 21,
    discountRate: 10,
    perpetualGrowth: 3,
    yearsToProject: 5,
  })

  const [cashFlows, setCashFlows] = useState<CashFlow[]>([])
  const [enterpriseValue, setEnterpriseValue] = useState<number>(0)

  useEffect(() => {
    calculateDCF()
  }, [
    inputs.revenueGrowth,
    inputs.ebitdaMargin,
    inputs.taxRate,
    inputs.discountRate,
    inputs.perpetualGrowth,
    inputs.yearsToProject,
  ])

  const calculateDCF = () => {
    const initialRevenue = 1000 // Example starting revenue
    const flows: CashFlow[] = []
    let totalPV = 0

    for (let year = 1; year <= inputs.yearsToProject; year++) {
      const revenue = initialRevenue * Math.pow(1 + inputs.revenueGrowth / 100, year)
      const ebitda = revenue * (inputs.ebitdaMargin / 100)
      const freeCashFlow = ebitda * (1 - inputs.taxRate / 100)
      const presentValue = freeCashFlow / Math.pow(1 + inputs.discountRate / 100, year)

      totalPV += presentValue
      flows.push({ year, revenue, ebitda, freeCashFlow, presentValue })
    }

    // Terminal value calculation
    const terminalValue =
      (flows[flows.length - 1].freeCashFlow * (1 + inputs.perpetualGrowth / 100)) /
      (inputs.discountRate / 100 - inputs.perpetualGrowth / 100)
    const presentTerminalValue = terminalValue / Math.pow(1 + inputs.discountRate / 100, inputs.yearsToProject)

    setEnterpriseValue(totalPV + presentTerminalValue)
    setCashFlows(flows)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>DCF Analysis</CardTitle>
        <CardDescription>Discounted Cash Flow valuation model</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Revenue Growth (%)</label>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Expected annual revenue growth rate</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <Slider
                value={[inputs.revenueGrowth]}
                onValueChange={(value) => setInputs({ ...inputs, revenueGrowth: value[0] })}
                min={-20}
                max={50}
                step={0.5}
              />
              <div className="text-right text-sm text-muted-foreground">{inputs.revenueGrowth}%</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">EBITDA Margin (%)</label>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Expected EBITDA as percentage of revenue</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <Slider
                value={[inputs.ebitdaMargin]}
                onValueChange={(value) => setInputs({ ...inputs, ebitdaMargin: value[0] })}
                min={0}
                max={50}
                step={0.5}
              />
              <div className="text-right text-sm text-muted-foreground">{inputs.ebitdaMargin}%</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Discount Rate (%)</label>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Required rate of return (WACC)</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <Slider
                value={[inputs.discountRate]}
                onValueChange={(value) => setInputs({ ...inputs, discountRate: value[0] })}
                min={5}
                max={20}
                step={0.5}
              />
              <div className="text-right text-sm text-muted-foreground">{inputs.discountRate}%</div>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    ${enterpriseValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">Enterprise Value</div>
                </div>
              </CardContent>
            </Card>

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="presentValue" stroke="#8884d8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">EBITDA</TableHead>
              <TableHead className="text-right">Free Cash Flow</TableHead>
              <TableHead className="text-right">Present Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cashFlows.map((flow) => (
              <TableRow key={flow.year}>
                <TableCell>{flow.year}</TableCell>
                <TableCell className="text-right">
                  ${flow.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </TableCell>
                <TableCell className="text-right">
                  ${flow.ebitda.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </TableCell>
                <TableCell className="text-right">
                  ${flow.freeCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </TableCell>
                <TableCell className="text-right">
                  ${flow.presentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

