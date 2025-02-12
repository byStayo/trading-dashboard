import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrendingUp, TrendingDown } from "lucide-react"

interface TradeSignal {
  type: "buy" | "sell"
  symbol: string
  price: number
  confidence: number
  timestamp: string
}

interface TradeSignalGeneratorProps {
  signals: TradeSignal[]
}

export function TradeSignalGenerator({ signals }: TradeSignalGeneratorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Generated Trade Signals</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {signals.map((signal, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center space-x-2">
                {signal.type === "buy" ? (
                  <TrendingUp className="text-green-500" />
                ) : (
                  <TrendingDown className="text-red-500" />
                )}
                <span className="font-medium">{signal.symbol}</span>
              </div>
              <div className="text-right">
                <div>${signal.price.toFixed(2)}</div>
                <Badge variant={signal.confidence > 75 ? "success" : "secondary"}>
                  {signal.confidence}% confidence
                </Badge>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

