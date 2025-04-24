# Abacus Terminal: Portfolio Management Implementation

## Overview

The Portfolio Management module is a critical component of the Abacus Terminal, allowing users to track, analyze, and manage their investment portfolios. This implementation guide addresses the current gaps in the Portfolio Management system, focusing on completing the backend API integration and enhancing the analytics capabilities.

## Goals

- Complete the backend API integration for portfolio data
- Implement comprehensive position tracking and performance metrics
- Develop advanced portfolio analytics features
- Create visualization components for portfolio insights
- Establish robust data synchronization with brokerage accounts
- Enable portfolio rebalancing capabilities

## Implementation Checklist

### 1. Portfolio Data API

- [ ] **Implement Portfolio API Endpoints**
  ```typescript
  // Example API routes to implement in app/api/portfolio
  // GET /api/portfolio
  // GET /api/portfolio/:id
  // POST /api/portfolio
  // PUT /api/portfolio/:id
  // DELETE /api/portfolio/:id
  // GET /api/portfolio/:id/positions
  // GET /api/portfolio/:id/performance
  // GET /api/portfolio/:id/transactions
  ```

- [ ] **Create Data Access Layer**
  - Implement Prisma queries for portfolio data
  - Create repository pattern for data access
  - Implement transaction support for data integrity
  - Add caching for frequently accessed portfolio data

- [ ] **Data Validation and Security**
  - Create Zod schemas for all API requests/responses
  - Implement comprehensive input validation
  - Add permission checks for portfolio access
  - Create audit logging for portfolio changes

### 2. Position Tracking and Management

- [ ] **Position Management API**
  ```typescript
  // Example position management endpoints
  // GET /api/portfolio/:id/positions
  // GET /api/portfolio/:id/position/:symbol
  // POST /api/portfolio/:id/position
  // PUT /api/portfolio/:id/position/:symbol
  // DELETE /api/portfolio/:id/position/:symbol
  ```

- [ ] **Real-time Position Updates**
  - Integrate with Market Data Service for real-time pricing
  - Implement WebSocket updates for position values
  - Calculate real-time P&L and performance metrics
  - Support multiple portfolio views (by sector, asset class, etc.)

- [ ] **Cost Basis Calculation**
  - Implement various cost basis methods (FIFO, LIFO, average)
  - Account for corporate actions (splits, dividends, etc.)
  - Support tax lot tracking and selection
  - Provide unrealized/realized gain breakdowns

### 3. Portfolio Performance Analytics

- [ ] **Performance Calculation Engine**
  ```typescript
  // Example performance metrics to implement
  interface PerformanceMetrics {
    totalValue: number;
    cashValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    dayGainLoss: number;
    dayGainLossPercent: number;
    timeWeightedReturn: number;
    moneyWeightedReturn: number;
    alpha: number;
    beta: number;
    sharpeRatio: number;
    sortinoRatio: number;
    maxDrawdown: number;
    volatility: number;
  }
  ```

- [ ] **Benchmark Comparison**
  - Implement benchmark selection (S&P 500, industry indices, etc.)
  - Calculate relative performance metrics
  - Support custom benchmark creation
  - Add visualization for performance comparison

- [ ] **Time-period Analysis**
  - Implement performance calculations for various time periods
  - Support custom date range selection
  - Calculate annualized performance metrics
  - Create monthly/quarterly/yearly performance views

### 4. Portfolio Visualization Components

- [ ] **Asset Allocation Chart**
  ```tsx
  // Example component structure
  <AssetAllocationChart
    portfolioId={portfolio.id}
    groupBy="assetClass" // or "sector", "country", etc.
    interactive={true}
    onSliceClick={(allocation) => handleAllocationClick(allocation)}
  />
  ```

- [ ] **Performance Chart**
  - Implement interactive time-series chart
  - Support comparison with benchmarks
  - Add technical indicators on performance
  - Implement zooming and date range selection

- [ ] **Holdings Table**
  - Create sortable/filterable holdings table
  - Implement real-time updates for prices
  - Add gain/loss visualization
  - Support drill-down for position details

- [ ] **Risk Analysis Visualization**
  - Implement risk heatmap
  - Create correlation matrix visualization
  - Add VaR (Value at Risk) calculation and display
  - Develop stress testing visualization

### 5. Portfolio Import and Synchronization

- [ ] **Brokerage Integration**
  ```typescript
  // Example brokerage connector interface
  interface BrokerageConnector {
    fetchPositions(account: string): Promise<Position[]>;
    fetchTransactions(account: string, from: Date, to: Date): Promise<Transaction[]>;
    fetchBalances(account: string): Promise<AccountBalance>;
    syncPortfolio(portfolioId: string, account: string): Promise<SyncResult>;
  }
  ```

- [ ] **Manual Import Options**
  - Support CSV import format for positions
  - Implement transaction import
  - Add validation for imported data
  - Create mapping interface for non-standard formats

- [ ] **Synchronization Management**
  - Implement scheduled synchronization
  - Create conflict resolution UI
  - Add synchronization history and logging
  - Support manual reconciliation tools

### 6. Portfolio Rebalancing

- [ ] **Target Allocation Management**
  ```typescript
  // Example target allocation model
  interface TargetAllocation {
    portfolioId: string;
    type: 'assetClass' | 'sector' | 'symbol' | 'custom';
    allocations: {
      id: string;
      name: string;
      targetPercent: number;
      currentPercent: number;
      difference: number;
    }[];
  }
  ```

- [ ] **Rebalancing Calculator**
  - Implement rebalancing algorithm to minimize trades
  - Add tax-efficiency considerations
  - Support drift-based rebalancing thresholds
  - Calculate expected transaction costs

- [ ] **Rebalancing Action Generation**
  - Create actionable trade list
  - Support "cash in/out" scenarios
  - Implement partial rebalancing options
  - Add execution integration with trading module

### 7. Cash Management

- [ ] **Cash Account Tracking**
  ```typescript
  // Example cash management endpoints
  // GET /api/portfolio/:id/cash
  // POST /api/portfolio/:id/cash/deposit
  // POST /api/portfolio/:id/cash/withdrawal
  // GET /api/portfolio/:id/cash/transactions
  ```

- [ ] **Dividend and Interest Tracking**
  - Track dividend payments and schedules
  - Calculate yield metrics
  - Implement ex-dividend date notifications
  - Support dividend reinvestment simulation

- [ ] **Cash Forecasting**
  - Implement cash flow projection
  - Calculate expected dividend income
  - Project interest earnings
  - Support scheduled cash events (deposits/withdrawals)

## Technical Requirements

### Data Models

```typescript
// Core data models to implement
interface Portfolio {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  cash: number;
  currency: string;
  isDefault: boolean;
}

interface Position {
  id: string;
  portfolioId: string;
  symbol: string;
  quantity: number;
  costBasis: number;
  openedAt: Date;
  updatedAt: Date;
  // Calculated fields
  currentPrice?: number;
  marketValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
  dayGainLoss?: number;
  dayGainLossPercent?: number;
}

interface Transaction {
  id: string;
  portfolioId: string;
  positionId?: string;
  type: 'buy' | 'sell' | 'dividend' | 'interest' | 'fee' | 'transfer' | 'other';
  symbol?: string;
  quantity?: number;
  price?: number;
  amount: number;
  date: Date;
  description?: string;
  fees?: number;
}

interface PerformanceSnapshot {
  id: string;
  portfolioId: string;
  date: Date;
  value: number;
  cash: number;
  deposits: number;
  withdrawals: number;
  // Calculated fields
  gainLoss?: number;
  gainLossPercent?: number;
}
```

### Architecture

```
[User Interface] → [Portfolio API] → [Portfolio Service]
                                       ↓
[Market Data Service] → [Position Calculator] → [Analytics Engine]
                                                  ↓
                                            [Data Visualization]
```

## Dependencies

- Prisma ORM for database access
- Market Data Service for real-time pricing
- Authentication Service for user verification
- Redis for caching and real-time updates
- Recharts for data visualization

## Implementation Steps

1. Define and implement complete API endpoints
2. Create data access layer with Prisma
3. Implement position tracking with real-time updates
4. Develop performance analytics engine
5. Create visualization components
6. Implement portfolio import and synchronization
7. Develop rebalancing functionality
8. Add cash management features

## Best Practices

- Use repository pattern for data access
- Implement comprehensive validation for all inputs
- Cache frequently accessed portfolio data
- Use optimistic updates for UI responsiveness
- Implement proper error handling and recovery
- Use WebSockets for real-time updates
- Follow proper security practices for financial data

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Financial Portfolio Calculations](https://www.investopedia.com/terms/p/portfolio-performance.asp)
- [Modern Portfolio Theory](https://www.investopedia.com/terms/m/modernportfoliotheory.asp)
- [Recharts Documentation](https://recharts.org/en-US/api)
- [WebSocket Best Practices](https://websockets.readthedocs.io/en/stable/intro.html)
