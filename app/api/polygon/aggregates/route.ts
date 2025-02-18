import { NextRequest, NextResponse } from 'next/server'
import { PolygonService } from '@/lib/api/polygon-service'
import { z } from 'zod'

// Request validation schema
const RequestSchema = z.object({
  ticker: z.string().min(1).max(10),
  multiplier: z.coerce.number().int().positive(),
  timespan: z.enum(['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year']),
  from: z.coerce.date(),
  to: z.coerce.date(),
  adjusted: z.coerce.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      ticker: searchParams.get('ticker'),
      multiplier: searchParams.get('multiplier'),
      timespan: searchParams.get('timespan'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      adjusted: searchParams.get('adjusted'),
    }

    // Validate and parse request parameters
    const validatedParams = RequestSchema.parse({
      ...params,
      adjusted: params.adjusted === 'true',
    })

    const polygonService = new PolygonService()
    const range = PolygonService.formatDateRange(validatedParams.from, validatedParams.to)

    const data = await polygonService.getAggregates(
      validatedParams.ticker,
      validatedParams.multiplier,
      validatedParams.timespan,
      range.from.toISOString().split('T')[0],
      range.to.toISOString().split('T')[0],
      validatedParams.adjusted
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching aggregates:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch aggregates data' },
      { status: 500 }
    )
  }
} 