import { Inter } from "next/font/google"
import "./globals.css"
import "../styles/ticker.css"
import { AuthProvider } from "@/components/auth/auth-provider"
import { AppStateProvider } from "@/lib/app-state-context"
import { Sidebar } from "@/components/sidebar"
import { MarketStatusHeader } from "@/components/market-status-header"
import { ThemeProvider } from "@/components/theme-provider"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  generator: 'v0.dev'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppStateProvider>
            <AuthProvider>
              <div className="flex h-screen w-full overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                  <MarketStatusHeader />
                  <main className="flex-1 overflow-auto p-4">{children}</main>
                </div>
              </div>
            </AuthProvider>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
