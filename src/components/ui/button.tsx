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
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = "Button"

export { Button }
