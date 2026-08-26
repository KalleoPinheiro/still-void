---
"@still-void/ui": minor
---

Add SVG chart primitives — `ChartContainer`, `ChartGrid`, `ChartAxis`, `ChartLine`, `ChartBar` — server-safe, reading `var(--sv-border)`/`var(--sv-text-2)` for grid/axis color; series color (`var(--sv-accent-ink)`, `var(--sv-info-ink)`, `var(--sv-warning-ink)`, or any CSS color) is a caller prop. All geometry (`points`, `positions`, `ticks`, `bars`) is pre-computed pixel space — there is no domain-to-pixel scale engine; mapping a clinical score or percentage to a position stays application logic. Closes the visual half of the hand-rolled-SVG-chart gap without porting domain-specific scale logic into the design system.
