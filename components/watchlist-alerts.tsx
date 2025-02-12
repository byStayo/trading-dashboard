"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Alert {
  id: string
  symbol: string
  condition: "above" | "below"
  price: number
}

export function WatchlistAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: "1", symbol: "AAPL", condition: "above", price: 150 },
    { id: "2", symbol: "GOOGL", condition: "below", price: 2700 },
  ])
  const [newAlert, setNewAlert] = useState<Omit<Alert, "id">>({
    symbol: "",
    condition: "above",
    price: 0,
  })

  const addAlert = () => {
    if (newAlert.symbol && newAlert.price > 0) {
      setAlerts([...alerts, { ...newAlert, id: Date.now().toString() }])
      setNewAlert({ symbol: "", condition: "above", price: 0 })
    }
  }

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Symbol"
          value={newAlert.symbol}
          onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
        />
        <Select
          value={newAlert.condition}
          onValueChange={(value: "above" | "below") => setNewAlert({ ...newAlert, condition: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="above">Above</SelectItem>
            <SelectItem value="below">Below</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Price"
          value={newAlert.price}
          onChange={(e) => setNewAlert({ ...newAlert, price: Number.parseFloat(e.target.value) })}
        />
        <Button onClick={addAlert}>Add Alert</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => (
            <TableRow key={alert.id}>
              <TableCell>{alert.symbol}</TableCell>
              <TableCell>{alert.condition}</TableCell>
              <TableCell>${alert.price.toFixed(2)}</TableCell>
              <TableCell>
                <Button variant="destructive" onClick={() => removeAlert(alert.id)}>
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

