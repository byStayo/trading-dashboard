import OpenAI from "openai"
import { NextResponse } from "next/server"

export const runtime = "edge"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are a data visualization expert that generates chart configurations based on user requests. Focus on creating clear, insightful visualizations that effectively communicate data patterns.",
        },
        {
          role: "user",
          content: prompt,
        },
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
    console.error("Visualization generation error:", error)
    return NextResponse.json({ error: "Failed to generate visualization" }, { status: 500 })
  }
} 