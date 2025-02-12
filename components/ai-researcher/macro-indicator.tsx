import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type React from "react" // Import React

interface MacroIndicatorProps {
  title: string
  value: number
  change: number
  icon: React.ElementType
}

export function MacroIndicator({ title, value, change, icon: Icon }: MacroIndicatorProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toFixed(2)}</div>
        <Badge variant={change >= 0 ? "default" : "destructive"} className="mt-1">
          {change >= 0 ? "+" : ""}
          {change.toFixed(2)}%
        </Badge>
      </CardContent>
    </Card>
  )
}

