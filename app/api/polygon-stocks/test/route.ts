import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.POLYGON_API_KEY
    if (!apiKey) {
      throw new Error("Polygon API key not set")
    }

    // Try a simple API call to verify the key works
    const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/AAPL/prev?adjusted=true&apiKey=${apiKey}`)
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      status: "success",
      message: "Polygon.io API key is working",
      data: data.results?.[0] || null
    })

  } catch (error: any) {
    console.error(`Test failed: ${error.message}`)
    return NextResponse.json(
      {
        status: "error",
        message: error.message
      },
      { status: 500 }
    )
  }
} 