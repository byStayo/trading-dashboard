import { NextRequest, NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/services/market-data-service';
import { rateLimitManager } from '@/lib/utils/rate-limiter';

// Rate limiting configuration
const RATE_LIMIT = {
  TOKENS_PER_INTERVAL: 20,
  INTERVAL: 'minute' as const,
  MAX_SYMBOLS: 50,
};

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = await rateLimitManager.checkRateLimit(ip, '/api/market-data/batch', {
      tokensPerInterval: RATE_LIMIT.TOKENS_PER_INTERVAL,
      interval: RATE_LIMIT.INTERVAL,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter?.toString() || '60',
          },
        }
      );
    }

    // Get and validate symbols
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',').map((s) => s.trim()) || [];

    if (!symbols.length) {
      return NextResponse.json(
        { error: 'No symbols provided' },
        { status: 400 }
      );
    }

    if (symbols.length > RATE_LIMIT.MAX_SYMBOLS) {
      return NextResponse.json(
        { error: `Too many symbols. Maximum is ${RATE_LIMIT.MAX_SYMBOLS}.` },
        { status: 400 }
      );
    }

    // Get market data
    const marketDataService = MarketDataService.getInstance();
    const data = await marketDataService.getBatchMarketData(symbols);

    return NextResponse.json({
      data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error in market-data/batch:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch market data',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = await rateLimitManager.checkRateLimit(ip, '/api/market-data/batch', {
      tokensPerInterval: RATE_LIMIT.TOKENS_PER_INTERVAL,
      interval: RATE_LIMIT.INTERVAL,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter?.toString() || '60',
          },
        }
      );
    }

    // Get and validate request body
    const body = await request.json();
    const symbols = Array.isArray(body.symbols) ? body.symbols : [];

    if (!symbols.length) {
      return NextResponse.json(
        { error: 'No symbols provided' },
        { status: 400 }
      );
    }

    if (symbols.length > RATE_LIMIT.MAX_SYMBOLS) {
      return NextResponse.json(
        { error: `Too many symbols. Maximum is ${RATE_LIMIT.MAX_SYMBOLS}.` },
        { status: 400 }
      );
    }

    // Get market data
    const marketDataService = MarketDataService.getInstance();
    const data = await marketDataService.getBatchMarketData(symbols);

    return NextResponse.json({
      data,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error in market-data/batch:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch market data',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
} 