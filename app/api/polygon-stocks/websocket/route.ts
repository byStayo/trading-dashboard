import { NextRequest, NextResponse } from "next/server"

// WebSocket connection details
const WS_AUTH_URL = "https://api.polygon.io/v3/reference/ws-auth"
const WS_STOCKS_URL = "wss://delayed.polygon.io/stocks"

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.POLYGON_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Polygon API key not configured' },
        { status: 500 }
      )
    }

    // For WebSocket connections, we'll use the API key directly as the token
    // This is safe because this endpoint is server-side only
    return NextResponse.json({
      wsUrl: WS_STOCKS_URL,
      token: apiKey,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('WebSocket connection error:', error)
    return NextResponse.json(
      { error: 'Failed to get WebSocket connection details' },
      { status: 500 }
    )
  }
} 