"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { searchAssets } from "@/lib/api/asset-search"

interface Asset {
  symbol: string
  name: string
}

interface AssetSelectorProps {
  selectedAssets: Asset[]
  setSelectedAssets: (assets: Asset[]) => void
}

export function AssetSelector({ selectedAssets, setSelectedAssets }: AssetSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Asset[]>([])

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      const results = await searchAssets(searchTerm)
      setSearchResults(results)
    }
  }

  const handleSelect = (asset) => {
    if (!selectedAssets.some((a) => a.symbol === asset.symbol)) {
      setSelectedAssets([...selectedAssets, asset])
    }
  }

  const handleRemove = (asset) => {
    setSelectedAssets(selectedAssets.filter((a) => a.symbol !== asset.symbol))
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search assets..." />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Search Results:</h3>
          <div className="flex flex-wrap gap-2">
            {searchResults.map((asset) => (
              <Badge
                key={asset.symbol}
                variant="outline"
                className="cursor-pointer"
                onClick={() => handleSelect(asset)}
              >
                {asset.symbol} - {asset.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {selectedAssets.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Selected Assets:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedAssets.map((asset) => (
              <Badge
                key={asset.symbol}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleRemove(asset)}
              >
                {asset.symbol} <span className="ml-1">&times;</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

