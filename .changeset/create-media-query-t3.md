---
"@still-void/ui": minor
---

Add createMediaQuery behavior for responsive breakpoint detection.

Introduces `createMediaQuery(query: string)` as a framework-agnostic controllable media query source with `getSnapshot()`, `subscribe()`, and `destroy()` methods. Complements `useMediaQuery` hook for safe hydration in Server Components. Gracefully degrades when `matchMedia` is unavailable (e.g., jsdom without stub).

Also adds a global `matchMedia` stub to `tests/setup.ts` with default `matches: false` (desktop) for consistent test behavior across the suite.
