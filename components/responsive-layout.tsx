import React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className={`container mx-auto p-4 ${isMobile ? "space-y-4" : "grid grid-cols-12 gap-4"}`}>
      {React.Children.map(children, (child) => (
        <div className={isMobile ? "w-full" : "col-span-12 md:col-span-6 lg:col-span-4"}>{child}</div>
      ))}
    </div>
  )
}

