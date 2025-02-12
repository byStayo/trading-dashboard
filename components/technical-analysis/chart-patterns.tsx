import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface ChartPatternsProps {
  patterns: {
    name: string
    description: string
    confidence: number
  }[]
  selectedPatterns: string[]
  setSelectedPatterns: (patterns: string[]) => void
}

export function ChartPatterns({ patterns, selectedPatterns, setSelectedPatterns }: ChartPatternsProps) {
  const handlePatternToggle = (patternName: string) => {
    if (selectedPatterns.includes(patternName)) {
      setSelectedPatterns(selectedPatterns.filter((p) => p !== patternName))
    } else {
      setSelectedPatterns([...selectedPatterns, patternName])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Detected Chart Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patterns.map((pattern, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`pattern-${index}`}
                checked={selectedPatterns.includes(pattern.name)}
                onCheckedChange={() => handlePatternToggle(pattern.name)}
              />
              <label
                htmlFor={`pattern-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {pattern.name} (Confidence: {pattern.confidence}%)
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

