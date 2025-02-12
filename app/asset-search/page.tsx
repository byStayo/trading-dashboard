"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import { AssetCard } from "@/components/asset-search/asset-card"
import { RelatedAssets } from "@/components/asset-search/related-assets"
import { AssetDetails } from "@/components/asset-search/asset-details"
import { AssetChart } from "@/components/asset-search/asset-chart"
import { NewsPanel } from "@/components/asset-search/news-panel"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { searchAssets, getAssetDetails, getRelatedAssets, getAssetNews } from "@/lib/api/asset-search"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function AssetSearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [assetDetails, setAssetDetails] = useState(null)
  const [relatedAssets, setRelatedAssets] = useState([])
  const [assetNews, setAssetNews] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const performSearch = useCallback(async () => {
    if (debouncedSearchTerm) {
      setIsLoading(true)
      try {
        const results = await searchAssets(debouncedSearchTerm)
        setSearchResults(results)
      } catch (error) {
        console.error("Error searching assets:", error)
        toast({
          title: "Search Error",
          description: "An error occurred while searching for assets. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else {
      setSearchResults([])
    }
  }, [debouncedSearchTerm, toast])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  const handleAssetSelect = async (asset) => {
    setSelectedAsset(asset)
    setIsLoading(true)
    try {
      const [details, related, news] = await Promise.all([
        getAssetDetails(asset.id),
        getRelatedAssets(asset.id),
        getAssetNews(asset.id),
      ])
      setAssetDetails(details)
      setRelatedAssets(related)
      setAssetNews(news)
    } catch (error) {
      console.error("Error fetching asset details:", error)
      toast({
        title: "Data Fetch Error",
        description: "An error occurred while fetching asset details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">AI-Powered Asset Search</h1>

      <Card>
        <CardHeader>
          <CardTitle>Search Global Financial Instruments</CardTitle>
          <CardDescription>
            Scan and rank assets across stocks, crypto, bonds, ETFs, indices, commodities, and forex
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button onClick={performSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {isLoading ? (
            <div className="mt-4 space-y-2">
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[300px] mt-4">
              {searchResults.map((asset) => (
                <AssetCard key={asset.id} asset={asset} onSelect={() => handleAssetSelect(asset)} />
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {selectedAsset && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{selectedAsset.name}</CardTitle>
              <CardDescription>{selectedAsset.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
                  <TabsTrigger value="technicals">Technicals</TabsTrigger>
                  <TabsTrigger value="news">News</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <AssetDetails details={assetDetails} />
                </TabsContent>
                <TabsContent value="chart">
                  <AssetChart assetId={selectedAsset.id} />
                </TabsContent>
                <TabsContent value="fundamentals">
                  {/* Implement fundamentals view */}
                  <p>Fundamentals analysis coming soon...</p>
                </TabsContent>
                <TabsContent value="technicals">
                  {/* Implement technicals view */}
                  <p>Technical analysis coming soon...</p>
                </TabsContent>
                <TabsContent value="news">
                  <NewsPanel news={assetNews} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Assets</CardTitle>
              <CardDescription>AI-recommended alternatives</CardDescription>
            </CardHeader>
            <CardContent>
              <RelatedAssets assets={relatedAssets} onSelect={handleAssetSelect} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

