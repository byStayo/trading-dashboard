"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronRight,
  ChevronDown,
  Home,
  BarChart2,
  PieChart,
  TrendingUp,
  Eye,
  Settings,
  HelpCircle,
  GraduationCap,
  Search,
  Filter,
  Brain,
  BarChart3,
} from "lucide-react"

interface SubNavItem {
  title: string
  href: string
}

interface NavItem {
  title: string
  icon: React.ElementType
  href: string
  subItems?: SubNavItem[]
}

const navItems: NavItem[] = [
  { title: "Dashboard", icon: Home, href: "/" },
  {
    title: "Market",
    icon: BarChart2,
    href: "/market-overview",
    subItems: [
      { title: "Overview", href: "/market-overview" },
      { title: "Economic Calendar", href: "/economic-calendar" },
      { title: "Financial Heatmap", href: "/financial-heatmap" },
      { title: "Economic Event Tracker", href: "/economic-event-tracker" },
    ],
  },
  {
    title: "Portfolio",
    icon: PieChart,
    href: "/portfolio",
    subItems: [
      { title: "Overview", href: "/portfolio" },
      { title: "Analytics", href: "/portfolio-analytics" },
      { title: "Optimizer", href: "/portfolio-optimizer" },
    ],
  },
  {
    title: "Trading",
    icon: TrendingUp,
    href: "/trading",
    subItems: [
      { title: "Execute Trades", href: "/trading" },
      { title: "Backtesting", href: "/backtesting" },
      { title: "Journal", href: "/trading-journal" },
    ],
  },
  { title: "Watchlist", icon: Eye, href: "/watchlist" },
  {
    title: "Analysis",
    icon: Search,
    href: "/stock-analysis",
    subItems: [
      { title: "Stock Analysis", href: "/stock-analysis" },
      { title: "Technical Analysis", href: "/technical-analysis" },
      { title: "Valuation", href: "/valuation" },
      { title: "Due Diligence", href: "/due-diligence" },
    ],
  },
  {
    title: "Asset Discovery",
    icon: Filter,
    href: "/asset-search",
    subItems: [
      { title: "Asset Search", href: "/asset-search" },
      { title: "Asset Screener", href: "/asset-screener" },
    ],
  },
  { title: "AI Researcher", icon: Brain, href: "/ai-researcher" },
  {
    title: "Education",
    icon: GraduationCap,
    href: "/business-major",
    subItems: [
      { title: "Business Major", href: "/business-major" },
      { title: "Financial Advisor", href: "/financial-advisor" },
    ],
  },
]

function Logo({ size = "default" }: { size?: "default" | "small" }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-[#4768FD]",
          size === "default" ? "w-7 h-7" : "w-6 h-6",
        )}
      >
        <BarChart3 className={cn("text-white", size === "default" ? "h-4 w-4" : "h-3.5 w-3.5")} />
      </div>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [openItems, setOpenItems] = useState<string[]>([])
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseEnter = () => setIsCollapsed(false)
    const handleMouseLeave = () => {
      setIsCollapsed(true)
      // Close all open items when sidebar collapses
      setOpenItems([])
    }

    const sidebar = sidebarRef.current
    if (sidebar) {
      sidebar.addEventListener("mouseenter", handleMouseEnter)
      sidebar.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (sidebar) {
        sidebar.removeEventListener("mouseenter", handleMouseEnter)
        sidebar.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  // Update openItems when pathname changes
  useEffect(() => {
    const currentNavItem = navItems.find(
      (item) => item.subItems?.some((subItem) => pathname === subItem.href)
    )
    if (currentNavItem && !isCollapsed) {
      setOpenItems([currentNavItem.title])
    }
  }, [pathname, isCollapsed])

  const toggleItem = (title: string) => {
    setOpenItems((prevOpenItems) =>
      prevOpenItems.includes(title) ? prevOpenItems.filter((item) => item !== title) : [...prevOpenItems, title],
    )
  }

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isOpen = openItems.includes(item.title) || (hasSubItems && isActive && !isCollapsed)
    const Icon = item.icon

    return (
      <div key={item.href} className={cn("my-1", depth > 0 && "ml-4")}>
        {hasSubItems ? (
          <Collapsible open={isOpen} onOpenChange={() => toggleItem(item.title)}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-10 flex",
                  isCollapsed ? "justify-center px-0" : "justify-between px-4",
                  isActive && "bg-muted",
                )}
              >
                <div className={cn("flex items-center", isCollapsed && "justify-center w-full")}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="ml-2">{item.title}</span>}
                </div>
                {!isCollapsed && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {item.subItems?.map((subItem) => (
                <Link key={subItem.href} href={subItem.href}>
                  <Button
                    variant={pathname === subItem.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full h-10 flex justify-start px-4 ml-4",
                      pathname === subItem.href && "bg-muted",
                    )}
                  >
                    <span className="ml-2">{subItem.title}</span>
                  </Button>
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <Link href={item.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full h-10 flex",
                isCollapsed ? "justify-center px-0" : "justify-start px-4",
                isActive && "bg-muted",
              )}
            >
              <div className={cn("flex items-center", isCollapsed && "justify-center w-full")}>
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="ml-2">{item.title}</span>}
              </div>
            </Button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300 ease-in-out shrink-0",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="h-14 flex items-center justify-center border-b">
        <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "justify-start px-3 w-full")}>
          <Logo size={isCollapsed ? "small" : "default"} />
          {!isCollapsed && <h2 className="text-lg font-semibold ml-2 truncate">The Daily Consensus</h2>}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className={cn("flex flex-col gap-1 py-2", isCollapsed ? "px-2" : "px-3")}>
          {navItems.map((item) => renderNavItem(item))}
        </nav>
      </ScrollArea>
      <div className="p-3 border-t">
        <div className={cn("flex", isCollapsed ? "justify-center" : "justify-between")}>
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          {!isCollapsed && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href="/help">
                <HelpCircle className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

