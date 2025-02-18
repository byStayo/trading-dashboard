import React from 'react';
import { useSearch } from '@/lib/hooks/use-search';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchBarProps {
  onSelect?: (result: any) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSelect,
  placeholder = 'Search for stocks, crypto, or forex...',
  className = '',
}: SearchBarProps) {
  const { query, setQuery, results, isLoading } = useSearch({
    debounceMs: 300,
    limit: 5,
  });

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-md border border-input bg-background"
      />
      {(isLoading || results.length > 0) && (
        <Card className="absolute w-full mt-1 z-50">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded" />
                ))}
              </div>
            ) : (
              <ul className="space-y-1">
                {results.map((result) => (
                  <li
                    key={result.ticker}
                    className="p-2 hover:bg-muted rounded-md cursor-pointer"
                    onClick={() => onSelect?.(result)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{result.ticker}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {result.name}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="secondary">{result.type}</Badge>
                        <Badge variant="outline">{result.market}</Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 