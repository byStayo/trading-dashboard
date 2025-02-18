import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from '../utils/data-validator';
import { z } from 'zod';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function errorHandler(
  error: unknown,
  req: NextRequest
): Promise<NextResponse> {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: error.errors.map(e => e.message),
      },
      { status: 400 }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Default error response
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'INTERNAL_SERVER_ERROR',
    },
    { status: 500 }
  );
} 