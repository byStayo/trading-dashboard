import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMarketData } from '@/lib/hooks/use-market-data';

interface MarketDataCardProps {
  symbol: string;
  refreshInterval?: number;
}

export function MarketDataCard({ symbol, refreshInterval }: MarketDataCardProps) {
  const { data, error, isLoading } = useMarketData([symbol], {
    refreshInterval,
    useWebSocket: true,
  });

  const marketData = data[symbol];

  if (error) {
    return (
      <Card className="min-w-[300px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {symbol}
            <Badge variant="destructive">Error</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !marketData) {
    return (
      <Card className="min-w-[300px]">
        <CardHeader>
          <CardTitle>{symbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const changeColor = marketData.change >= 0 ? 'text-green-500' : 'text-red-500';
  const dataSource = marketData.metadata.source === 'websocket' ? 'Real-time' : 'Delayed';
  const reliability = Math.round(marketData.metadata.reliability * 100);

  return (
    <Card className="min-w-[300px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {symbol}
          <Badge
            variant={marketData.metadata.source === 'websocket' ? 'success' : 'warning'}
          >
            {dataSource} ({reliability}%)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Price</span>
          <span className="text-2xl font-bold">
            ${marketData.price.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Change</span>
          <div className="space-x-2">
            <span className={`text-sm font-medium ${changeColor}`}>
              ${marketData.change.toFixed(2)}
            </span>
            <span className={`text-sm font-medium ${changeColor}`}>
              ({marketData.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Volume</span>
          <span className="text-sm">
            {marketData.volume.toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-muted-foreground text-right">
          Last updated: {new Date(marketData.lastUpdated).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
} 