import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AssetDetailsProps {
  details: {
    marketCap: number
    volume: number
    peRatio: number
    dividend: number
    sector: string
    industry: string
    beta: number
    eps: number
    high52Week: number
    low52Week: number
  } | null
}

export function AssetDetails({ details }: AssetDetailsProps) {
  if (!details) return <div>Loading asset details...</div>

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Market Cap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${(details.marketCap / 1e9).toFixed(2)}B</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{(details.volume / 1e6).toFixed(2)}M</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>P/E Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{details.peRatio.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Dividend Yield</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{details.dividend.toFixed(2)}%</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Beta</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{details.beta.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>EPS</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${details.eps.toFixed(2)}</p>
        </CardContent>
      </Card>
      <Card className="col-span-2 md:col-span-3">
        <CardHeader>
          <CardTitle>52 Week Range</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <Badge variant="outline">${details.low52Week.toFixed(2)}</Badge>
          <div className="h-2 flex-1 bg-secondary mx-4 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{
                width: `${((details.price - details.low52Week) / (details.high52Week - details.low52Week)) * 100}%`,
              }}
            />
          </div>
          <Badge variant="outline">${details.high52Week.toFixed(2)}</Badge>
        </CardContent>
      </Card>
      <Card className="col-span-2 md:col-span-3">
        <CardHeader>
          <CardTitle>Classification</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between">
          <Badge variant="outline">{details.sector}</Badge>
          <Badge variant="outline">{details.industry}</Badge>
        </CardContent>
      </Card>
    </div>
  )
}

