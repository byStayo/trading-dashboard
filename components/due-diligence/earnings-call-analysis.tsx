import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function EarningsCallAnalysis({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings Call Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Key Takeaways</h3>
            <ul className="list-disc pl-5">
              {data.keyTakeaways.map((takeaway, index) => (
                <li key={index}>{takeaway}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Sentiment Analysis</h3>
            <div className="flex items-center space-x-2">
              <span>Overall Sentiment:</span>
              <Badge
                variant={
                  data.sentiment === "Positive"
                    ? "success"
                    : data.sentiment === "Negative"
                      ? "destructive"
                      : "secondary"
                }
              >
                {data.sentiment}
              </Badge>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Notable Quotes</h3>
            {data.notableQuotes.map((quote, index) => (
              <blockquote key={index} className="border-l-4 border-gray-300 pl-4 my-2 italic">
                "{quote}"
              </blockquote>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

