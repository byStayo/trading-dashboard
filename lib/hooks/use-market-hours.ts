"use client"

import { useState, useEffect } from "react"

type MarketHours = "pre" | "during" | "after" | "closed"

interface MarketHoursData {
  marketHours: MarketHours
  isLoading: boolean
  isError: boolean
}

export function useMarketHours(): MarketHoursData {
  const [marketHours, setMarketHours] = useState<MarketHours>("closed")
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const fetchMarketHours = async () => {
      try {
        setIsLoading(true)
        // In a real application, you would fetch this data from an API
        // For this example, we'll simulate an API call with a timeout
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const currentTime = new Date()
        const currentHour = currentTime.getUTCHours()

        // Simulating market hours based on UTC time
        // Adjust these times according to your specific market
        if (currentHour >= 13 && currentHour < 14) {
          setMarketHours("pre")
        } else if (currentHour >= 14 && currentHour < 21) {
          setMarketHours("during")
        } else if (currentHour >= 21 && currentHour < 22) {
          setMarketHours("after")
        } else {
          setMarketHours("closed")
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching market hours:", error)
        setIsError(true)
        setIsLoading(false)
      }
    }

    fetchMarketHours()

    // Refresh market hours every minute
    const intervalId = setInterval(fetchMarketHours, 60000)

    return () => clearInterval(intervalId)
  }, [])

  return { marketHours, isLoading, isError }
}

