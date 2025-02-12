import { tool } from "ai"
import { z } from "zod"

export const weatherTool = tool({
  name: "getWeather",
  description: "Get the current weather for a location",
  parameters: z.object({
    location: z.string().describe("The location to get weather information for"),
  }),
  execute: async ({ location }) => {
    // Simulated weather data - in production, replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const temperatures = Array.from({ length: 7 }, (_, i) => ({
      hour: `${i + 7}am`,
      temp: Math.floor(Math.random() * 15) + 45, // Random temp between 45-60°F
    }))

    return {
      location,
      currentTemp: temperatures[0].temp,
      condition: "Sunny",
      forecast: temperatures,
    }
  },
})

export const tools = {
  getWeather: weatherTool,
}

