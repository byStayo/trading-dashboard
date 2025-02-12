import { tool as createTool } from "ai"
import { z } from "zod"

export const stockNewsTool = createTool({
  description: "Display a stock news article with headline, summary, and source.",
  parameters: z.object({
    id: z.string(),
    headline: z.string(),
    summary: z.string(),
    source: z.string(),
    publishedUtc: z.string().optional(),
  }),
  execute: async ({ headline, summary, source, publishedUtc }) => ({ headline, summary, source, publishedUtc }),
})

export const tools = {
  displayStockNews: stockNewsTool,
}

