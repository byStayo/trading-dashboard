import { Configuration, OpenAIApi } from 'openai-edge'

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

// Set the runtime to edge for best performance
export const runtime = 'edge'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  // Ask OpenAI for a completion given the prompt
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant that generates chart data. Always respond with valid JSON in the following format:
        {
          "title": "Chart Title",
          "description": "Chart Description",
          "data": [
            {
              "date": "2024-01-01",
              "value1": number,
              "value2": number,
              ...
            }
          ]
        }`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 800
  })

  // Get the response data
  const data = await response.json()

  // Return the completion
  return new Response(JSON.stringify(data.choices[0].message.content), {
    headers: { 'Content-Type': 'application/json' }
  })
} 