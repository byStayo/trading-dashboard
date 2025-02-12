import { NextResponse } from "next/server"
import { polygonService } from "@/lib/api/polygon-service"

export async function GET() {
  try {
    // Try a simple API call to verify the key works
    const response = await polygonService.getAggregates(
      'AAPL',
      1,
      'day',
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    )
    
    if (!response.results || response.results.length === 0) {
      throw new Error('No data returned from Polygon API')
    }

    return NextResponse.json({
      status: "success",
      message: "Polygon.io API key is working",
      data: response.results[0]
    })

  } catch (error: any) {
    console.error(`Test failed: ${error.message}`)
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to verify API key"
      },
      { status: 500 }
    )
  }
} 