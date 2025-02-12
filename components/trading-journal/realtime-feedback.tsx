import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"

export function RealtimeFeedback({ feedbackData }) {
  const getAlertIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Real-time Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {feedbackData.map((feedback, index) => (
            <Alert key={index} variant={feedback.type}>
              {getAlertIcon(feedback.type)}
              <AlertTitle className="flex items-center">
                {feedback.title}
                <Badge variant={feedback.type} className="ml-2">
                  {feedback.category}
                </Badge>
              </AlertTitle>
              <AlertDescription>{feedback.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

