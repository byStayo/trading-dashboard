interface EconomicEvent {
  id: string
  date: string
  time: string
  currency: string
  event: string
  importance: "low" | "medium" | "high"
  actual: string
  forecast: string
  previous: string
}

interface GetEconomicEventsParams {
  from: Date
  to: Date
  importance?: string
}

export async function getEconomicEvents({ from, to, importance }: GetEconomicEventsParams): Promise<EconomicEvent[]> {
  // TODO: Replace with actual API call
  // This is a mock implementation
  const mockEvents: EconomicEvent[] = [
    {
      id: "1",
      date: "2024-03-15",
      time: "08:30",
      currency: "USD",
      event: "US Initial Jobless Claims",
      importance: "high",
      actual: "260K",
      forecast: "261K",
      previous: "259K"
    },
    {
      id: "2",
      date: "2024-03-15",
      time: "12:30",
      currency: "EUR",
      event: "ECB Interest Rate Decision",
      importance: "high",
      actual: "3.50%",
      forecast: "3.50%",
      previous: "3.25%"
    },
    {
      id: "3",
      date: "2024-03-16",
      time: "04:00",
      currency: "CNY",
      event: "China Industrial Production YoY",
      importance: "medium",
      actual: "3.6%",
      forecast: "3.6%",
      previous: "5.6%"
    },
    {
      id: "4",
      date: "2024-03-16",
      time: "08:30",
      currency: "USD",
      event: "US Retail Sales MoM",
      importance: "high",
      actual: "0.2%",
      forecast: "0.2%",
      previous: "0.4%"
    },
    {
      id: "5",
      date: "2024-03-17",
      time: "10:00",
      currency: "EUR",
      event: "Eurozone CPI YoY",
      importance: "high",
      actual: "6.1%",
      forecast: "6.1%",
      previous: "7.0%"
    }
  ]

  // Filter events based on date range and importance
  return mockEvents.filter(event => {
    const eventDate = new Date(event.date)
    const isInDateRange = eventDate >= from && eventDate <= to
    const matchesImportance = !importance || importance === "all" || event.importance === importance
    return isInDateRange && matchesImportance
  })
} 