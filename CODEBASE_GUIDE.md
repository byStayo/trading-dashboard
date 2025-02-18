# Trading Dashboard Codebase Guide

## Project Structure Overview

### Core Directories

1. **/app**
   - Next.js app router structure
   - Key API routes and page components
   ```
   /app
   ├── api/                    # Backend API endpoints
   │   ├── polygon-stocks/     # Polygon.io stock endpoints
   │   ├── stock/             # Stock-related endpoints
   │   └── polygon-news/      # News API endpoints
   ├── layout.tsx             # Root layout
   └── page.tsx               # Main dashboard page
   ```

2. **/components**
   - Reusable UI components
   - Feature-specific components
   ```
   /components
   ├── live-ticker-bar/       # Real-time stock ticker display
   ├── market-overview/       # Market overview dashboard
   ├── market-status-header/  # Market status information
   └── live-market-data/      # Real-time market data display
   ```

3. **/lib**
   - Core business logic
   - Utility functions
   - Custom hooks
   ```
   /lib
   ├── api/                   # API service implementations
   │   ├── polygon-service.ts # Polygon.io service
   │   └── polygon-websocket.ts # WebSocket implementation
   ├── hooks/                 # Custom React hooks
   │   ├── use-market-data.ts  # Centralized market data store
   │   ├── use-market-indices.ts
   │   └── use-stock-websocket.ts
   └── utils/                 # Utility functions
       └── rate-limiter.ts
   ```

4. **/types**
   - TypeScript type definitions
   ```
   /types
   ├── polygon.ts             # Polygon.io related types
   └── api.ts                 # General API types
   ```

## Key Files and Their Purposes

### API Integration
- `lib/api/polygon-service.ts`
  - Central service for Polygon.io REST API calls
  - Implements caching and rate limiting
  - Used for historical and snapshot data

- `lib/api/polygon-websocket.ts`
  - WebSocket connection management
  - Real-time data streaming
  - Connection resilience

### State Management
- `lib/hooks/use-market-data.ts`
  - Centralized Zustand store for market data
  - Handles data caching and updates
  - Provides hooks for components to access data
  - Manages data freshness and updates

### Frontend Components
- `components/live-ticker-bar.tsx`
  - Real-time stock ticker display
  - Uses centralized market data store
  - Implements WebSocket updates
  - Handles data staleness

- `components/market-overview.tsx`
  - Market overview dashboard
  - Aggregates multiple data sources
  - Implements caching strategies

### Backend Routes
- `app/api/polygon-stocks/batch/route.ts`
  - Batch stock data retrieval
  - Implements rate limiting
  - Caches responses

- `app/api/stock/prev/[symbol]/route.ts`
  - Previous day's stock data
  - Symbol-specific caching
  - Error handling implementation

## Common Modification Patterns

### Adding a New Feature

1. **New UI Component**
   - Add to `/components`
   - Use existing hooks from `/lib/hooks`
   - Follow patterns in similar components

2. **New API Endpoint**
   - Add to `/app/api`
   - Use PolygonService from `/lib/api`
   - Implement caching and rate limiting

3. **New Data Type**
   - Add to `/types`
   - Update relevant service interfaces

### Modifying Existing Features

1. **UI Changes**
   - Locate component in `/components`
   - Check for shared components
   - Update related tests

2. **API Changes**
   - Check `/app/api` for endpoint
   - Review caching strategy
   - Update error handling

3. **Data Flow Changes**
   - Review affected hooks in `/lib/hooks`
   - Update WebSocket subscriptions if needed
   - Verify cache invalidation

## Common Implementation Scenarios

### 1. Adding Real-time Stock Data
```typescript
// 1. Access market data in component
import { useMarketData } from '@/lib/hooks/use-market-data'

const StockDisplay = ({ symbol }: { symbol: string }) => {
  const { data, isLoading } = useMarketData(symbol)
  return <PriceDisplay data={data[symbol]} />
}

// 2. Handle real-time updates
const LiveStockData = ({ symbol }: { symbol: string }) => {
  const { data, updateData } = useMarketData(symbol)
  useStockWebSocket({
    symbols: [symbol],
    onUpdate: (update) => updateData(symbol, update)
  })
  return <LiveDisplay data={data[symbol]} />
}
```

### 2. Batch Data Management
```typescript
// 1. Fetch multiple symbols
const MarketOverview = ({ symbols }: { symbols: string[] }) => {
  const { data, isLoading } = useMarketData(symbols)
  const { fetchData } = useMarketDataFetcher(symbols)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [symbols])

  return <Overview data={data} />
}
```

### 3. Enhanced Error Handling
```typescript
// 1. Update error boundaries in components
// 2. Enhance error handling in services
// 3. Implement fallback UI states
```

## Testing Considerations

### Unit Tests
- Component tests in `__tests__` directories
- Service tests alongside implementations
- Mock WebSocket connections

### Integration Tests
- API route testing
- WebSocket integration
- Cache behavior verification

## Performance Optimization

### Caching Strategy
- REST API responses cached in PolygonService
- WebSocket data managed through subscriptions
- Browser caching for static assets

### Rate Limiting
- Implemented in PolygonService
- Batch requests when possible
- Queue management for concurrent requests

## Troubleshooting Guide

### WebSocket Issues
1. Check connection in polygon-websocket.ts
2. Verify subscription patterns
3. Review error handling

### API Issues
1. Check rate limiting in PolygonService
2. Verify cache implementation
3. Review error handling patterns

### UI Issues
1. Check component error boundaries
2. Verify data flow through hooks
3. Review loading states

## Documentation Updates

When modifying the codebase:
1. Update relevant README files
2. Document new patterns
3. Update type definitions
4. Maintain API documentation

## Best Practices

1. **Code Organization**
   - Follow established directory structure
   - Maintain separation of concerns
   - Use appropriate file naming conventions

2. **Data Management**
   - Use centralized services
   - Implement proper caching
   - Handle errors gracefully

3. **Performance**
   - Optimize bundle size
   - Implement efficient caching
   - Use proper memoization

4. **Security**
   - Keep API keys secure
   - Validate input data
   - Implement proper authentication

Remember: This guide should be used in conjunction with API_Architecture.md, Integration_Guide.md, and POLYGON_INTEGRATION.md for a complete understanding of the system. 