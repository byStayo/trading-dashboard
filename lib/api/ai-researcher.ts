import { EconomicData, Alert } from "@/types/ai-researcher"
import { mockEconomicData, mockAlerts } from "./mock-data"

export async function getEconomicData(): Promise<EconomicData> {
  // In a real application, this would fetch data from an API
  return mockEconomicData
}

type AlertCallback = (alert: Alert) => void

export function subscribeToAlerts(callback: AlertCallback): () => void {
  // Simulate real-time alerts every 30 seconds
  const intervalId = setInterval(() => {
    const randomAlert = mockAlerts[Math.floor(Math.random() * mockAlerts.length)]
    callback(randomAlert)
  }, 30000)

  return () => clearInterval(intervalId)
}

