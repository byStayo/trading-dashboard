import { MarketOverview } from "@/components/market-overview"
import { LiveMarketData } from "@/components/live-market-data"
import { MarketBreadth } from "@/components/market-breadth"
import { TradingVolume } from "@/components/trading-volume"
import { SupportResistanceLevels } from "@/components/support-resistance-levels"
import { AIInsights } from "@/components/ai-insights"

export default function MarketOverviewPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold mb-6">Market Overview</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <MarketOverview />
        <LiveMarketData />
        <MarketBreadth />
        <TradingVolume />
        <SupportResistanceLevels />
        <AIInsights />
      </div>
    </div>
  )
}

