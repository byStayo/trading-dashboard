"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { WatchlistTable } from "@/components/watchlist-table"
import { WatchlistAlerts } from "@/components/watchlist-alerts"

export default function WatchlistPage() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold mb-6">Watchlist</h1>
      <div className="flex justify-between items-center mb-4">
        <Input
          className="max-w-sm"
          placeholder="Search symbols..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button>Add Symbol</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Watchlist</CardTitle>
          <CardDescription>Track and monitor your favorite stocks</CardDescription>
        </CardHeader>
        <CardContent>
          <WatchlistTable searchTerm={searchTerm} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>Manage your watchlist alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <WatchlistAlerts />
        </CardContent>
      </Card>
    </div>
  )
}

