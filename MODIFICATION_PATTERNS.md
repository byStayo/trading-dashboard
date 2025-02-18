# Trading Dashboard Modification Patterns

## UI Modifications

### 1. Component Styling Updates
```typescript
// Location: /components/{component-name}
// Example: Updating Market Overview styling

// 1. Locate the component
// components/market-overview.tsx
// components/market-overview.module.css

// 2. Identify shared styles
// Check for common styles in:
// - styles/common.css
// - components/shared/styles/

// 3. Update pattern:
const MarketOverview = () => {
  return (
    <div className={styles.container}>
      {/* Update className or style props */}
      <div className={clsx(styles.card, styles.elevated)}>
        {/* Component content */}
      </div>
    </div>
  );
};
```

### 2. Layout Improvements
```typescript
// 1. Check responsive behavior
// - Update breakpoints in tailwind.config.js
// - Modify responsive classes
// - Test across device sizes

// 2. Component structure
const ImprovedLayout = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MarketSection />
      <NewsSection />
      <TradingSection />
    </div>
  );
};

// 3. Performance optimization
const OptimizedComponent = memo(({ data }) => {
  // Implement useMemo for expensive calculations
  const processedData = useMemo(() => processData(data), [data]);
  
  return <ComponentContent data={processedData} />;
});
```

## Feature Enhancements

### 1. Adding New Functionality
```typescript
// 1. Extend existing components
// components/market-overview.tsx
interface EnhancedProps extends BaseProps {
  newFeature: boolean;
  additionalData?: MarketData;
}

// 2. Add new hooks
// lib/hooks/use-enhanced-market-data.ts
const useEnhancedMarketData = (symbol: string) => {
  const baseData = useMarketData(symbol);
  const additionalData = useAdditionalData(symbol);
  
  return useMemo(() => ({
    ...baseData,
    ...additionalData,
    enhanced: combineData(baseData, additionalData)
  }), [baseData, additionalData]);
};

// 3. Update types
// types/market-data.ts
interface EnhancedMarketData extends MarketData {
  newFeatures: NewFeatureType;
  additionalMetrics: Metrics;
}
```

### 2. Performance Improvements
```typescript
// 1. Implement data memoization
const MemoizedComponent = () => {
  const memoizedValue = useMemo(() => 
    expensiveCalculation(props.data),
    [props.data]
  );

  // 2. Add suspense boundaries
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DataComponent data={memoizedValue} />
    </Suspense>
  );
};

// 3. Optimize re-renders
const OptimizedList = memo(({ items }) => {
  return items.map(item => (
    <ListItem 
      key={item.id}
      item={item}
      onUpdate={useCallback(
        () => handleUpdate(item.id),
        [item.id]
      )}
    />
  ));
});
```

## Data Flow Improvements

### 1. Caching Enhancements
```typescript
// 1. Implement advanced caching
// lib/api/enhanced-cache.ts
class EnhancedCache {
  private cache: Map<string, CacheEntry>;
  
  set(key: string, value: any, ttl: number) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
      lastAccessed: Date.now()
    });
  }
  
  get(key: string) {
    const entry = this.cache.get(key);
    if (this.isValid(entry)) {
      entry.lastAccessed = Date.now();
      return entry.value;
    }
    return null;
  }
}

// 2. Implement cache invalidation
const invalidateRelatedCaches = (symbol: string) => {
  const patterns = [
    `ticker:${symbol}`,
    `market:${symbol}`,
    `news:${symbol}`
  ];
  patterns.forEach(pattern => cache.invalidatePattern(pattern));
};
```

### 2. WebSocket Optimization
```typescript
// 1. Implement smart subscriptions
class SmartWebSocketManager extends BaseWebSocketManager {
  private activeSubscriptions: Set<string>;
  
  subscribe(symbol: string) {
    if (!this.activeSubscriptions.has(symbol)) {
      this.activeSubscriptions.add(symbol);
      this.batchSubscribe();
    }
  }
  
  private batchSubscribe() {
    // Batch multiple subscriptions into one message
    const batch = Array.from(this.activeSubscriptions);
    this.ws.send(JSON.stringify({
      action: "subscribe",
      params: batch.join(",")
    }));
  }
}

// 2. Implement reconnection with state recovery
class ResilientWebSocket {
  private messageQueue: Message[] = [];
  
  reconnect() {
    this.connect().then(() => {
      this.replayMessages();
      this.resubscribeAll();
    });
  }
}
```

## Error Handling Improvements

### 1. Enhanced Error Boundaries
```typescript
// 1. Create specialized error boundaries
class MarketDataErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay 
          error={this.state.error}
          retry={this.resetError}
        />
      );
    }
    return this.props.children;
  }
}

// 2. Implement fallback states
const FallbackComponent = ({ error, retry }) => {
  const errorType = categorizeError(error);
  
  switch (errorType) {
    case 'network':
      return <NetworkErrorDisplay retry={retry} />;
    case 'data':
      return <DataErrorDisplay retry={retry} />;
    default:
      return <GenericErrorDisplay retry={retry} />;
  }
};
```

### 2. API Error Handling
```typescript
// 1. Implement retry logic
const fetchWithRetry = async (url: string, options: Options) => {
  const maxRetries = 3;
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error)) throw error;
      await delay(Math.pow(2, i) * 1000);
    }
  }
  throw lastError;
};

// 2. Implement graceful degradation
const fetchMarketData = async (symbol: string) => {
  try {
    return await fetchPrimaryData(symbol);
  } catch (error) {
    console.error('Primary data source failed:', error);
    try {
      return await fetchFallbackData(symbol);
    } catch (fallbackError) {
      return getLastKnownGoodData(symbol);
    }
  }
};
```

## Testing Improvements

### 1. Enhanced Test Coverage
```typescript
// 1. Component testing
describe('MarketOverview', () => {
  it('handles data updates correctly', () => {
    const { rerender } = render(<MarketOverview symbol="AAPL" />);
    
    // Test initial render
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Test data loaded state
    rerender(<MarketOverview symbol="AAPL" data={mockData} />);
    expect(screen.getByText(/AAPL/)).toBeInTheDocument();
    
    // Test error state
    rerender(<MarketOverview symbol="AAPL" error={new Error()} />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});

// 2. Integration testing
describe('MarketDataFlow', () => {
  it('integrates with WebSocket correctly', async () => {
    const mockWebSocket = new MockWebSocket();
    render(<MarketDataComponent ws={mockWebSocket} />);
    
    // Test subscription
    expect(mockWebSocket.subscriptions).toContain('AAPL');
    
    // Test data flow
    mockWebSocket.emit('message', mockData);
    await waitFor(() => {
      expect(screen.getByText(mockData.price)).toBeInTheDocument();
    });
  });
});
```

## Documentation Improvements

### 1. Code Documentation
```typescript
/**
 * MarketDataProvider manages the real-time market data flow
 * @param {string} symbol - The stock symbol to track
 * @param {WebSocketOptions} options - Configuration options
 * @returns {MarketData} Real-time market data
 * 
 * @example
 * ```tsx
 * const MarketComponent = () => {
 *   const data = useMarketData('AAPL');
 *   return <Display data={data} />;
 * };
 * ```
 */
```

### 2. API Documentation
```typescript
/**
 * @api {get} /api/market/:symbol Get Market Data
 * @apiName GetMarketData
 * @apiGroup Market
 * 
 * @apiParam {String} symbol Stock symbol
 * 
 * @apiSuccess {Object} data Market data
 * @apiSuccess {Number} data.price Current price
 * @apiSuccess {Number} data.change Price change
 * 
 * @apiError {Object} error Error information
 */
```

## State Management Patterns

### 1. Centralized Market Data Store

The market data store is the single source of truth for all market data:

```typescript
// ✅ Do: Use the centralized store
const { data, isLoading } = useMarketData('AAPL')

// ❌ Don't: Create local state
const [data, setData] = useState(null)
```

### 2. Data Updates

#### Single Symbol Updates
```typescript
// ✅ Do: Update through the store
const { updateData } = useMarketData()
updateData('AAPL', newData)

// ❌ Don't: Update state directly
setLocalState(newData)
```

#### Batch Updates
```typescript
// ✅ Do: Use batch updates
const { updateBatchData } = useMarketData()
updateBatchData({
  AAPL: newData1,
  MSFT: newData2
})

// ❌ Don't: Update multiple symbols individually
symbols.forEach(sym => updateData(sym, newData))
```

### 3. Real-time Updates

```typescript
// ✅ Do: Use WebSocket through store
const { data } = useMarketData(['AAPL', 'MSFT'])
useStockWebSocket({
  symbols: ['AAPL', 'MSFT'],
  onUpdate: (update) => updateData(update.symbol, update)
})

// ❌ Don't: Manage WebSocket separately
const ws = new WebSocket('wss://...')
```

## Component Patterns

### 1. Data Access

```typescript
// ✅ Do: Access data through hooks
function StockDisplay({ symbol }: { symbol: string }) {
  const { data, isLoading, error } = useMarketData(symbol)
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorDisplay error={error} />
  
  return <PriceDisplay price={data[symbol].price} />
}

// ❌ Don't: Fetch data directly
function BadStockDisplay({ symbol }: { symbol: string }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch(`/api/stocks/${symbol}`).then(setData)
  }, [symbol])
}
```

### 2. Data Freshness

```typescript
// ✅ Do: Use the store's freshness checks
function StockList({ symbols }: { symbols: string[] }) {
  const { data, fetchData } = useMarketDataFetcher(symbols)
  
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [symbols])
}

// ❌ Don't: Implement separate freshness logic
function BadStockList({ symbols }: { symbols: string[] }) {
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  // ... custom freshness logic
}
```

### 3. Error Handling

```typescript
// ✅ Do: Use store's error handling
function StockWidget({ symbol }: { symbol: string }) {
  const { data, error } = useMarketData(symbol)
  
  if (error?.includes('RATE_LIMIT')) {
    return <RetryButton onRetry={() => fetchData()} />
  }
}

// ❌ Don't: Implement separate error handling
function BadStockWidget({ symbol }: { symbol: string }) {
  const [error, setError] = useState(null)
  // ... custom error handling
}
```

## Data Flow Patterns

### 1. Component Hierarchy

```typescript
// ✅ Do: Share data through store
function ParentComponent() {
  const symbols = ['AAPL', 'MSFT']
  return (
    <>
      <PriceDisplay symbols={symbols} />
      <VolumeDisplay symbols={symbols} />
    </>
  )
}

// Both components use the same store data
function PriceDisplay({ symbols }: { symbols: string[] }) {
  const { data } = useMarketData(symbols)
  return // ... render prices
}

function VolumeDisplay({ symbols }: { symbols: string[] }) {
  const { data } = useMarketData(symbols)
  return // ... render volumes
}

// ❌ Don't: Pass data through props
function BadParentComponent() {
  const [data, setData] = useState(null)
  return (
    <>
      <PriceDisplay data={data} />
      <VolumeDisplay data={data} />
    </>
  )
}
```

### 2. Data Synchronization

```typescript
// ✅ Do: Let the store handle sync
function SynchronizedDisplays() {
  const symbols = ['AAPL', 'MSFT']
  const { data } = useMarketData(symbols)
  
  return (
    <div>
      <Chart data={data} />
      <Table data={data} />
    </div>
  )
}

// ❌ Don't: Sync manually
function BadSynchronizedDisplays() {
  const [chartData, setChartData] = useState(null)
  const [tableData, setTableData] = useState(null)
  // ... manual sync logic
}
```

## Testing Patterns

### 1. Mocking Store Data

```typescript
// ✅ Do: Use store's mock capabilities
import { mockMarketData } from '@/lib/hooks/use-market-data'

describe('StockDisplay', () => {
  beforeEach(() => {
    mockMarketData({
      AAPL: { price: 150.00, volume: 1000000 }
    })
  })
  
  it('displays stock price', () => {
    render(<StockDisplay symbol="AAPL" />)
    expect(screen.getByText('$150.00')).toBeInTheDocument()
  })
})

// ❌ Don't: Mock fetch/WebSocket directly
jest.mock('next/fetch', () => ({
  fetch: jest.fn()
}))
```

### 2. Testing Updates

```typescript
// ✅ Do: Test through store
test('updates price on WebSocket message', async () => {
  const { updateData } = useMarketData()
  render(<StockDisplay symbol="AAPL" />)
  
  act(() => {
    updateData('AAPL', { price: 151.00 })
  })
  
  expect(screen.getByText('$151.00')).toBeInTheDocument()
})

// ❌ Don't: Test WebSocket directly
test('bad update test', () => {
  const ws = new WebSocket('wss://...')
  ws.send(JSON.stringify({ price: 151.00 }))
})
```

## Migration Patterns

### 1. Gradual Migration

```typescript
// Step 1: Add store alongside existing code
function MigratingComponent() {
  // Old code
  const [localData, setLocalData] = useState(null)
  
  // New code
  const { data } = useMarketData('AAPL')
  
  // Use new data, fallback to old
  const displayData = data?.AAPL || localData
}

// Step 2: Remove old code
function MigratedComponent() {
  const { data } = useMarketData('AAPL')
  return <Display data={data.AAPL} />
}
```

### 2. Feature Flags

```typescript
// ✅ Do: Use feature flags for migration
function FeatureFlaggedComponent() {
  if (USE_MARKET_DATA_STORE) {
    return <NewImplementation />
  }
  return <OldImplementation />
}

// Step 1: Test in development
const USE_MARKET_DATA_STORE = process.env.NODE_ENV === 'development'

// Step 2: Gradual rollout
const USE_MARKET_DATA_STORE = Math.random() < 0.1 // 10% of users

// Step 3: Full migration
const USE_MARKET_DATA_STORE = true
```

Remember: These patterns should be used in conjunction with the existing architecture and integration guides to maintain consistency across the application. 