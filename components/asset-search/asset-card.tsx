import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface AssetCardProps {
  asset: {
    id: string
    name: string
    symbol: string
    assetClass: string
    price: number
    change: number
    score: number
  }
  onSelect: () => void
}

export function AssetCard({ asset, onSelect }: AssetCardProps) {
  return (
    <Card className="mb-2 cursor-pointer hover:bg-accent" onClick={onSelect}>
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold">{asset.name}</h3>
          <p className="text-sm text-muted-foreground">
            {asset.symbol} • {asset.assetClass}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">${asset.price.toFixed(2)}</p>
          <div className="flex items-center">
            {asset.change >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={asset.change >= 0 ? "text-green-500" : "text-red-500"}>{asset.change.toFixed(2)}%</span>
          </div>
        </div>
        <Badge variant="secondary">Score: {asset.score}</Badge>
      </CardContent>
    </Card>
  )
}

