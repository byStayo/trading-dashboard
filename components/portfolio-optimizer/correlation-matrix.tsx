import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CorrelationData } from "@/types/portfolio-optimizer"

interface CorrelationMatrixProps {
  data: CorrelationData
}

export function CorrelationMatrix({ data }: CorrelationMatrixProps) {
  const assets = Object.keys(data)

  const getCorrelationValue = (asset: string, correlatedAsset: string): number => {
    return data[asset]?.[correlatedAsset] || 0
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Correlation Matrix</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              {assets.map((asset) => (
                <TableHead key={asset}>{asset}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset}>
                <TableCell className="font-medium">{asset}</TableCell>
                {assets.map((correlatedAsset) => {
                  const value = getCorrelationValue(asset, correlatedAsset)
                  return (
                    <TableCell 
                      key={correlatedAsset}
                      className={value === 1 ? "font-medium" : value > 0.5 ? "text-yellow-500" : value < -0.5 ? "text-red-500" : ""}
                    >
                      {value.toFixed(2)}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

