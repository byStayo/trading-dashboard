import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function TradeLog({ trades }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Entry Price</TableHead>
              <TableHead>Exit Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>P/L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(trade.date).toLocaleString()}</TableCell>
                <TableCell>{trade.symbol}</TableCell>
                <TableCell>
                  <Badge variant={trade.type === "Buy" ? "success" : "destructive"}>{trade.type}</Badge>
                </TableCell>
                <TableCell>${trade.entryPrice.toFixed(2)}</TableCell>
                <TableCell>${trade.exitPrice.toFixed(2)}</TableCell>
                <TableCell>{trade.quantity}</TableCell>
                <TableCell>
                  <Badge variant={trade.profitLoss >= 0 ? "success" : "destructive"}>
                    ${trade.profitLoss.toFixed(2)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

