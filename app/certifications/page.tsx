import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle2, BookOpen, FileQuestion, BarChart, Clock, Award, DollarSign } from "lucide-react"

const cfaLevels = [
  {
    level: "Level I",
    topics: [
      { name: "Ethical and Professional Standards", progress: 75 },
      { name: "Quantitative Methods", progress: 60 },
      { name: "Economics", progress: 80 },
      { name: "Financial Reporting and Analysis", progress: 70 },
      { name: "Corporate Finance", progress: 65 },
      { name: "Equity Investments", progress: 85 },
      { name: "Fixed Income", progress: 55 },
      { name: "Derivatives", progress: 50 },
      { name: "Alternative Investments", progress: 45 },
      { name: "Portfolio Management and Wealth Planning", progress: 70 },
    ],
  },
  {
    level: "Level II",
    topics: [
      { name: "Ethical and Professional Standards", progress: 0 },
      { name: "Quantitative Methods", progress: 0 },
      { name: "Economics", progress: 0 },
      { name: "Financial Reporting and Analysis", progress: 0 },
      { name: "Corporate Finance", progress: 0 },
      { name: "Equity Investments", progress: 0 },
      { name: "Fixed Income", progress: 0 },
      { name: "Derivatives", progress: 0 },
      { name: "Alternative Investments", progress: 0 },
      { name: "Portfolio Management and Wealth Planning", progress: 0 },
    ],
  },
  {
    level: "Level III",
    topics: [
      { name: "Ethical and Professional Standards", progress: 0 },
      { name: "Economics", progress: 0 },
      { name: "Financial Reporting and Analysis", progress: 0 },
      { name: "Equity Investments", progress: 0 },
      { name: "Fixed Income", progress: 0 },
      { name: "Derivatives", progress: 0 },
      { name: "Alternative Investments", progress: 0 },
      { name: "Portfolio Management and Wealth Planning", progress: 0 },
    ],
  },
]

const ctmTopics = [
  { name: "Treasury Management Fundamentals", progress: 80 },
  { name: "Working Capital Management", progress: 75 },
  { name: "Capital Markets and Funding", progress: 70 },
  { name: "Cash Management", progress: 85 },
  { name: "Treasury Operations and Controls", progress: 65 },
  { name: "Risk Management", progress: 60 },
  { name: "Financial Planning and Analysis", progress: 55 },
]

const practiceQuestions = [
  {
    question: "What is the primary purpose of the Sharpe ratio?",
    options: [
      "To measure the volatility of a portfolio",
      "To compare the return of different portfolios",
      "To measure risk-adjusted performance",
      "To calculate the correlation between assets",
    ],
    correctAnswer: 2,
  },
  {
    question: "Which of the following is NOT a type of market efficiency?",
    options: ["Weak form", "Semi-strong form", "Strong form", "Ultra-strong form"],
    correctAnswer: 3,
  },
  {
    question: "What does WACC stand for in corporate finance?",
    options: [
      "Weighted Average Cost of Capital",
      "Weighted Asset Cost Calculation",
      "Whole Asset Cost of Capital",
      "Weighted Average Capital Cost",
    ],
    correctAnswer: 0,
  },
]

export default function CertificationsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">CFA and CTM Training Modules</h1>

      <Tabs defaultValue="cfa" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cfa">CFA Certification</TabsTrigger>
          <TabsTrigger value="ctm">CTM Certification</TabsTrigger>
        </TabsList>

        <TabsContent value="cfa">
          <Card>
            <CardHeader>
              <CardTitle>Chartered Financial Analyst (CFA) Program</CardTitle>
              <CardDescription>Comprehensive study modules for each CFA level</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="Level I" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  {cfaLevels.map((level) => (
                    <TabsTrigger key={level.level} value={level.level}>
                      {level.level}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {cfaLevels.map((level) => (
                  <TabsContent key={level.level} value={level.level}>
                    <div className="space-y-4">
                      {level.topics.map((topic, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{topic.name}</span>
                            <span className="text-sm font-medium">{topic.progress}%</span>
                          </div>
                          <Progress value={topic.progress} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Practice Questions</h3>
                <Accordion type="single" collapsible className="w-full">
                  {practiceQuestions.map((q, index) => (
                    <AccordionItem value={`question-${index}`} key={index}>
                      <AccordionTrigger>{q.question}</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-5 space-y-2">
                          {q.options.map((option, optionIndex) => (
                            <li key={optionIndex} className={optionIndex === q.correctAnswer ? "font-bold" : ""}>
                              {option}
                              {optionIndex === q.correctAnswer && (
                                <CheckCircle2 className="inline-block ml-2 h-4 w-4 text-green-500" />
                              )}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ctm">
          <Card>
            <CardHeader>
              <CardTitle>Certified Treasury Management (CTM) Program</CardTitle>
              <CardDescription>Study modules and progress tracking for CTM certification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  {ctmTopics.map((topic, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{topic.name}</span>
                        <span className="text-sm font-medium">{topic.progress}%</span>
                      </div>
                      <Progress value={topic.progress} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <BookOpen className="h-6 w-6 mb-2" />
                    <span>Study Materials</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <FileQuestion className="h-6 w-6 mb-2" />
                    <span>Practice Exams</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <BarChart className="h-6 w-6 mb-2" />
                    <span>Performance Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Clock className="h-6 w-6 mb-2" />
                    <span>Study Planner</span>
                  </Button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Certification Path</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Complete all study modules</li>
                    <li>Pass practice exams with a score of 80% or higher</li>
                    <li>Register for the CTM exam</li>
                    <li>Pass the CTM exam</li>
                    <li>Submit application for certification</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Certification Benefits</CardTitle>
          <CardDescription>Why pursue CFA or CTM certification?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <Award className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">Professional Recognition</h4>
                <p className="text-sm text-muted-foreground">Gain respect and credibility in the financial industry</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <BarChart className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">Career Advancement</h4>
                <p className="text-sm text-muted-foreground">Open doors to new opportunities and higher positions</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <BookOpen className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">In-depth Knowledge</h4>
                <p className="text-sm text-muted-foreground">Develop a comprehensive understanding of finance</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <DollarSign className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-semibold">Higher Earning Potential</h4>
                <p className="text-sm text-muted-foreground">Increase your value and earning capacity</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

