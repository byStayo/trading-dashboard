import { useEffect, useState } from 'react';
import { useStockWebSocket } from '@/lib/hooks/use-stock-websocket';
import { AggregateMessage } from '@/types/polygon';

interface TickerData {
  symbol: string;
  price: number;
  volume: number;
  change: number;
  changePercent: number;
  lastUpdate: number;
}

export function PolygonTickerWall() {
  const [tickers, setTickers] = useState<Map<string, TickerData>>(new Map());
  const [symbols, setSymbols] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('disconnected');

  // Fetch initial symbols
  useEffect(() => {
    async function fetchSymbols() {
      try {
        const response = await fetch('/api/stock/tickers/trending');
        if (!response.ok) throw new Error('Failed to fetch trending tickers');
        const data = await response.json();
        setSymbols(data.symbols);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch symbols');
      }
    }
    fetchSymbols();
  }, []);

  const handleAggregate = (data: AggregateMessage) => {
    setTickers(prev => {
      const newTickers = new Map(prev);
      const prevTicker = newTickers.get(data.sym);
      const prevPrice = prevTicker?.price ?? data.c;
      
      newTickers.set(data.sym, {
        symbol: data.sym,
        price: data.c,
        volume: data.v,
        change: data.c - prevPrice,
        changePercent: ((data.c - prevPrice) / prevPrice) * 100,
        lastUpdate: data.t
      });
      
      return newTickers;
    });
  };

  const { isConnected } = useStockWebSocket({
    symbols,
    onAggregate: handleAggregate,
    onError: (error) => setError(error.message),
    onStatusChange: setStatus
  });

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="p-4 text-yellow-500">
        Connecting to market data...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {Array.from(tickers.values()).map((ticker) => (
        <div
          key={ticker.symbol}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">{ticker.symbol}</h3>
            <span
              className={`text-lg font-semibold ${
                ticker.change >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              ${ticker.price.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-500">Volume: {ticker.volume.toLocaleString()}</span>
            <span
              className={`${
                ticker.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {ticker.changePercent >= 0 ? '+' : ''}
              {ticker.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 