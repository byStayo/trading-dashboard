import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { BookOpen, FileText, PieChartIcon, BarChart2 } from "lucide-react"

const ibAreas = [
  { name: "M&A Advisory", value: 30, color: "#8884d8" },
  { name: "Capital Markets", value: 25, color: "#82ca9d" },
  { name: "Restructuring", value: 15, color: "#ffc658" },
  { name: "Private Placements", value: 20, color: "#ff8042" },
  { name: "Industry Coverage", value: 10, color: "#0088FE" },
]

const tools = [
  { name: "Financial Modeling", description: "Build complex financial models for valuation and analysis" },
  { name: "Pitch Books", description: "Create compelling presentations for client pitches" },
  { name: "Due Diligence", description: "Conduct thorough research and analysis on target companies" },
  { name: "Deal Structuring", description: "Design optimal transaction structures for various deals" },
  { name: "Market Research", description: "Analyze industry trends and market conditions" },
]

const caseStudies = [
  {
    title: "Tech Merger: SoftCo Acquires CloudTech",
    type: "M&A",
    description: "A strategic acquisition in the software industry, valued at $5 billion.",
    keyPoints: [
      "Synergy analysis revealed $500M in potential cost savings",
      "Deal structure: 60% cash, 40% stock",
      "Regulatory challenges in EU markets",
    ],
  },
  {
    title: "GreenEnergy IPO",
    type: "Capital Markets",
    description: "Successful IPO of a renewable energy company, raising $2 billion.",
    keyPoints: [
      "Oversubscribed by 3x, indicating strong market demand",
      "Innovative green bond component included",
      "Roadshow across 12 major cities",
    ],
  },
  {
    title: "RetailCo Restructuring",
    type: "Restructuring",
    description: "Comprehensive restructuring of a struggling retail chain.",
    keyPoints: [
      "Debt reduction of $1.5 billion through negotiation",
      "Store footprint optimized, closing 30% of locations",
      "New management team installed with turnaround expertise",
    ],
  },
]

export default function InvestmentBankingPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Investment Banking Resources</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">Tools & Skills</TabsTrigger>
          <TabsTrigger value="caseStudies">Case Studies</TabsTrigger>
          <TabsTrigger value="resources">Additional Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Investment Banking Overview</CardTitle>
              <CardDescription>Key areas and their importance in the industry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Key Areas of Investment Banking</h3>
                  <ul className="space-y-2">
                    {ibAreas.map((area) => (
                      <li key={area.name} className="flex items-center">
                        <Badge variant="outline" style={{ backgroundColor: `${area.color}20`, color: area.color }}>
                          {area.value}%
                        </Badge>
                        <span className="ml-2">{area.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ibAreas}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {ibAreas.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Industry Overview</h3>
                <p>
                  Investment banking plays a crucial role in the financial world, facilitating large-scale financial
                  transactions and providing strategic advice to corporations, institutions, and governments. The
                  industry is known for its fast-paced environment, high-stakes deals, and significant impact on global
                  markets.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Essential Tools and Skills</CardTitle>
              <CardDescription>Key competencies for success in investment banking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map((tool, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{tool.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caseStudies">
          <Card>
            <CardHeader>
              <CardTitle>Case Studies</CardTitle>
              <CardDescription>Real-world examples of investment banking deals</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {caseStudies.map((study, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Badge className="mr-2">{study.type}</Badge>
                        {study.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">{study.description}</p>
                      <ul className="list-disc pl-5">
                        {study.keyPoints.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
              <CardDescription>Further learning materials and industry insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <BookOpen className="h-6 w-6 mb-2" />
                  <span>Industry Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Deal Databases</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <PieChartIcon className="h-6 w-6 mb-2" />
                  <span>Valuation Guides</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <BarChart2 className="h-6 w-6 mb-2" />
                  <span>Market Analysis Tools</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

