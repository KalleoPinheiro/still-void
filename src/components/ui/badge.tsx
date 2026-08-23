import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "sv-badge",
        variant === "secondary" && "sv-badge--secondary",
        variant === "destructive" && "sv-badge--destructive",
        variant === "outline" && "sv-badge--outline",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
