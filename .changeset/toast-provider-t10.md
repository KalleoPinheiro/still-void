---
"@still-void/ui": minor
---

Add ToastProvider and useToast for transient notifications.

Introduces `ToastProvider` + `useToast()` hook for dismissible, auto-dismissing toast notifications with four semantic variants (info, success, warning, danger), automatic stacking (default max 3), pause-on-hover, and optional action buttons. Replaces manual toast implementations across multiple screens. Wraps `@radix-ui/react-toast` (new dependency, already verified for marginal install cost and `'use client'` boundary isolation) with a queue management layer. Exported from `@still-void/ui/react/client`.
