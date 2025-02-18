import { NextResponse } from 'next/server';

// Default list of popular tech stocks
const DEFAULT_SYMBOLS = [
  'AAPL',  // Apple
  'MSFT',  // Microsoft
  'GOOGL', // Alphabet
  'AMZN',  // Amazon
  'META',  // Meta
  'NVDA',  // NVIDIA
  'TSLA',  // Tesla
  'AMD',   // AMD
  'INTC',  // Intel
  'NFLX'   // Netflix
];

export async function GET() {
  try {
    // In a real implementation, you might want to fetch this from a market data API
    // For now, we'll return a static list of popular tech stocks
    return NextResponse.json({
      symbols: DEFAULT_SYMBOLS,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching trending tickers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending tickers' },
      { status: 500 }
    );
  }
} 