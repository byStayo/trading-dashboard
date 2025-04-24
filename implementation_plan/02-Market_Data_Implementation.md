# Abacus Terminal: Market Data Implementation

## Overview

The Market Data service is the beating heart of the Abacus Terminal, providing real-time and historical financial data needed by all other components. This implementation guide addresses the current gaps in the Polygon.io integration, enhances caching strategies, and establishes a robust foundation for reliable market data delivery.

## Goals

- Upgrade to real-time Polygon.io data streams
- Implement comprehensive WebSocket connection management
- Enhance caching and data distribution mechanisms
- Implement fallback strategies for API outages
- Support batch operations to minimize API usage
- Establish monitoring for data quality and freshness

## Implementation Checklist

### 1. Polygon.io Integration Enhancement

- [ ] **Upgrade Polygon.io Subscription**
  - Upgrade from "Starter" to "Developer" tier for real-time data access
  - Update API key management to support the new tier
  - Document rate limits and data access capabilities

- [ ] **Complete WebSocket Implementation**
  - Enhance `polygon-client.ts` to support all data channels:
    ```typescript
    // Example WebSocket channels to implement
    const stockChannels = [
      'T.*',      // All trades
      'Q.*',      // All quotes
      'A.*',      // All aggregates (second-by-second)
      'AM.*',     // All minute aggregates
    ];
    ```
  - Implement reconnection logic with exponential backoff
  - Add heartbeat mechanism to detect stale connections
  - Implement proper connection pooling for high-volume symbols

- [ ] **REST API Integration Optimization**
  - Refactor to support all necessary endpoints:
    ```typescript
    // Example endpoints to implement
    type PolygonEndpoint =
      | 'v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}'
      | 'v3/reference/tickers/{ticker}'
      | 'v2/snapshot/locale/us/markets/stocks/tickers'
      | 'v3/reference/dividends'
      | 'v1/meta/symbols/{symbol}/company'
      | 'v3/reference/splits'
      | 'v2/calendar/earnings';
    ```
  - Implement request batching for multiple symbols
  - Add comprehensive error handling with specific error types
  - Support pagination for large result sets

### 2. Data Caching Enhancement

- [ ] **Implement Multi-Level Cache Strategy**
  - Configure cache TTL based on data type:
    ```typescript
    const CACHE_TTL_CONFIG = {
      TICK_DATA: 1000 * 10,         // 10 seconds
      MINUTE_BARS: 1000 * 60,       // 1 minute
      DAILY_BARS: 1000 * 60 * 60,   // 1 hour
      COMPANY_INFO: 1000 * 60 * 60 * 24, // 1 day
      MARKET_STATUS: 1000 * 30,     // 30 seconds
    };
    ```
  - Implement LRU cache for frequently accessed symbols
  - Configure cache prewarming for watchlist symbols
  - Add cache invalidation based on trading hours

- [ ] **Redis Caching Architecture**
  - Implement Redis Streams for real-time data distribution
  - Configure Redis Pub/Sub for client notifications
  - Set up Redis cluster for high availability
  - Implement data compression for large datasets

### 3. Centralized Market Data Service

- [ ] **Implement Market Data Provider**
  ```typescript
  // Example Market Data Provider interface
  interface MarketDataProvider {
    // Real-time methods
    subscribeTrades(symbol: string, callback: TradeCallback): Subscription;
    subscribeQuotes(symbol: string, callback: QuoteCallback): Subscription;
    subscribeAggregates(symbol: string, callback: AggregateCallback): Subscription;
    
    // Historical methods
    getHistoricalBars(symbol: string, timeframe: Timeframe, from: Date, to: Date): Promise<Bar[]>;
    getCompanyInfo(symbol: string): Promise<CompanyInfo>;
    getEarningsCalendar(from: Date, to: Date): Promise<EarningsEvent[]>;
    
    // Batch methods
    batchGetSnapshots(symbols: string[]): Promise<SymbolSnapshot[]>;
  }
  ```

- [ ] **Implement Event-Driven Architecture**
  - Create event bus for market data distribution
  - Implement subscribers for various data types
  - Configure topic-based message routing
  - Add replay functionality for missed messages

### 4. Data Validation and Normalization

- [ ] **Implement Data Validation**
  - Create Zod schemas for all data types:
    ```typescript
    // Example Zod schema for trade data
    const TradeSchema = z.object({
      symbol: z.string(),
      price: z.number().positive(),
      size: z.number().int().positive(),
      timestamp: z.number().int().positive(),
      exchange: z.string(),
      conditions: z.array(z.string()),
      id: z.string(),
    });
    ```
  - Add validation at service boundaries
  - Implement logging for validation failures
  - Create fallback strategies for invalid data

- [ ] **Data Normalization**
  - Normalize symbol formats (uppercase, handle special characters)
  - Standardize timestamp formats (Unix timestamp in milliseconds)
  - Implement exchange code normalization
  - Handle extended hours data appropriately

### 5. Rate Limiting and Throttling

- [ ] **Enhance Rate Limiter**
  - Implement tiered rate limits based on data type:
    ```typescript
    // Example rate limit configuration
    const RATE_LIMITS = {
      SNAPSHOT: { points: 100, duration: 60 },   // 100 requests per minute
      HISTORICAL: { points: 50, duration: 60 },  // 50 requests per minute
      REFERENCE: { points: 300, duration: 60 },  // 300 requests per minute
    };
    ```
  - Add request prioritization based on data criticality
  - Implement token bucket algorithm for precise rate limiting
  - Configure circuit breakers for API protection

- [ ] **Request Optimization Strategies**
  - Implement request coalescing for identical requests
  - Add request deduplication
  - Configure request queuing with priority
  - Implement backpressure mechanisms

### 6. Real-Time Data Distribution

- [ ] **WebSocket API for Clients**
  - Create server-side WebSocket endpoint for clients
  - Implement authentication for WebSocket connections
  - Add channel subscription mechanism
  - Configure message compression for bandwidth optimization

- [ ] **Server-Sent Events Alternative**
  - Implement SSE endpoint for browsers with WebSocket limitations
  - Configure event stream formatting
  - Add reconnection handling
  - Implement event buffering for disconnections

### 7. Market Data Testing Framework

- [ ] **Create Mock Data Provider**
  ```typescript
  // Example mock data provider
  class MockMarketDataProvider implements MarketDataProvider {
    private readonly dataGenerator: DataGenerator;
    
    constructor(options: MockProviderOptions) {
      this.dataGenerator = new DataGenerator(options);
    }
    
    // Implement all methods using the data generator
    // ...
  }
  ```

- [ ] **Record and Replay System**
  - Implement data recording functionality
  - Create deterministic replay capability
  - Add time compression/expansion for testing
  - Support scenario-based testing

## Technical Requirements

### Data Models

```typescript
// Essential data models to implement
interface Trade {
  symbol: string;
  price: number;
  size: number;
  timestamp: number;
  exchange: string;
  conditions: string[];
  id: string;
}

interface Quote {
  symbol: string;
  bidPrice: number;
  bidSize: number;
  askPrice: number;
  askSize: number;
  timestamp: number;
  exchange: string;
}

interface Bar {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  vwap?: number;
  transactions?: number;
}

interface CompanyInfo {
  symbol: string;
  name: string;
  description: string;
  exchange: string;
  industry: string;
  sector: string;
  marketCap: number;
  employees: number;
  website: string;
  headquarters: string;
  foundedYear: number;
  ceo: string;
}
```

### Architecture

```
[Polygon.io API] → [Market Data Service] → [Redis Cache]
                                              ↓
[Client] ← [WebSocket API] ← [Event Distribution System]
```

## Dependencies

- Polygon.io API key (Developer tier or higher)
- Redis instance configured for caching
- WebSocket server capability
- Event distribution system
- Zod for schema validation

## Implementation Steps

1. Upgrade Polygon.io subscription and update API key management
2. Enhance WebSocket client implementation with improved error handling
3. Implement comprehensive cache strategy with Redis
4. Create centralized market data provider
5. Develop data validation and normalization pipeline
6. Enhance rate limiting and request optimization
7. Implement real-time data distribution
8. Create market data testing framework

## Best Practices

- Implement circuit breakers for all external API calls
- Cache aggressively but with appropriate invalidation strategies
- Validate all incoming data before processing
- Use structured logging for debugging and monitoring
- Implement comprehensive metrics for performance monitoring
- Design for horizontal scalability from the start

## Resources

- [Polygon.io API Documentation](https://polygon.io/docs)
- [WebSocket Best Practices](https://websockets.readthedocs.io/en/stable/intro.html)
- [Redis Documentation](https://redis.io/documentation)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Rate Limiting Algorithms](https://konghq.com/blog/how-to-design-a-scalable-rate-limiting-algorithm/)
