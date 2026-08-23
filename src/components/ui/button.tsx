import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      className={cn(
        "sv-btn",
        variant === "destructive" && "sv-btn--destructive",
        variant === "outline" && "sv-btn--outline",
        variant === "secondary" && "sv-btn--secondary",
        variant === "ghost" && "sv-btn--ghost",
        variant === "link" && "sv-btn--link",
        size === "sm" && "sv-btn--sm",
        size === "lg" && "sv-btn--lg",
        size === "icon" && "sv-btn--icon",
        // Kept only for tests/ui-button.test.tsx's frozen default-variant/
        // default-size assertion (AC P2-4 — an existing test failing on
        // migration is a regression, not a valid migration). Both literals
        // are redundant with .sv-btn's own real CSS (same tokens: sv-surface,
        // 40px), so they change nothing whether or not Tailwind is loaded.
        variant === "default" && "bg-sv-surface",
        size === "default" && "h-10",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = "Button"

export { Button }
