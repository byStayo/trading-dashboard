import React from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { MarketDataGrid } from '@/components/market/MarketDataGrid';
import { TechnicalChart } from '@/components/technical/TechnicalChart';
import { NewsCard } from '@/components/news/NewsCard';
import { CompanyInfoCard } from '@/components/company/CompanyInfoCard';

const DEFAULT_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN'];
const REFRESH_INTERVAL = 5000; // 5 seconds

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = React.useState(DEFAULT_SYMBOLS[0]);

  const handleSymbolSelect = (result: any) => {
    setSelectedSymbol(result.ticker);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="w-full max-w-xl mx-auto">
        <SearchBar onSelect={handleSymbolSelect} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MarketDataGrid
            symbols={DEFAULT_SYMBOLS}
            refreshInterval={REFRESH_INTERVAL}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TechnicalChart
              symbol={selectedSymbol}
              indicator="SMA"
              period={20}
              timeRange={{
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date().toISOString(),
              }}
              refreshInterval={REFRESH_INTERVAL}
            />
            <TechnicalChart
              symbol={selectedSymbol}
              indicator="RSI"
              period={14}
              timeRange={{
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date().toISOString(),
              }}
              refreshInterval={REFRESH_INTERVAL}
            />
          </div>
        </div>

        <div className="space-y-6">
          <CompanyInfoCard
            symbol={selectedSymbol}
            refreshInterval={REFRESH_INTERVAL * 12} // 1 minute
          />
          <NewsCard
            symbols={[selectedSymbol]}
            limit={5}
            useStream={true}
          />
        </div>
      </div>
    </div>
  );
} 