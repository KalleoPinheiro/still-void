---
"@still-void/ui": patch
---

`Tabs` now emits the `sv-tabs` container class on its root element and merges any consumer `className`, matching every other member of the family. `.sv-tabs` was already published in the package's CSS but nothing rendered it — worse, its default `align-items: stretch` would have forced the `inline-flex` `.sv-tabs__list` to the container's full width the moment a consumer applied the class by hand, so the rule now sets `align-items: flex-start`. No existing usage changes: `Tabs` still accepts every prop `TabsPrimitive.Root` does.
