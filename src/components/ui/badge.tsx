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
        // Kept only for tests/ui-badge.test.tsx's frozen default-variant
        // assertion (AC P2-4). Inert for the Tailwind-free consumers AD-001
        // targets; the real accent-following fix is .sv-badge's own
        // background: var(--sv-accent).
        variant === "default" && "bg-sv-signal-cyan",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
