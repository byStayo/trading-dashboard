"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MoreHorizontal } from "lucide-react"

const mockClients = [
  { id: 1, name: "John Doe", email: "john@example.com", aum: 500000, lastContact: "2023-06-01", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", aum: 750000, lastContact: "2023-05-28", status: "Active" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", aum: 250000, lastContact: "2023-05-15", status: "Inactive" },
  { id: 4, name: "Alice Brown", email: "alice@example.com", aum: 1000000, lastContact: "2023-06-03", status: "Active" },
  {
    id: 5,
    name: "Charlie Davis",
    email: "charlie@example.com",
    aum: 350000,
    lastContact: "2023-05-20",
    status: "Active",
  },
]

export default function ClientManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [clients, setClients] = useState(mockClients)

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Client Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>Manage and view details of your clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[300px]"
              />
              <Button size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Client
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>AUM</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>${client.aum.toLocaleString()}</TableCell>
                  <TableCell>{client.lastContact}</TableCell>
                  <TableCell>
                    <Badge variant={client.status === "Active" ? "default" : "secondary"}>{client.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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

