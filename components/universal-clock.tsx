"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface TradingSession {
  name: string
  status: "open" | "closed"
  hours: string
}

const tradingSessions: TradingSession[] = [
  { name: "New York", status: "open", hours: "9:30 AM - 4:00 PM EST" },
  { name: "London", status: "open", hours: "8:00 AM - 4:30 PM GMT" },
  { name: "Tokyo", status: "closed", hours: "9:00 AM - 3:00 PM JST" },
  { name: "Hong Kong", status: "closed", hours: "9:30 AM - 4:00 PM HKT" },
]

export function UniversalClock() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Universal Clock</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
        <div className="mt-4 space-y-2">
          {tradingSessions.map((session) => (
            <div key={session.name} className="flex items-center justify-between">
              <span className="text-sm font-medium">{session.name}</span>
              <div className="flex items-center space-x-2">
                <Badge variant={session.status === "open" ? "success" : "secondary"}>
                  {session.status.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">{session.hours}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

