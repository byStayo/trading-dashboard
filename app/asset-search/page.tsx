"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { AssetCard } from "@/components/asset-search/asset-card"
import { RelatedAssets } from "@/components/asset-search/related-assets"
import { searchAssets, getAssetDetails } from "@/lib/api/asset-search"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Asset } from "@/types/asset-screener"

interface AssetDetails {
  name: string
  description: string
  sector: string
  industry: string
  marketCap: number
  peRatio: number
  dividendYield: number
  beta: number
  yearHigh: number
  yearLow: number
}

interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  publishedAt: string
  source: string
}

interface APIResponse {
  name: string
  description: string
  sector: string
  industry: string
  marketCap: number
  peRatio: number
  dividendYield: number
  beta: number
  yearHigh: number
  yearLow: number
  relatedAssets: Asset[]
  newsItems: NewsItem[]
}

export default function AssetSearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [assetDetails, setAssetDetails] = useState<AssetDetails | null>(null)
  const [relatedAssets, setRelatedAssets] = useState<Asset[]>([])
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const { toast } = useToast()

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm) {
        setSearchResults([])
        return
      }

      setIsLoading(true)
      try {
        const results = await searchAssets(debouncedSearchTerm)
        setSearchResults(results as Asset[])
      } catch (error) {
        console.error("Error searching assets:", error)
        toast({
          title: "Search Error",
          description: "An error occurred while searching assets. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [debouncedSearchTerm, toast])

  const handleAssetSelect = async (asset: Asset) => {
    setSelectedAsset(asset)
    setIsLoadingDetails(true)

    try {
      const response = await getAssetDetails(asset.symbol)
      const details = response as unknown as APIResponse
      
      setAssetDetails({
        name: details.name,
        description: details.description,
        sector: details.sector,
        industry: details.industry,
        marketCap: details.marketCap,
        peRatio: details.peRatio,
        dividendYield: details.dividendYield,
        beta: details.beta,
        yearHigh: details.yearHigh,
        yearLow: details.yearLow,
      })
      setRelatedAssets(details.relatedAssets)
      setNewsItems(details.newsItems)
    } catch (error) {
      console.error("Error fetching asset details:", error)
      toast({
        title: "Error",
        description: "Failed to load asset details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDetails(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Asset Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ScrollArea className="h-[600px]">
                {searchResults.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} onSelect={() => handleAssetSelect(asset)} />
                ))}
                {!isLoading && searchTerm && searchResults.length === 0 && (
                  <p className="text-center text-muted-foreground">No assets found</p>
                )}
              </ScrollArea>
            </div>

            {selectedAsset && (
              <div className="lg:col-span-2">
                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="related">Related Assets</TabsTrigger>
                    <TabsTrigger value="news">News</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details">
                    {isLoadingDetails ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ) : assetDetails ? (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold">{assetDetails.name}</h3>
                        <p className="text-muted-foreground">{assetDetails.description}</p>
                        {/* Add more details here */}
                      </div>
                    ) : null}
                  </TabsContent>

                  <TabsContent value="related">
                    <RelatedAssets assets={relatedAssets} onSelect={handleAssetSelect} />
                  </TabsContent>

                  <TabsContent value="news">
                    <div className="space-y-4">
                      {newsItems.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.summary}</p>
                            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                              <span>{item.source}</span>
                              <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

