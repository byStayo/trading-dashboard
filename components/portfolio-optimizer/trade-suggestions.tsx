import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { executeTradeOrder } from "@/lib/api/portfolio-optimizer"
import { toast } from "@/components/ui/use-toast"
import type { TradeOrder } from "@/types/portfolio-optimizer"

interface TradeSuggestionsProps {
  data: TradeOrder[]
}

export function TradeSuggestions({ data }: TradeSuggestionsProps) {
  const handleExecuteTrade = async (trade: TradeOrder) => {
    try {
      await executeTradeOrder(trade)
      toast({
        title: "Trade Executed",
        description: `Successfully executed ${trade.action} order for ${trade.asset}`,
      })
    } catch (error) {
      console.error("Error executing trade:", error)
      toast({
        title: "Trade Execution Failed",
        description: "Failed to execute trade. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getBadgeVariant = (action: TradeOrder["action"]) => {
    switch (action) {
      case "Buy":
        return "default"
      case "Sell":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Trade Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((trade, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{trade.asset}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(trade.action)}>{trade.action}</Badge>
                </TableCell>
                <TableCell>{trade.quantity}</TableCell>
                <TableCell>${trade.price.toFixed(2)}</TableCell>
                <TableCell>${(trade.quantity * trade.price).toFixed(2)}</TableCell>
                <TableCell className="max-w-[300px] truncate" title={trade.reason}>
                  {trade.reason}
                </TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleExecuteTrade(trade)}
                    variant={trade.action === "Buy" ? "default" : "destructive"}
                    size="sm"
                  >
                    Execute
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

