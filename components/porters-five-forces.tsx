import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const forces = [
  { name: "Competitive Rivalry", level: "High", description: "Intense competition in the industry" },
  { name: "Threat of New Entrants", level: "Medium", description: "Moderate barriers to entry" },
  { name: "Bargaining Power of Suppliers", level: "Low", description: "Many suppliers available" },
  { name: "Bargaining Power of Buyers", level: "High", description: "Customers have many options" },
  { name: "Threat of Substitutes", level: "Medium", description: "Some alternative products available" },
]

export function PortersFiveForces() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Porter's Five Forces Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {forces.map((force) => (
            <li key={force.name} className="flex items-center justify-between">
              <span className="font-medium">{force.name}</span>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={force.level === "High" ? "destructive" : force.level === "Medium" ? "default" : "secondary"}
                >
                  {force.level}
                </Badge>
                <span className="text-sm text-muted-foreground">{force.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

