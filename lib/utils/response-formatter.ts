import { NextResponse } from 'next/server';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type MetaExtras = {
  timestamp: number;
  cached?: boolean;
  source?: string;
};

type ResponseMeta = Partial<PaginationMeta> & MetaExtras;

export function formatResponse<T>(
  data: T,
  meta: Partial<ResponseMeta> = { timestamp: Date.now() },
  status: number = 200
): NextResponse {
  const response = {
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: meta.timestamp || Date.now(),
    },
  };

  return NextResponse.json(response, { status });
}

export function formatPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  metaExtras: Partial<MetaExtras> = { timestamp: Date.now() },
  status: number = 200
): NextResponse {
  const meta: ResponseMeta = {
    ...pagination,
    timestamp: metaExtras.timestamp || Date.now(),
    ...(metaExtras.cached !== undefined && { cached: metaExtras.cached }),
    ...(metaExtras.source !== undefined && { source: metaExtras.source }),
  };
  return formatResponse(data, meta, status);
}

export function formatErrorResponse(
  error: string,
  code: string = 'INTERNAL_SERVER_ERROR',
  status: number = 500,
  details?: unknown
): NextResponse {
  const response = {
    success: false,
    error,
    code,
    ...(details && { details }),
    meta: {
      timestamp: Date.now(),
    },
  };

  return NextResponse.json(response, { status });
}

export function formatStreamResponse(
  stream: ReadableStream,
  meta: Partial<ResponseMeta> = { timestamp: Date.now() }
): NextResponse {
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Helper function to calculate pagination metadata
export function calculatePagination(
  total: number,
  page: number = 1,
  limit: number = 10
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
  };
} 