import { NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "edge"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Centralized market news generation
export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are a financial market expert providing real-time market analysis and insights. Focus on providing actionable insights and clear market explanations.",
        },
        ...messages,
      ],
    })

    // Convert the response into a friendly text-stream
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || ""
          if (text) {
            const queue = new TextEncoder().encode(text)
            controller.enqueue(queue)
          }
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Market chat error:", error)
    return NextResponse.json({ error: "Failed to generate market updates" }, { status: 500 })
  }
}

