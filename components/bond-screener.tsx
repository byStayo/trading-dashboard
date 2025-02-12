"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const mockBonds = [
  { name: "US Treasury 10Y", yield: 1.45, rating: "AAA", maturity: "10Y", price: 98.5 },
  { name: "Corporate Bond A", yield: 3.2, rating: "A", maturity: "5Y", price: 101.2 },
  { name: "Municipal Bond B", yield: 2.1, rating: "AA", maturity: "7Y", price: 99.8 },
]

export function BondScreener() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")

  const filteredBonds = mockBonds
    .filter((bond) => bond.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bond Screener</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="yield">Yield</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="maturity">Maturity</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Yield</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Maturity</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBonds.map((bond, index) => (
              <TableRow key={index}>
                <TableCell>{bond.name}</TableCell>
                <TableCell>{bond.yield.toFixed(2)}%</TableCell>
                <TableCell>{bond.rating}</TableCell>
                <TableCell>{bond.maturity}</TableCell>
                <TableCell>${bond.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

