import { AggregatesResponse } from '../services/polygon-service'

export interface TechnicalIndicators {
  sma: number[]
  ema: number[]
  rsi: number[]
  macd: {
    macd: number[]
    signal: number[]
    histogram: number[]
  }
  volume: number[]
  priceChange: number[]
  priceChangePercent: number[]
}

export function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = []
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(NaN)
      continue
    }
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    sma.push(sum / period)
  }
  return sma
}

export function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = []
  const multiplier = 2 / (period + 1)

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      ema.push(prices[0])
      continue
    }
    ema.push((prices[i] - ema[i - 1]) * multiplier + ema[i - 1])
  }
  return ema
}

export function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = []
  const gains: number[] = []
  const losses: number[] = []

  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? -change : 0)
  }

  // Calculate initial averages
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period

  // Calculate RSI
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(NaN)
      continue
    }

    if (i > period) {
      avgGain = (avgGain * (period - 1) + gains[i - 1]) / period
      avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period
    }

    const rs = avgGain / avgLoss
    rsi.push(100 - (100 / (1 + rs)))
  }

  return rsi
}

export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[], signal: number[], histogram: number[] } {
  const fastEMA = calculateEMA(prices, fastPeriod)
  const slowEMA = calculateEMA(prices, slowPeriod)
  const macd = fastEMA.map((fast, i) => fast - slowEMA[i])
  const signal = calculateEMA(macd, signalPeriod)
  const histogram = macd.map((value, i) => value - signal[i])

  return { macd, signal, histogram }
}

export function calculateTechnicalIndicators(data: AggregatesResponse): TechnicalIndicators {
  const prices = data.results.map(bar => bar.c)
  const volumes = data.results.map(bar => bar.v)
  
  // Calculate price changes
  const priceChange = prices.map((price, i) => 
    i === 0 ? 0 : price - prices[i - 1]
  )
  
  const priceChangePercent = prices.map((price, i) => 
    i === 0 ? 0 : ((price - prices[i - 1]) / prices[i - 1]) * 100
  )

  return {
    sma: calculateSMA(prices, 20),
    ema: calculateEMA(prices, 20),
    rsi: calculateRSI(prices),
    macd: calculateMACD(prices),
    volume: volumes,
    priceChange,
    priceChangePercent
  }
} 