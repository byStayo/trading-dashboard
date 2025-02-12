import { BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({ className, size = "default" }: { className?: string; size?: "default" | "small" }) {
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

