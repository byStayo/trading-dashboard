import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const executives = [
  { name: "John Doe", position: "CEO", image: "/placeholder.svg" },
  { name: "Jane Smith", position: "CFO", image: "/placeholder.svg" },
  { name: "Mike Johnson", position: "CTO", image: "/placeholder.svg" },
  { name: "Sarah Brown", position: "COO", image: "/placeholder.svg" },
]

export function CSuiteOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>C-Suite Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {executives.map((exec) => (
            <div key={exec.name} className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={exec.image} alt={exec.name} />
                <AvatarFallback>
                  {exec.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{exec.name}</p>
                <p className="text-sm text-muted-foreground">{exec.position}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

