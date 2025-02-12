import { ReferenceLine } from "recharts"

interface FibonacciRetracementProps {
  data: {
    level: number
    value: number
  }[]
}

export function FibonacciRetracement({ data }: FibonacciRetracementProps) {
  return (
    <>
      {data.map((level, index) => (
        <ReferenceLine
          key={index}
          y={level.value}
          stroke="#8884d8"
          strokeDasharray="3 3"
          label={`${level.level * 100}%`}
        />
      ))}
    </>
  )
}

