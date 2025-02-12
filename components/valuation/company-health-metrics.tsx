"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

interface HealthMetric {
  label: string
  value: boolean
}

interface CompanyHealthProps {
  profitabilityScore: number
  solvencyScore: number
  profitabilityMetrics: HealthMetric[]
  solvencyMetrics: HealthMetric[]
  companyLogo?: string
}

export function CompanyHealthMetrics({
  profitabilityScore,
  solvencyScore,
  profitabilityMetrics,
  solvencyMetrics,
  companyLogo,
}: CompanyHealthProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Profitability Score</CardTitle>
          {companyLogo && <img src={companyLogo || "/placeholder.svg"} alt="Company logo" className="h-8 w-8" />}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-7xl font-bold text-green-500">{profitabilityScore}</span>
            <span className="text-sm text-muted-foreground">
              PROFITABILITY
              <br />
              SCORE
            </span>
          </div>
          <div className="space-y-2">
            {profitabilityMetrics.map((metric, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">{metric.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Solvency Score</CardTitle>
          {companyLogo && <img src={companyLogo || "/placeholder.svg"} alt="Company logo" className="h-8 w-8" />}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-7xl font-bold text-blue-500">{solvencyScore}</span>
            <span className="text-sm text-muted-foreground">
              SOLVENCY
              <br />
              SCORE
            </span>
          </div>
          <div className="space-y-2">
            {solvencyMetrics.map((metric, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">{metric.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

