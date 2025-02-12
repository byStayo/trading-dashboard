import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, Sankey, Tooltip } from "recharts"

const data = {
  nodes: [
    { name: "Revenue" },
    { name: "COGS" },
    { name: "Gross Profit" },
    { name: "Operating Expenses" },
    { name: "Operating Income" },
    { name: "Taxes" },
    { name: "Net Income" },
  ],
  links: [
    { source: 0, target: 1, value: 1000 },
    { source: 0, target: 2, value: 500 },
    { source: 2, target: 3, value: 300 },
    { source: 2, target: 4, value: 200 },
    { source: 4, target: 5, value: 50 },
    { source: 4, target: 6, value: 150 },
  ],
}

export function SankeyDiagram() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Sankey Diagram</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <Sankey
            data={data}
            nodePadding={50}
            nodeWidth={10}
            linkCurvature={0.5}
            iterations={64}
            link={{ stroke: "#000000" }}
          >
            <Tooltip />
          </Sankey>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

