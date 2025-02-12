interface WeatherDisplayProps {
  location: string
  currentTemp: number
  condition: string
  forecast: Array<{
    hour: string
    temp: number
  }>
}

export function WeatherDisplay({ location, currentTemp, condition, forecast }: WeatherDisplayProps) {
  return (
    <div className="rounded-lg bg-sky-100 dark:bg-sky-900 p-4 my-2">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{location}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{currentTemp}°</span>
          <span className="text-sm text-muted-foreground">{condition}</span>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {forecast.map((period) => (
          <div key={period.hour} className="text-center min-w-[60px]">
            <div className="text-sm text-muted-foreground">{period.hour}</div>
            <div className="font-medium">{period.temp}°</div>
          </div>
        ))}
      </div>
    </div>
  )
}

