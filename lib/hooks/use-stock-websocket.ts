import { useEffect, useState } from 'react'
import { AggregateMessage } from '@/types/polygon'
import { polygonClient } from '@/lib/api/polygon-client'

interface WebSocketConfig {
  symbols: string[]
  onAggregate?: (data: AggregateMessage) => void
  onError?: (error: Error) => void
  onStatusChange?: (status: string) => void
}

export function useStockWebSocket({
  symbols,
  onAggregate,
  onError,
  onStatusChange
}: WebSocketConfig) {
  const [isClient, setIsClient] = useState(false);
  const [client, setClient] = useState<typeof polygonClient | null>(null);

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize client after component mounts
  useEffect(() => {
    if (isClient) {
      setClient(polygonClient);
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !client) return;

    const handleAggregate = (data: AggregateMessage) => {
      if (symbols.includes(data.sym)) {
        onAggregate?.(data);
      }
    };

    const handleError = (error: Error) => {
      onError?.(error);
    };

    const handleStatus = (status: string) => {
      onStatusChange?.(status);
    };

    // Connect to WebSocket if not already connected
    if (!client.isConnected()) {
      client.connect();
    }

    // Subscribe to each symbol
    symbols.forEach(symbol => {
      client.subscribe('aggregate', (data: AggregateMessage) => {
        if (data.type === 'error') {
          handleError(data.error);
        } else if (data.type === 'status') {
          handleStatus(data.status);
        } else {
          handleAggregate(data);
        }
      });
    });

    // Cleanup function
    return () => {
      if (isClient && client) {
        symbols.forEach(symbol => {
          client.unsubscribe('aggregate', handleAggregate);
        });
      }
    };
  }, [symbols, onAggregate, onError, onStatusChange, isClient, client]);

  return {
    isConnected: isClient && client ? client.isConnected() : false
  };
} 