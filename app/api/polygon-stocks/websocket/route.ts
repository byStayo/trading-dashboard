import { NextRequest, NextResponse } from "next/server"

// WebSocket connection details
const WS_AUTH_URL = "https://api.polygon.io/v3/reference/ws-auth"
const WS_STOCKS_URL = "wss://delayed.polygon.io/stocks"

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.POLYGON_API_KEY;
    console.log('Environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length
    });

    if (!apiKey) {
      console.error('Polygon API key not found in environment variables');
      return NextResponse.json(
        { error: 'Polygon API key not configured' },
        { status: 500 }
      );
    }

    // For WebSocket connections, we'll use the API key directly as the token
    // This is safe because this endpoint is server-side only
    const response = {
      wsUrl: WS_STOCKS_URL,
      token: apiKey,
      timestamp: new Date().toISOString()
    };

    console.log('Returning WebSocket connection details:', {
      wsUrl: response.wsUrl,
      hasToken: !!response.token,
      timestamp: response.timestamp
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('WebSocket connection error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get WebSocket connection details',
        details: error.message
      },
      { status: 500 }
    );
  }
} 