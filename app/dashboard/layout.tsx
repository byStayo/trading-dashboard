import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Trading Dashboard</h1>
            <nav className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-sm font-medium hover:text-primary"
              >
                Overview
              </a>
              <a
                href="/dashboard/watchlist"
                className="text-sm font-medium hover:text-primary"
              >
                Watchlist
              </a>
              <a
                href="/dashboard/portfolio"
                className="text-sm font-medium hover:text-primary"
              >
                Portfolio
              </a>
              <a
                href="/dashboard/settings"
                className="text-sm font-medium hover:text-primary"
              >
                Settings
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2024 Trading Dashboard. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <a href="/terms" className="hover:text-primary">
                Terms
              </a>
              <a href="/privacy" className="hover:text-primary">
                Privacy
              </a>
              <a href="/help" className="hover:text-primary">
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 