import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function BehaviorAnalysis({ behaviorData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Behavior Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(behaviorData).map(([behavior, { score, description }]) => (
            <div key={behavior}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{behavior}</span>
                <span className="text-sm font-medium">{score}%</span>
              </div>
              <Progress value={score} className="h-2" />
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

