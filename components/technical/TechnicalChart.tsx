import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useTechnicalIndicators } from '@/lib/hooks/use-technical-indicators';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TechnicalChartProps {
  symbol: string;
  indicator: 'SMA' | 'EMA' | 'RSI' | 'MACD';
  period: number;
  timeRange: {
    startDate: string;
    endDate: string;
  };
  refreshInterval?: number;
}

export function TechnicalChart({
  symbol,
  indicator,
  period,
  timeRange,
  refreshInterval,
}: TechnicalChartProps) {
  const { data, error, isLoading } = useTechnicalIndicators(
    symbol,
    indicator,
    period,
    timeRange,
    { refreshInterval }
  );

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {symbol} - {indicator}({period})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {symbol} - {indicator}({period})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-[300px] bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map((item) => ({
    timestamp: new Date(item.timestamp).toLocaleDateString(),
    value: item.value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {symbol} - {indicator}({period})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.split(',')[0]}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                formatter={(value: number) => [value.toFixed(2), indicator]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                name={`${indicator}(${period})`}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 