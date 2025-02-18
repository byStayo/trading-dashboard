import React from 'react';
import { MarketDataCard } from './MarketDataCard';

interface MarketDataGridProps {
  symbols: string[];
  refreshInterval?: number;
  className?: string;
}

export function MarketDataGrid({
  symbols,
  refreshInterval,
  className = '',
}: MarketDataGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
    >
      {symbols.map((symbol) => (
        <MarketDataCard
          key={symbol}
          symbol={symbol}
          refreshInterval={refreshInterval}
        />
      ))}
    </div>
  );
} 