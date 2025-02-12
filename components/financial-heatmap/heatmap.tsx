"use client"

import { useRef, useEffect, useState } from "react"
import * as d3 from "d3"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"

interface HeatmapProps {
  data: {
    id: string
    name: string
    value: number
    aiInsights?: string
    subSectors?: {
      name: string
      value: number
    }[]
  }[]
  showAIInsights: boolean
  metric: string
}

export function Heatmap({ data, showAIInsights, metric }: HeatmapProps) {
  const svgRef = useRef(null)
  const [selectedSector, setSelectedSector] = useState(null)

  useEffect(() => {
    if (!data.length) return

    const width = 800
    const height = 600

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height)

    const treemap = d3.treemap().size([width, height]).padding(1).round(true)

    const root = d3.hierarchy({ children: data }).sum((d) => d.value)

    const nodes = treemap(root).leaves()

    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlGn)
      .domain([d3.min(data, (d) => d.value), d3.max(data, (d) => d.value)])

    svg.selectAll("g").remove()

    const cell = svg
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
      .on("click", (event, d) => setSelectedSector(d.data))

    cell
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => colorScale(d.data.value))

    cell
      .append("text")
      .attr("x", 4)
      .attr("y", 14)
      .text((d) => d.data.name)
      .attr("font-size", "12px")
      .attr("fill", "white")

    if (showAIInsights) {
      cell
        .append("text")
        .attr("x", 4)
        .attr("y", 28)
        .text((d) => d.data.aiInsights || "")
        .attr("font-size", "10px")
        .attr("fill", "white")
        .attr("opacity", 0.8)
    }
  }, [data, showAIInsights])

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <svg ref={svgRef}></svg>
        {selectedSector && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">{selectedSector.name}</h3>
              <p className="mb-2">
                {metric}: {selectedSector.value.toFixed(2)}
              </p>
              {showAIInsights && selectedSector.aiInsights && (
                <p className="mb-2">AI Insight: {selectedSector.aiInsights}</p>
              )}
              {selectedSector.subSectors && (
                <div>
                  <h4 className="font-semibold mb-1">Sub-sectors:</h4>
                  <ul className="list-disc pl-5">
                    {selectedSector.subSectors.map((subSector, index) => (
                      <li key={index}>
                        {subSector.name}: {subSector.value.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Tooltip content="View detailed analysis">
                <Button className="mt-2">Analyze</Button>
              </Tooltip>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}

