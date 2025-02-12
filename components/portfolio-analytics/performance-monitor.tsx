import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function PerformanceMonitor({ data }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
                <Line type="monotone" dataKey="benchmark" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asset Class Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Class</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Daily Change</TableHead>
                <TableHead>Total Return</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.assetClassPerformance.map((asset, index) => (
                <TableRow key={index}>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>${asset.currentValue.toLocaleString()}</TableCell>
                  <TableCell className={asset.dailyChange > 0 ? "text-green-600" : "text-red-600"}>
                    {asset.dailyChange > 0 ? "+" : ""}
                    {asset.dailyChange.toFixed(2)}%
                  </TableCell>
                  <TableCell className={asset.totalReturn > 0 ? "text-green-600" : "text-red-600"}>
                    {asset.totalReturn > 0 ? "+" : ""}
                    {asset.totalReturn.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

