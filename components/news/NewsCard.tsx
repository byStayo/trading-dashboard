import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNews } from '@/lib/hooks/use-news';

interface NewsCardProps {
  symbols?: string[];
  limit?: number;
  useStream?: boolean;
}

export function NewsCard({ symbols, limit = 5, useStream = true }: NewsCardProps) {
  const { news, error, isLoading, hasMore, loadMore } = useNews(symbols, {
    limit,
    useStream,
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>News</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && !news.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          News
          {useStream && (
            <Badge variant="success" className="animate-pulse">
              Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {news.map((item) => (
          <article key={item.id} className="space-y-2">
            <h3 className="font-medium hover:text-primary cursor-pointer">
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.summary}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{item.source}</span>
              <span>
                {new Date(item.publishedAt).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {item.symbols.map((symbol) => (
                <Badge key={symbol} variant="secondary">
                  {symbol}
                </Badge>
              ))}
            </div>
          </article>
        ))}
        {hasMore && (
          <button
            onClick={loadMore}
            className="w-full py-2 text-sm text-muted-foreground hover:text-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </CardContent>
    </Card>
  );
} 