import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function InsiderTransactions({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insider Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Insider</TableHead>
              <TableHead>Transaction Type</TableHead>
              <TableHead>Shares</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.transactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.insider}</TableCell>
                <TableCell>
                  <Badge variant={transaction.type === "Buy" ? "success" : "destructive"}>{transaction.type}</Badge>
                </TableCell>
                <TableCell>{transaction.shares.toLocaleString()}</TableCell>
                <TableCell>${transaction.value.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
          <p>{data.aiAnalysis}</p>
        </div>
      </CardContent>
    </Card>
  )
}

