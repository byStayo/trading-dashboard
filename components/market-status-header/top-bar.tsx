import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Globe2, Moon, Sun, Sunrise } from "lucide-react"

interface TopBarProps {
  currentTime: Date
  marketHours: string | null
  isLoadingHours: boolean
  isErrorHours: boolean
  theme: string | undefined
  toggleTheme: () => void
  mounted: boolean
}

export function TopBar({
  currentTime,
  marketHours,
  isLoadingHours,
  isErrorHours,
  theme,
  toggleTheme,
  mounted,
}: TopBarProps) {
  const getMarketStatusIcon = (status: string) => {
    switch (status) {
      case "during":
        return <Globe2 className="h-4 w-4 text-green-500" />
      case "after":
        return <Moon className="h-4 w-4 text-gray-500" />
      case "pre":
        return <Sunrise className="h-4 w-4 text-yellow-500" />
      default:
        return <Globe2 className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-6 w-6" disabled={!mounted}>
          {mounted && (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
        </Button>
        {!isLoadingHours && !isErrorHours && marketHours && (
          <Badge
            variant={marketHours === "during" ? "success" : "secondary"}
            className="text-xs px-2 py-0.5 flex items-center"
          >
            {getMarketStatusIcon(marketHours)}
            <span className="ml-1">{marketHours.toUpperCase()}</span>
          </Badge>
        )}
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium">
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  )
}

