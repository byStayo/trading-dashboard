"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PriceTarget {
  date: string
  price: number
  actual?: number
}

interface RevenueEstimate {
  year: string
  actual?: number
  estimate: number
  miss?: number
}

interface AnalystEstimatesProps {
  companyName: string
  companyLogo?: string
  priceTargets: PriceTarget[]
  revenueEstimates: RevenueEstimate[]
}

export function AnalystEstimates({ companyName, companyLogo, priceTargets, revenueEstimates }: AnalystEstimatesProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl font-bold">Price Targets</CardTitle>
          {companyLogo && (
            <img src={companyLogo || "/placeholder.svg"} alt={`${companyName} logo`} className="h-8 w-8" />
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceTargets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="actual" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="price" stroke="#82ca9d" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl font-bold">Revenue Forecast</CardTitle>
          {companyLogo && (
            <img src={companyLogo || "/placeholder.svg"} alt={`${companyName} logo`} className="h-8 w-8" />
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueEstimates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="actual" fill="#8884d8" name="Actual" />
                <Bar dataKey="estimate" fill="#82ca9d" name="Estimate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {revenueEstimates
              .filter((estimate) => estimate.miss !== undefined)
              .map((estimate) => (
                <Badge key={estimate.year} variant="secondary" className="bg-red-500/10 text-red-500">
                  {estimate.year}: Miss {estimate.miss}%
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

