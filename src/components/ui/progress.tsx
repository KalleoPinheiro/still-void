import * as React from "react"
import { cn } from "../../lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current amount. Clamped to `[0, max]` — never renders past the track. */
  value?: number
  /** Ceiling `value` is measured against. Mirrors the native `<progress>` element's default. */
  max?: number
}

/** `value`/`max` clamped into `[0, max]`, so an out-of-range input never overflows the track. */
function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, 0), max)
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const clamped = clamp(value, max)
    const percent = max === 0 ? 0 : (clamped / max) * 100

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn("sv-progress", className)}
        {...props}
      >
        <div className="sv-progress__indicator" style={{ width: `${percent}%` }} />
      </div>
    )
  },
)
Progress.displayName = "Progress"

export { Progress }
