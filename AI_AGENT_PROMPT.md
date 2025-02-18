# AI Agent Instructions for Trading Dashboard Implementation

## Documentation Suite
When implementing or modifying features in the trading dashboard, refer to these documents in the following order:

1. **API_Architecture.md**
   - Primary reference for overall system design
   - Defines centralized data store and state management
   - Details the Zustand-based market data store
   - Outlines how to avoid redundant state and API calls

2. **Integration_Guide.md**
   - General integration patterns and best practices
   - Frontend-Backend connection guidelines
   - Data contract definitions
   - Error handling patterns
   - Testing requirements checklist

3. **POLYGON_INTEGRATION.md**
   - Specific Polygon.io implementation details
   - WebSocket and REST API integration patterns
   - Concrete code examples and patterns
   - Security and monitoring guidelines

## Implementation Rules

### 1. Data Management
- ALWAYS use the centralized market data store via `useMarketData` hook
- NEVER maintain separate market data state in components
- ALWAYS handle data staleness as defined in API_Architecture.md
- USE the WebSocket manager for real-time updates through the store

### 2. State Updates
- IMPLEMENT all state update patterns from MODIFICATION_PATTERNS.md
- USE batch updates when handling multiple symbols
- INCLUDE proper data freshness checks
- FOLLOW the store update patterns for real-time data

### 3. Error Handling
- IMPLEMENT all error handling patterns from Integration_Guide.md
- USE fallback mechanisms when API calls fail
- INCLUDE proper error boundaries in React components
- FOLLOW the retry strategies for failed requests

### 4. Security
- NEVER expose API keys in client-side code
- ALWAYS use environment variables for sensitive data
- IMPLEMENT proper authentication checks
- FOLLOW rate limiting guidelines

### 5. Testing
- VERIFY against the Integration Checklist before completing implementation
- TEST both success and error scenarios
- INCLUDE performance testing for data-heavy operations
- VALIDATE WebSocket reconnection logic

## Implementation Process

1. **Planning Phase**
   - Review API_Architecture.md for system design patterns
   - Check Integration_Guide.md for relevant integration patterns
   - Reference POLYGON_INTEGRATION.md for specific implementation details

2. **Development Phase**
   - Follow the centralized service pattern
   - Implement proper error handling
   - Use provided TypeScript interfaces and types
   - Follow WebSocket management patterns

3. **Testing Phase**
   - Use the Integration Checklist from Integration_Guide.md
   - Verify error handling scenarios
   - Test WebSocket reconnection
   - Validate caching behavior

4. **Review Phase**
   - Ensure compliance with all architectural patterns
   - Verify security considerations
   - Check performance metrics
   - Validate documentation updates

## Example Usage

When implementing a new feature that requires market data:

1. Check API_Architecture.md for:
   - Market data store structure
   - Data flow patterns
   - State management patterns

2. Reference MODIFICATION_PATTERNS.md for:
   - State update patterns
   - Data freshness management
   - Real-time update patterns

3. Use Integration_Guide.md for:
   - Component integration patterns
   - Store usage examples
   - Error handling patterns

## Implementation Examples

### 1. Basic Market Data Usage
```typescript
// ✅ Do: Use the centralized store
const GoodComponent = () => {
  const { data, isLoading } = useMarketData('AAPL')
  return <Display data={data.AAPL} />
}

// ❌ Don't: Maintain separate state
const BadComponent = () => {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/market/AAPL').then(setData)
  }, [])
}
```

### 2. Real-time Updates
```typescript
// ✅ Do: Update through the store
const GoodLiveComponent = () => {
  const { data, updateData } = useMarketData('AAPL')
  useStockWebSocket({
    symbols: ['AAPL'],
    onUpdate: (update) => updateData('AAPL', update)
  })
}

// ❌ Don't: Manage WebSocket state separately
const BadLiveComponent = () => {
  const [data, setData] = useState(null)
  useWebSocket(/* ... */)
}
```

### 3. Batch Operations
```typescript
// ✅ Do: Use batch updates
const GoodBatchComponent = ({ symbols }) => {
  const { data, updateBatchData } = useMarketData(symbols)
  const { fetchData } = useMarketDataFetcher(symbols)
  
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [symbols])
}
```

## Error Resolution

If encountering issues:

1. Check Integration_Guide.md for common integration patterns
2. Reference POLYGON_INTEGRATION.md for specific error handling examples
3. Verify against API_Architecture.md for architectural compliance

## Maintenance

When updating existing features:

1. Review API_Architecture.md for architectural impact
2. Check Integration_Guide.md for breaking changes
3. Update according to POLYGON_INTEGRATION.md patterns

## Documentation Updates

When making changes:

1. Update relevant sections in all three documents
2. Maintain version history
3. Add new patterns or examples as needed

Remember: These documents work together as a complete reference system. No implementation should bypass the patterns and practices defined in these guides. 