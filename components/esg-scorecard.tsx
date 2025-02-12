import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const esgScores = [
  { category: "Environmental", score: 75 },
  { category: "Social", score: 82 },
  { category: "Governance", score: 90 },
]

export function ESGScorecard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ESG Scorecard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {esgScores.map((item) => (
            <div key={item.category}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{item.category}</span>
                <span className="text-sm font-medium">{item.score}/100</span>
              </div>
              <Progress value={item.score} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

