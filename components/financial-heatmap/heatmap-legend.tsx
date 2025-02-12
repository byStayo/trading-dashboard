"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface HeatmapLegendProps {
  metric: string
}

export function HeatmapLegend({ metric }: HeatmapLegendProps) {
  const svgRef = useRef(null)

  useEffect(() => {
    const width = 300
    const height = 50

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height)

    const colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 100])

    const legendScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, width - 20])

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat((d) => `${d}%`)

    svg.selectAll("*").remove()

    const legend = svg.append("g").attr("transform", `translate(10, 10)`)

    legend
      .append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .selectAll("stop")
      .data(colorScale.ticks(10).map((t, i, n) => ({ offset: `${(100 * i) / n.length}%`, color: colorScale(t) })))
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color)

    legend
      .append("rect")
      .attr("width", width - 20)
      .attr("height", 20)
      .style("fill", "url(#legend-gradient)")

    legend.append("g").attr("transform", `translate(0, 20)`).call(legendAxis)

    legend
      .append("text")
      .attr("x", (width - 20) / 2)
      .attr("y", 45)
      .attr("text-anchor", "middle")
      .text(metric)
  }, [metric])

  return <svg ref={svgRef}></svg>
}

