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
      {...props}
      ref={ref}
      // Spread before, not after: whether this divider is announced is
      // decided by `decorative`/`orientation`, not by a stray role/
      // aria-orientation the caller passes through `...props` — same
      // reasoning as DialogContent's aria-modal.
      role={decorative ? undefined : "separator"}
      aria-orientation={!decorative && orientation === "vertical" ? "vertical" : undefined}
      className={cn(
        "sv-separator",
        orientation === "vertical" && "sv-separator--vertical",
        className,
      )}
    />
  ),
)
Separator.displayName = "Separator"

export { Separator }
