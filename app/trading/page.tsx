import { TradingInterface } from "@/components/trading-interface"
import { OrderBook } from "@/components/order-book"
import { TradingHistory } from "@/components/trading-history"
import { OptionChain } from "@/components/option-chain"

export default function TradingPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold mb-6">Trading</h1>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <TradingInterface />
        <OrderBook />
        <TradingHistory />
        <OptionChain />
      </div>
    </div>
  )
}

