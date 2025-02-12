import { Configuration, OpenAIApi } from "openai-edge"
import { NextResponse } from "next/server"

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config)

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are a market analysis assistant that provides insights about market movements and trends.",
        },
        ...messages,
      ],
    })

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error("Market updates error:", error)
    return NextResponse.json({ error: "Failed to generate market updates" }, { status: 500 })
  }
}

