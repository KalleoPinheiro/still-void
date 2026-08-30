---
"@still-void/ui": patch
---

Fix correctness bugs found by review in the round-5 App Shell / Toast / Alert work (all unreleased in this cycle):

- `SidebarPanel`: `collapsible="none"` no longer renders an undismissable mobile drawer; the drawer ref now forwards to `Dialog.Content` so consumer refs work below the breakpoint.
- `SidebarTrigger`: a consumer `onClick` is now called alongside the internal toggle instead of being silently replaced.
- `ToastProvider`: the mount flag now resets on remount, so a toast fired during a React Strict Mode dev remount no longer silently no-ops; the action and close buttons are explicit `type="button"` so they don't submit a surrounding form; toast content is no longer wrapped in an unclassed `<div>`, restoring the intended flex layout.
- `Alert`: variant lookup checks own keys only (rejects `"constructor"`/`"toString"`); a custom `icon` node that isn't a `React.isValidElement` (a string, number, or array) is now rendered instead of silently dropped.
- `createMediaQuery`: a transition notifies a snapshot of listeners, so one listener unsubscribing mid-transition no longer causes the next listener to be skipped.
- CSS: `.sv-toast__action:hover` referenced an undefined `--sv-surface-3` token; now uses the same surface-2/surface pair as `.sv-btn--secondary`, which shares its base color.
