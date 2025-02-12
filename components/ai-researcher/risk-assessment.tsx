import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface RiskAssessmentProps {
  data: {
    recessionRisk: number
    marketVolatility: number
    creditRisk: number
    liquidityRisk: number
  }
}

export function RiskAssessment({ data }: RiskAssessmentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Recession Risk</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={data.recessionRisk} className="w-full" />
          <p className="mt-2 text-sm text-muted-foreground">{data.recessionRisk}% probability</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Market Volatility</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={data.marketVolatility} className="w-full" />
          <p className="mt-2 text-sm text-muted-foreground">{data.marketVolatility}% above average</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Credit Risk</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={data.creditRisk} className="w-full" />
          <p className="mt-2 text-sm text-muted-foreground">{data.creditRisk}% risk level</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Liquidity Risk</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={data.liquidityRisk} className="w-full" />
          <p className="mt-2 text-sm text-muted-foreground">{data.liquidityRisk}% risk level</p>
        </CardContent>
      </Card>
    </div>
  )
}

