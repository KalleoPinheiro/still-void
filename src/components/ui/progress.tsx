import * as React from "react"
import { cn } from "../../lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current amount. Clamped to `[0, max]` — never renders past the track. */
  value?: number
  /** Ceiling `value` is measured against. Library default is `100` — not a claim of native `<progress>` parity (that element defaults `max` to `1` and treats an omitted `value` as indeterminate; this component always renders a determinate `value`). */
  max?: number
}

/** `value`/`max` clamped into `[0, max]`, so an out-of-range input never overflows the track. */
function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, 0), max)
}

/**
 * A negative, `NaN` or `Infinity` `max` would otherwise produce an invalid
 * ARIA range (`aria-valuemin` > `aria-valuemax`) or a nonsensical 100%
 * indicator (`clamp(0, -10)` returns `-10`, not `0`) — normalize to a finite,
 * non-negative ceiling before it reaches `clamp`/`aria-valuemax`.
 */
function normalizeMax(max: number): number {
  return Number.isFinite(max) && max > 0 ? max : 0
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const safeMax = normalizeMax(max)
    const clamped = clamp(value, safeMax)
    const percent = safeMax === 0 ? 0 : (clamped / safeMax) * 100

    return (
      <div
        {...props}
        ref={ref}
        // Spread before, not after: the ARIA range this component computes
        // from value/max must not be overridable by a stray
        // role/aria-valuenow/aria-valuemin/aria-valuemax the caller passes
        // through `...props` — same reasoning as DialogContent's aria-modal.
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        className={cn("sv-progress", className)}
      >
        <div className="sv-progress__indicator" style={{ width: `${percent}%` }} />
      </div>
    )
  },
)
Progress.displayName = "Progress"

export { Progress }
