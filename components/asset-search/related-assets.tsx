import { ScrollArea } from "@/components/ui/scroll-area"
import { AssetCard } from "./asset-card"

interface RelatedAssetsProps {
  assets: Array<{
    id: string
    name: string
    symbol: string
    assetClass: string
    price: number
    change: number
    score: number
  }>
  onSelect: (asset: any) => void
}

export function RelatedAssets({ assets, onSelect }: RelatedAssetsProps) {
  return (
    <ScrollArea className="h-[400px]">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} onSelect={() => onSelect(asset)} />
      ))}
    </ScrollArea>
  )
}

