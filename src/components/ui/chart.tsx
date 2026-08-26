import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * SVG chart primitives — visual geometry only, reading the system's own
 * tokens for grid/axis color and taking series color as a prop (the three
 * series tokens, `var(--sv-accent-ink)` / `var(--sv-info-ink)` /
 * `var(--sv-warning-ink)`, are the system's contract; which series maps to
 * which token is the consumer's call, same as it is today).
 *
 * Deliberately NOT a charting engine: every geometry prop here (`points`,
 * `positions`, `ticks`, `bars`) is already in pixel space. Mapping a domain
 * value (a clinical score, a percentage) to that space is application logic,
 * not a design-system concern — see design.md's Assumptions table.
 */

export interface ChartContainerProps {
  width: number
  height: number
  /** The chart's accessible name. Omit only when an adjacent visible caption already names it. */
  "aria-label"?: string
  className?: string
  children?: React.ReactNode
}

const ChartContainer = React.forwardRef<SVGSVGElement, ChartContainerProps>(
  ({ width, height, className, children, ...props }, ref) => (
    <svg
      ref={ref}
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("sv-chart", className)}
      {...props}
    >
      {children}
    </svg>
  ),
)
ChartContainer.displayName = "ChartContainer"

export interface ChartGridProps {
  orientation: "horizontal" | "vertical"
  /** Position, along the axis perpendicular to the line's own direction, of each grid line. */
  positions: number[]
  /** Line length — the far edge each horizontal line reaches on x, or each vertical line reaches on y. */
  width: number
  className?: string
}

const ChartGrid = ({ orientation, positions, width, className }: ChartGridProps) => (
  <>
    {positions.map((position) =>
      orientation === "horizontal" ? (
        <line
          key={position}
          x1={0}
          y1={position}
          x2={width}
          y2={position}
          className={cn("sv-chart__grid-line", className)}
        />
      ) : (
        <line
          key={position}
          x1={position}
          y1={0}
          x2={position}
          y2={width}
          className={cn("sv-chart__grid-line", className)}
        />
      ),
    )}
  </>
)
ChartGrid.displayName = "ChartGrid"

export interface ChartTick {
  position: number
  label: string
}

export interface ChartAxisProps {
  orientation: "bottom" | "left"
  ticks: ChartTick[]
  /** Baseline length — how far along its own axis the line runs. */
  length: number
  className?: string
}

const ChartAxis = ({ orientation, ticks, length, className }: ChartAxisProps) => (
  <>
    {orientation === "bottom" ? (
      <line x1={0} y1={0} x2={length} y2={0} className={cn("sv-chart__axis", className)} />
    ) : (
      <line x1={0} y1={0} x2={0} y2={length} className={cn("sv-chart__axis", className)} />
    )}
    {ticks.map((tick) =>
      orientation === "bottom" ? (
        <text
          key={tick.position}
          x={tick.position}
          y={16}
          textAnchor="middle"
          className="sv-chart__axis-label"
        >
          {tick.label}
        </text>
      ) : (
        <text
          key={tick.position}
          x={-8}
          y={tick.position}
          textAnchor="end"
          dominantBaseline="middle"
          className="sv-chart__axis-label"
        >
          {tick.label}
        </text>
      ),
    )}
  </>
)
ChartAxis.displayName = "ChartAxis"

export interface ChartPoint {
  x: number
  y: number
}

export interface ChartLineProps {
  points: ChartPoint[]
  /** A `var(--sv-*-ink)` series token, or any valid CSS color. */
  color: string
  className?: string
}

const ChartLine = ({ points, color, className }: ChartLineProps) => (
  <polyline
    points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
    fill="none"
    stroke={color}
    strokeWidth={2}
    className={cn("sv-chart__line", className)}
  />
)
ChartLine.displayName = "ChartLine"

export interface ChartBarDatum {
  x: number
  y: number
  width: number
  height: number
}

export interface ChartBarProps {
  bars: ChartBarDatum[]
  /** A `var(--sv-*-ink)` series token, or any valid CSS color. */
  color: string
  className?: string
}

const ChartBar = ({ bars, color, className }: ChartBarProps) => (
  <>
    {bars.map((bar) => (
      <rect
        key={`${bar.x},${bar.y}`}
        x={bar.x}
        y={bar.y}
        width={bar.width}
        height={bar.height}
        fill={color}
        className={cn("sv-chart__bar", className)}
      />
    ))}
  </>
)
ChartBar.displayName = "ChartBar"

export { ChartContainer, ChartGrid, ChartAxis, ChartLine, ChartBar }
