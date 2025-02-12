"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AssetCard } from "@/components/asset-search/asset-card"
import { screenAssets, getRealtimeData } from "@/lib/api/asset-screener"
import { Loader2, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AssetScreenerPage() {
  const [screeningCriteria, setScreeningCriteria] = useState({
    assetClass: "stocks",
    fundamentals: {
      peRatioMin: 0,
      peRatioMax: 100,
      epsGrowthMin: 0,
      debtToEquityMax: 2,
      dividendYieldMin: 0,
      marketCapMin: 0,
    },
    technicals: {
      rsiMin: 0,
      rsiMax: 100,
      macdSignal: "bullish",
      movingAveragePeriod: 50,
      movingAverageType: "simple",
    },
    sentiment: {
      newsScoreMin: -100,
      analystRating: "buy",
      insiderBuying: false,
      socialMediaBuzz: false,
    },
    customFilters: "",
  })

  const [screeningResults, setScreeningResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  const handleScreeningCriteriaChange = (category, field, value) => {
    setScreeningCriteria((prevCriteria) => ({
      ...prevCriteria,
      [category]: {
        ...prevCriteria[category],
        [field]: value,
      },
    }))
  }

  const handleScreening = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const results = await screenAssets(screeningCriteria)
      setScreeningResults(results)
    } catch (error) {
      console.error("Error during asset screening:", error)
      setError("An error occurred while screening assets. Please try again.")
      toast({
        title: "Screening Error",
        description: "An error occurred while screening assets. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let intervalId
    if (screeningResults.length > 0) {
      intervalId = setInterval(async () => {
        try {
          const updatedData = await getRealtimeData(screeningResults.map((asset) => asset.symbol))
          setScreeningResults((prevResults) =>
            prevResults.map((asset) => ({
              ...asset,
              ...updatedData[asset.symbol],
            })),
          )
        } catch (error) {
          console.error("Error fetching real-time data:", error)
        }
      }, 5000) // Update every 5 seconds
    }
    return () => clearInterval(intervalId)
  }, [screeningResults])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">AI-Powered Asset Screener</h1>

      <Card>
        <CardHeader>
          <CardTitle>Screening Criteria</CardTitle>
          <CardDescription>Set your criteria to filter assets</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fundamentals">
            <TabsList>
              <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
              <TabsTrigger value="technicals">Technicals</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            <TabsContent value="fundamentals">
              <div className="space-y-4">
                <div>
                  <Label>P/E Ratio Range</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={screeningCriteria.fundamentals.peRatioMin}
                      onChange={(e) =>
                        handleScreeningCriteriaChange("fundamentals", "peRatioMin", Number.parseFloat(e.target.value))
                      }
                      className="w-20"
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      value={screeningCriteria.fundamentals.peRatioMax}
                      onChange={(e) =>
                        handleScreeningCriteriaChange("fundamentals", "peRatioMax", Number.parseFloat(e.target.value))
                      }
                      className="w-20"
                    />
                  </div>
                </div>
                <div>
                  <Label>Minimum EPS Growth (%)</Label>
                  <Input
                    type="number"
                    value={screeningCriteria.fundamentals.epsGrowthMin}
                    onChange={(e) =>
                      handleScreeningCriteriaChange("fundamentals", "epsGrowthMin", Number.parseFloat(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label>Maximum Debt to Equity Ratio</Label>
                  <Input
                    type="number"
                    value={screeningCriteria.fundamentals.debtToEquityMax}
                    onChange={(e) =>
                      handleScreeningCriteriaChange(
                        "fundamentals",
                        "debtToEquityMax",
                        Number.parseFloat(e.target.value),
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Minimum Dividend Yield (%)</Label>
                  <Input
                    type="number"
                    value={screeningCriteria.fundamentals.dividendYieldMin}
                    onChange={(e) =>
                      handleScreeningCriteriaChange(
                        "fundamentals",
                        "dividendYieldMin",
                        Number.parseFloat(e.target.value),
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Minimum Market Cap (in billions)</Label>
                  <Input
                    type="number"
                    value={screeningCriteria.fundamentals.marketCapMin}
                    onChange={(e) =>
                      handleScreeningCriteriaChange("fundamentals", "marketCapMin", Number.parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="technicals">
              <div className="space-y-4">
                <div>
                  <Label>RSI Range</Label>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[screeningCriteria.technicals.rsiMin, screeningCriteria.technicals.rsiMax]}
                    onValueChange={(value) => {
                      handleScreeningCriteriaChange("technicals", "rsiMin", value[0])
                      handleScreeningCriteriaChange("technicals", "rsiMax", value[1])
                    }}
                  />
                  <div className="flex justify-between">
                    <span>{screeningCriteria.technicals.rsiMin}</span>
                    <span>{screeningCriteria.technicals.rsiMax}</span>
                  </div>
                </div>
                <div>
                  <Label>MACD Signal</Label>
                  <Select
                    value={screeningCriteria.technicals.macdSignal}
                    onValueChange={(value) => handleScreeningCriteriaChange("technicals", "macdSignal", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select MACD signal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bullish">Bullish</SelectItem>
                      <SelectItem value="bearish">Bearish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Moving Average</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={screeningCriteria.technicals.movingAveragePeriod}
                      onChange={(e) =>
                        handleScreeningCriteriaChange(
                          "technicals",
                          "movingAveragePeriod",
                          Number.parseInt(e.target.value),
                        )
                      }
                      className="w-20"
                    />
                    <Select
                      value={screeningCriteria.technicals.movingAverageType}
                      onValueChange={(value) => handleScreeningCriteriaChange("technicals", "movingAverageType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="exponential">Exponential</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="sentiment">
              <div className="space-y-4">
                <div>
                  <Label>Minimum News Sentiment Score</Label>
                  <Slider
                    min={-100}
                    max={100}
                    step={1}
                    value={[screeningCriteria.sentiment.newsScoreMin]}
                    onValueChange={(value) => handleScreeningCriteriaChange("sentiment", "newsScoreMin", value[0])}
                  />
                  <div className="text-center">{screeningCriteria.sentiment.newsScoreMin}</div>
                </div>
                <div>
                  <Label>Analyst Rating</Label>
                  <Select
                    value={screeningCriteria.sentiment.analystRating}
                    onValueChange={(value) => handleScreeningCriteriaChange("sentiment", "analystRating", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select analyst rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="hold">Hold</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="insider-buying"
                    checked={screeningCriteria.sentiment.insiderBuying}
                    onCheckedChange={(checked) => handleScreeningCriteriaChange("sentiment", "insiderBuying", checked)}
                  />
                  <Label htmlFor="insider-buying">Insider Buying</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="social-media-buzz"
                    checked={screeningCriteria.sentiment.socialMediaBuzz}
                    onCheckedChange={(checked) =>
                      handleScreeningCriteriaChange("sentiment", "socialMediaBuzz", checked)
                    }
                  />
                  <Label htmlFor="social-media-buzz">Social Media Buzz</Label>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="custom">
              <div className="space-y-4">
                <div>
                  <Label>Custom Filter Query</Label>
                  <Input
                    value={screeningCriteria.customFilters}
                    onChange={(e) => setScreeningCriteria({ ...screeningCriteria, customFilters: e.target.value })}
                    placeholder="Enter custom filter query"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-6">
            <Button onClick={handleScreening} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Screening...
                </>
              ) : (
                "Screen Assets"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-destructive/15">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {screeningResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Screening Results</CardTitle>
            <CardDescription>{screeningResults.length} assets found</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {screeningResults.map((asset) => (
                <AssetCard key={asset.id} asset={asset} onSelect={() => {}} />
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

