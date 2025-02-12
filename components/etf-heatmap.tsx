import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, Treemap, Tooltip } from "recharts"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"]

const data = [
  { name: "Equity", size: 400, color: "#8884d8" },
  { name: "Fixed Income", size: 300, color: "#82ca9d" },
  { name: "Commodities", size: 200, color: "#ffc658" },
  { name: "Real Estate", size: 100, color: "#ff8042" },
  { name: "Alternatives", size: 100, color: "#0088FE" },
]

export function ETFHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ETF Market Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <Treemap
            data={data}
            dataKey="size"
            ratio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            content={({ root, depth, x, y, width, height, index, payload, name }) => (
              <g>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  style={{
                    fill: depth < 2 ? COLORS[Math.floor((index / root.children.length) * COLORS.length)] : "#ffffff00",
                    stroke: "#fff",
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                  }}
                />
                {depth === 1 ? (
                  <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
                    {name}
                  </text>
                ) : null}
              </g>
            )}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded shadow">
        <p>{`${payload[0].payload.name} : ${payload[0].value}`}</p>
      </div>
    )
  }
  return null
}

