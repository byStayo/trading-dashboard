"use client"

import { useState, useCallback } from "react"
import { Responsive, WidthProvider, Layout } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { TradingVolume } from "@/components/trading-volume"
import { AIInsights } from "@/components/ai-insights"
import { GenerativeTradingIdeas } from "@/components/generative-trading-ideas"
import { OptionChain } from "@/components/option-chain"
import { SmartMoneyFlow } from "@/components/smart-money-flow"
import { SupportResistanceLevels } from "@/components/support-resistance-levels"
import { MarketBreadth } from "@/components/market-breadth"
import { LiveMarketData } from "@/components/live-market-data"
import { TechnicalAnalysis } from "@/components/technical-analysis"
import { GenerativeMarketInsights } from "@/components/generative-ui/market-insights"
import { GenerativeTradeSuggestions } from "@/components/generative-ui/trade-suggestions"
import { GenerativeDataVisualization } from "@/components/generative-ui/data-visualization"
import { OrderBookVisualization } from "@/components/order-book-visualization"
import { ContextAwareChart } from "@/components/context-aware-chart"
import { GenerativeNewsPanel } from "@/components/generative-news-panel"
import { GenerativeChat } from "@/components/generative-chat"
import { PortfolioOverview } from "@/components/portfolio-overview"
import { useUserPreferences } from "@/lib/hooks/use-user-preferences"

const defaultLayout: Layout[] = [
  { i: "live-market-data", x: 0, y: 0, w: 12, h: 4, minH: 4, isDraggable: false },
  { i: "trading-volume", x: 0, y: 4, w: 6, h: 4, minH: 4 },
  { i: "ai-insights", x: 6, y: 4, w: 6, h: 4, minH: 4 },
  { i: "trading-ideas", x: 0, y: 8, w: 6, h: 4, minH: 4 },
  { i: "option-chain", x: 6, y: 8, w: 6, h: 4, minH: 4 },
  { i: "smart-money", x: 0, y: 12, w: 6, h: 4, minH: 4 },
  { i: "support-resistance", x: 6, y: 12, w: 6, h: 4, minH: 4 },
  { i: "market-breadth", x: 0, y: 16, w: 6, h: 4, minH: 4 },
  { i: "technical-analysis", x: 6, y: 16, w: 6, h: 4, minH: 4 },
  { i: "generative-market-insights", x: 0, y: 20, w: 6, h: 4, minH: 4 },
  { i: "generative-trade-suggestions", x: 6, y: 20, w: 6, h: 4, minH: 4 },
  { i: "generative-data-visualization", x: 0, y: 24, w: 12, h: 6, minH: 6 },
  { i: "order-book-visualization", x: 0, y: 30, w: 6, h: 4, minH: 4 },
  { i: "context-aware-chart", x: 6, y: 30, w: 6, h: 4, minH: 4 },
  { i: "generative-news-panel", x: 0, y: 34, w: 6, h: 4, minH: 4 },
  { i: "generative-chat", x: 6, y: 34, w: 6, h: 4, minH: 4 },
  { i: "portfolio-overview", x: 0, y: 38, w: 12, h: 4, minH: 4 },
]

const ResponsiveGridLayout = WidthProvider(Responsive)

export function DashboardLayout() {
  const { preferences, updateLayout } = useUserPreferences()
  const [layout, setLayout] = useState<Layout[]>(() => {
    if (Array.isArray(preferences.layout) && preferences.layout.length > 0) {
      return preferences.layout.map(item => ({
        ...defaultLayout.find(d => d.i === item.i) || item,
        isDraggable: item.i !== "live-market-data"
      }))
    }
    return defaultLayout
  })

  const handleLayoutChange = useCallback(
    (currentLayout: Layout[]) => {
      const updatedLayout = currentLayout.map(item => ({
        ...item,
        isDraggable: item.i !== "live-market-data",
        minH: defaultLayout.find(d => d.i === item.i)?.minH || item.minH
      }))
      setLayout(updatedLayout)
      updateLayout(updatedLayout)
    },
    [updateLayout],
  )

  return (
    <div className="h-full w-full bg-background overflow-x-hidden">
      <div className="w-full h-full px-4">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          onLayoutChange={handleLayoutChange}
          isDraggable
          isResizable
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          <div key="live-market-data" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <LiveMarketData />
          </div>
          <div key="trading-volume" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <TradingVolume />
          </div>
          <div key="ai-insights" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <AIInsights />
          </div>
          <div key="trading-ideas" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <GenerativeTradingIdeas />
          </div>
          <div key="option-chain" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <OptionChain />
          </div>
          <div key="smart-money" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <SmartMoneyFlow />
          </div>
          <div key="support-resistance" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <SupportResistanceLevels />
          </div>
          <div key="market-breadth" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <MarketBreadth />
          </div>
          <div key="technical-analysis" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <TechnicalAnalysis />
          </div>
          <div key="generative-market-insights" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <GenerativeMarketInsights />
          </div>
          <div key="generative-trade-suggestions" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <GenerativeTradeSuggestions />
          </div>
          <div key="generative-data-visualization" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <GenerativeDataVisualization />
          </div>
          <div key="order-book-visualization" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <OrderBookVisualization />
          </div>
          <div key="context-aware-chart" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <ContextAwareChart />
          </div>
          <div key="generative-news-panel" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <GenerativeNewsPanel />
          </div>
          <div key="generative-chat" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <GenerativeChat />
          </div>
          <div key="portfolio-overview" className="w-full h-full overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
            <PortfolioOverview />
          </div>
        </ResponsiveGridLayout>
      </div>
    </div>
  )
}

