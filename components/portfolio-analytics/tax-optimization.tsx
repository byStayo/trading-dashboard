import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

export function TaxOptimization({ data }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Optimization Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Strategy</TableHead>
                <TableHead>Potential Savings</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.opportunities.map((opportunity, index) => (
                <TableRow key={index}>
                  <TableCell>{opportunity.strategy}</TableCell>
                  <TableCell>${opportunity.potentialSavings.toLocaleString()}</TableCell>
                  <TableCell>
                    <Progress value={opportunity.impact} className="w-[60px]" />
                  </TableCell>
                  <TableCell>{opportunity.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax-Loss Harvesting</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Current Loss</TableHead>
                <TableHead>Potential Tax Benefit</TableHead>
                <TableHead>Recommended Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.taxLossHarvesting.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.asset}</TableCell>
                  <TableCell>${item.currentLoss.toLocaleString()}</TableCell>
                  <TableCell>${item.potentialTaxBenefit.toLocaleString()}</TableCell>
                  <TableCell>{item.recommendedAction}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Annual Tax Savings Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${data.annualTaxSavings.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground mt-2">
            Estimated annual tax savings based on current portfolio and optimization strategies.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

