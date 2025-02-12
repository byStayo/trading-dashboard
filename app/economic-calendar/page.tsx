"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { addDays } from "date-fns"
import { Calendar, DollarSign, TrendingUp, BarChart } from "lucide-react"

// Mock data for economic events
const mockEvents = [
  {
    date: "2023-06-15",
    time: "08:30",
    event: "US Initial Jobless Claims",
    impact: "high",
    forecast: "260K",
    previous: "261K",
  },
  {
    date: "2023-06-15",
    time: "12:30",
    event: "ECB Interest Rate Decision",
    impact: "high",
    forecast: "3.50%",
    previous: "3.25%",
  },
  {
    date: "2023-06-16",
    time: "04:00",
    event: "China Industrial Production YoY",
    impact: "medium",
    forecast: "3.6%",
    previous: "5.6%",
  },
  {
    date: "2023-06-16",
    time: "08:30",
    event: "US Retail Sales MoM",
    impact: "high",
    forecast: "0.2%",
    previous: "0.4%",
  },
  {
    date: "2023-06-17",
    time: "10:00",
    event: "Eurozone CPI YoY",
    impact: "high",
    forecast: "6.1%",
    previous: "7.0%",
  },
]

export default function EconomicCalendarPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  })
  const [importance, setImportance] = useState("all")

  const filteredEvents = mockEvents.filter((event) => {
    const eventDate = new Date(event.date)
    const isInDateRange = eventDate >= dateRange.from && eventDate <= dateRange.to
    const matchesImportance = importance === "all" || event.impact === importance
    return isInDateRange && matchesImportance
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Economic Calendar</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Customize your economic calendar view</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between items-center">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Select value={importance} onValueChange={setImportance}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select importance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Economic Events</CardTitle>
          <CardDescription>Key economic indicators and events that may impact markets</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Forecast</TableHead>
                <TableHead>Previous</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">{event.date}</div>
                    <div className="text-sm text-muted-foreground">{event.time}</div>
                  </TableCell>
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
                  <TableCell>{event.forecast}</TableCell>
                  <TableCell>{event.previous}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEvents.length}</div>
            <p className="text-xs text-muted-foreground">in the selected date range</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Impact Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEvents.filter((e) => e.impact === "high").length}</div>
            <p className="text-xs text-muted-foreground">events that may significantly impact markets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries Represented</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">major economies with scheduled events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Categories</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">different types of economic indicators</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

