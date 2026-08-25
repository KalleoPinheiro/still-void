---
"@still-void/ui": patch
---

Fix the `Alert` Storybook stories to render the package's own `Icon` component instead of raw emoji (`ℹ️`, `✓`, `⚠️`, `✕`) — the catalog's primary discovery surface was demonstrating the exact anti-pattern the design system forbids. No component or CSS changed; `.sv-alert > svg` already positioned a real `<svg>` icon correctly.
