import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

export function EarningsManipulationDetection({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings Manipulation Detection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Overall Assessment</h3>
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  data.overallRisk === "Low" ? "success" : data.overallRisk === "Medium" ? "warning" : "destructive"
                }
              >
                {data.overallRisk} Risk
              </Badge>
              <span>{data.overallAssessment}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Risk Factors</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Factor</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.riskFactors.map((factor, index) => (
                  <TableRow key={index}>
                    <TableCell>{factor.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          factor.risk === "Low" ? "success" : factor.risk === "Medium" ? "warning" : "destructive"
                        }
                      >
                        {factor.risk}
                      </Badge>
                    </TableCell>
                    <TableCell>{factor.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data.redFlags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Red Flags</h3>
              <ul className="list-disc pl-5">
                {data.redFlags.map((flag, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <AlertTriangle className="text-red-500" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

