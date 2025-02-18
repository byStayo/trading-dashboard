# Polygon.io Integration Guide

## Overview
This guide details how to integrate Polygon.io's REST and WebSocket APIs with our trading dashboard's centralized market data store.

## Architecture
All Polygon.io data flows through our centralized market data store:

```
[Polygon REST API] ─┐
                    ├─> [Market Data Store] ─> [UI Components]
[Polygon WebSocket] ┘
```

## Data Flow
1. Components request data via `useMarketData` hook
2. Store checks for fresh data
3. If stale/missing, fetches from Polygon
4. Real-time updates flow through WebSocket to store

## Implementation

### 1. REST API Integration

```typescript
// In lib/hooks/use-market-data.ts
const fetchPolygonData = async (symbol: string): Promise<MarketData> => {
  const response = await fetch(`/api/polygon/v2/aggs/ticker/${symbol}/prev`)
  if (!response.ok) throw new Error('Failed to fetch from Polygon')
  return response.json()
}

// Usage in components via the store
const { data, isLoading } = useMarketData('AAPL')
```

### 2. WebSocket Integration

```typescript
// In lib/hooks/use-stock-websocket.ts
export const useStockWebSocket = (config: WebSocketConfig) => {
  const { updateData } = useMarketData()
  
  useEffect(() => {
    const ws = new WebSocket('wss://socket.polygon.io/stocks')
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      updateData(data.symbol, data)
    }
    
    return () => ws.close()
  }, [])
}
```

### 3. Error Handling

```typescript
// In lib/hooks/use-market-data.ts
const { data, error, isLoading } = useMarketData('AAPL')

if (error?.includes('POLYGON_API_KEY')) {
  // Handle authentication errors
}

if (error?.includes('RATE_LIMIT')) {
  // Handle rate limiting
}
```

## API Reference

### REST Endpoints
All REST endpoints are accessed through the market data store:

```typescript
// ✅ Do: Use the store
const { data } = useMarketData('AAPL')

// ❌ Don't: Call Polygon directly
const response = await fetch('/api/polygon/...')
```

### WebSocket Channels
WebSocket subscriptions are managed through the store:

```typescript
// ✅ Do: Use the store's WebSocket integration
const { data } = useMarketData(['AAPL', 'MSFT'])
useStockWebSocket({ symbols: ['AAPL', 'MSFT'] })

// ❌ Don't: Manage WebSocket connections separately
const ws = new WebSocket('wss://socket.polygon.io/stocks')
```

## Rate Limiting
The market data store handles rate limiting automatically:
- Batches requests when possible
- Implements exponential backoff
- Caches responses appropriately

## Authentication
API keys are managed securely through environment variables:
```env
POLYGON_API_KEY=your_api_key_here
```

Never expose API keys in client-side code. All requests should go through the market data store.

## Testing
Test components using the market data store's mock capabilities:

```typescript
// In your test file
import { mockMarketData } from '@/lib/hooks/use-market-data'

beforeEach(() => {
  mockMarketData({
    AAPL: { price: 150.00, volume: 1000000 }
  })
})
```

## Troubleshooting

### Common Issues

1. Stale Data
```typescript
// Solution: Force a refresh
const { fetchData } = useMarketDataFetcher('AAPL')
await fetchData()
```

2. WebSocket Disconnects
```typescript
// Solution: The store handles reconnection automatically
const { data } = useMarketData('AAPL')
useStockWebSocket({ symbols: ['AAPL'] })
```

3. Rate Limiting
```typescript
// Solution: Use batch updates
const { updateBatchData } = useMarketData()
updateBatchData({
  AAPL: newData,
  MSFT: newData
})
```

## Best Practices

1. Always use the market data store
2. Implement proper error handling
3. Use batch operations when possible
4. Monitor data freshness
5. Test with mock data

## Migration Guide

### Migrating from Direct API Calls

Before:
```typescript
const [data, setData] = useState(null)
useEffect(() => {
  fetch('/api/polygon/...').then(setData)
}, [])
```

After:
```typescript
const { data, isLoading } = useMarketData('AAPL')
```

### Migrating WebSocket Usage

Before:
```typescript
const ws = new WebSocket('wss://socket.polygon.io/stocks')
ws.onmessage = (event) => {
  // Handle updates
}
```

After:
```typescript
const { data } = useMarketData(['AAPL', 'MSFT'])
useStockWebSocket({
  symbols: ['AAPL', 'MSFT']
})
``` 