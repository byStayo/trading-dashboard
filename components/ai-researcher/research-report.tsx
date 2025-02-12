import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ResearchReportProps {
  report: {
    id: string
    title: string
    summary: string
    category: string
    content: string
    date: string
    author: string
  }
}

export function ResearchReport({ report }: ResearchReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{report.title}</CardTitle>
        <div className="flex justify-between items-center">
          <Badge>{report.category}</Badge>
          <span className="text-sm text-muted-foreground">{report.date}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="font-semibold mb-2">{report.summary}</p>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: report.content }} />
        <p className="mt-4 text-sm text-muted-foreground">Author: {report.author}</p>
      </CardContent>
    </Card>
  )
}

