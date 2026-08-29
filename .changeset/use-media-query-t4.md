---
"@still-void/ui": minor
---

Add useMediaQuery hook for responsive breakpoint detection.

Introduces `useMediaQuery(query: string)` hook built on `createMediaQuery` and `useSyncExternalStore` for safe SSR hydration. Provides a server snapshot (`false`) that matches on initial render, then reflects the true client-side media query state after hydration without triggering mismatch warnings. Exported from `@still-void/ui/react/client` along with `createMediaQuery` and `MediaQueryController` type.
