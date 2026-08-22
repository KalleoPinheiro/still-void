import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "default" &&
          "border-transparent bg-sv-signal-cyan text-sv-bg",
        variant === "secondary" &&
          "border-transparent bg-sv-surface-2 text-sv-text hover:bg-sv-surface",
        variant === "destructive" &&
          "border-transparent bg-red-500 text-white hover:bg-red-600",
        variant === "outline" && "text-sv-text border-sv-border",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
