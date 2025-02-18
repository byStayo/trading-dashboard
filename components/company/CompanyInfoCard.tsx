import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCompanyInfo } from '@/lib/hooks/use-company-info';

interface CompanyInfoCardProps {
  symbol: string;
  refreshInterval?: number;
}

export function CompanyInfoCard({
  symbol,
  refreshInterval,
}: CompanyInfoCardProps) {
  const { data, error, isLoading } = useCompanyInfo(symbol, {
    refreshInterval,
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
            <div className="space-y-2">
              <div className="h-3 w-1/2 bg-muted rounded" />
              <div className="h-3 w-1/3 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{data.name}</span>
          <Badge variant="outline">{data.symbol}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{data.description}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Sector</p>
            <p className="text-sm text-muted-foreground">{data.sector}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Industry</p>
            <p className="text-sm text-muted-foreground">{data.industry}</p>
          </div>
          {data.employees && (
            <div>
              <p className="text-sm font-medium">Employees</p>
              <p className="text-sm text-muted-foreground">
                {data.employees.toLocaleString()}
              </p>
            </div>
          )}
          {data.marketCap && (
            <div>
              <p className="text-sm font-medium">Market Cap</p>
              <p className="text-sm text-muted-foreground">
                ${(data.marketCap / 1e9).toFixed(2)}B
              </p>
            </div>
          )}
        </div>

        {data.website && (
          <div>
            <p className="text-sm font-medium">Website</p>
            <a
              href={data.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {data.website}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 