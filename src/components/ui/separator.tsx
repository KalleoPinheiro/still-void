import * as React from "react"
import { cn } from "../../lib/utils"

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  /**
   * `true` (default, matching shadcn/ui upstream): a purely visual divider,
   * so it stays out of the accessibility tree — no `role`, no
   * `aria-orientation`. Pass `false` for a divider that carries real
   * meaning (e.g. between two distinct sign-in methods) to expose
   * `role="separator"` and, when vertical, `aria-orientation="vertical"`.
   */
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? undefined : "separator"}
      aria-orientation={!decorative && orientation === "vertical" ? "vertical" : undefined}
      className={cn(
        "sv-separator",
        orientation === "vertical" && "sv-separator--vertical",
        className,
      )}
      {...props}
    />
  ),
)
Separator.displayName = "Separator"

export { Separator }
