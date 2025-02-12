import { Line } from "recharts"

interface TrendlineOverlayProps {
  data: {
    startDate: string
    endDate: string
    startValue: number
    endValue: number
  }[]
}

export function TrendlineOverlay({ data }: TrendlineOverlayProps) {
  return (
    <>
      {data.map((trendline, index) => (
        <Line
          key={index}
          type="linear"
          dataKey="value"
          stroke="#ff7300"
          strokeWidth={2}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
          data={[
            { date: trendline.startDate, value: trendline.startValue },
            { date: trendline.endDate, value: trendline.endValue },
          ]}
        />
      ))}
    </>
  )
}

