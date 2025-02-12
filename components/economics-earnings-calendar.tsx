"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const economicEvents = [
  { date: "2023-06-15", time: "08:30", event: "US Initial Jobless Claims", impact: "high" },
  { date: "2023-06-16", time: "10:00", event: "US Consumer Sentiment", impact: "medium" },
  { date: "2023-06-17", time: "14:00", event: "Fed Interest Rate Decision", impact: "high" },
]

const earningsEvents = [
  { date: "2023-06-15", time: "After Market", company: "Adobe Inc.", symbol: "ADBE", expectedEPS: 3.5 },
  { date: "2023-06-16", time: "Before Market", company: "Kroger Co.", symbol: "KR", expectedEPS: 1.45 },
  { date: "2023-06-17", time: "After Market", company: "FedEx Corporation", symbol: "FDX", expectedEPS: 4.85 },
]

export function EconomicsEarningsCalendar() {
  const [activeTab, setActiveTab] = useState("economic")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Economics & Earnings Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="economic">Economic Events</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>
          <TabsContent value="economic">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {economicEvents.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.time}</TableCell>
                    <TableCell>{event.event}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.impact === "high" ? "destructive" : event.impact === "medium" ? "default" : "secondary"
                        }
                      >
                        {event.impact}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="earnings">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Expected EPS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earningsEvents.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.time}</TableCell>
                    <TableCell>{event.company}</TableCell>
                    <TableCell>{event.symbol}</TableCell>
                    <TableCell>${event.expectedEPS.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

