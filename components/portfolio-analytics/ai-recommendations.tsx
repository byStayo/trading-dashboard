import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { executeRecommendation } from "@/lib/api/portfolio-analytics"
import { toast } from "@/components/ui/use-toast"

export function AIRecommendations({ data }) {
  const handleExecuteRecommendation = async (recommendation) => {
    try {
      await executeRecommendation(recommendation)
      toast({
        title: "Recommendation Executed",
        description: `Successfully executed: ${recommendation.action} ${recommendation.asset}`,
      })
    } catch (error) {
      console.error("Error executing recommendation:", error)
      toast({
        title: "Error",
        description: "Failed to execute recommendation. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Generated Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.recommendations.map((recommendation, index) => (
            <Card key={index}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  {recommendation.type === "buy" && <TrendingUp className="text-green-500" />}
                  {recommendation.type === "sell" && <TrendingDown className="text-red-500" />}
                  {recommendation.type === "rebalance" && <AlertTriangle className="text-yellow-500" />}
                  <div>
                    <h3 className="font-semibold">{recommendation.asset}</h3>
                    <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge>{recommendation.type.toUpperCase()}</Badge>
                  <Button size="sm" onClick={() => handleExecuteRecommendation(recommendation)}>
                    Execute
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

