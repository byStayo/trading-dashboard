"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getEconomicData, subscribeToAlerts } from "@/lib/api/ai-researcher"
import { MacroIndicator } from "@/components/ai-researcher/macro-indicator"
import { RiskAssessment } from "@/components/ai-researcher/risk-assessment"
import { ResearchReport } from "@/components/ai-researcher/research-report"
import { TrendAnalysis } from "@/components/ai-researcher/trend-analysis"
import { BadgeAlertIcon as AlertIcon, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { EconomicData, ResearchReport as ResearchReportType } from "@/types/ai-researcher"

export function AIResearcherDashboard() {
  const [economicData, setEconomicData] = useState<EconomicData | null>(null)
  const [alerts, setAlerts] = useState<Array<{ title: string; description: string }>>([])
  const [selectedReport, setSelectedReport] = useState<ResearchReportType | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getEconomicData()
      setEconomicData(data)
    }
    fetchData()

    const unsubscribe = subscribeToAlerts((newAlert) => {
      setAlerts((prevAlerts) => [newAlert, ...prevAlerts])
    })

    return () => unsubscribe()
  }, [])

  if (!economicData) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Researcher Dashboard</CardTitle>
          <CardDescription>Real-time macroeconomic analysis and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MacroIndicator
              title="GDP Growth"
              value={economicData.gdpGrowth}
              change={economicData.gdpGrowthChange}
              icon={economicData.gdpGrowthChange >= 0 ? TrendingUp : TrendingDown}
            />
            <MacroIndicator
              title="Inflation (CPI)"
              value={economicData.inflation}
              change={economicData.inflationChange}
              icon={economicData.inflationChange <= 0 ? TrendingDown : TrendingUp}
            />
            <MacroIndicator
              title="Interest Rate"
              value={economicData.interestRate}
              change={economicData.interestRateChange}
              icon={AlertTriangle}
            />
            <MacroIndicator
              title="Unemployment Rate"
              value={economicData.unemploymentRate}
              change={economicData.unemploymentRateChange}
              icon={economicData.unemploymentRateChange <= 0 ? TrendingDown : TrendingUp}
            />
          </div>

          <Tabs defaultValue="riskAssessment">
            <TabsList>
              <TabsTrigger value="riskAssessment">Risk Assessment</TabsTrigger>
              <TabsTrigger value="economicCycle">Economic Cycle</TabsTrigger>
              <TabsTrigger value="geopoliticalRisk">Geopolitical Risk</TabsTrigger>
            </TabsList>
            <TabsContent value="riskAssessment">
              <RiskAssessment data={economicData.riskAssessment} />
            </TabsContent>
            <TabsContent value="economicCycle">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={economicData.economicCycle}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="geopoliticalRisk">
              <TrendAnalysis data={economicData.geopoliticalRisk} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Research Reports</CardTitle>
          <CardDescription>Latest insights for institutional investors and hedge funds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {economicData.researchReports.map((report) => (
              <Button
                key={report.id}
                variant="outline"
                className="h-auto text-left flex flex-col items-start p-4"
                onClick={() => setSelectedReport(report)}
              >
                <h3 className="font-semibold mb-2">{report.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{report.summary}</p>
                <Badge>{report.category}</Badge>
              </Button>
            ))}
          </div>
          {selectedReport && <ResearchReport report={selectedReport} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Alerts</CardTitle>
          <CardDescription>Real-time notifications on significant economic events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <Alert key={index}>
                <AlertIcon className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

