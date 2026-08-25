---
"@still-void/ui": patch
---

Fix `Header`'s desktop nav going invisible in browsers that implement `<details>` via a `::details-content` pseudo-element (the newer WHATWG rendering model, e.g. current Chrome). That pseudo-element is `content-visibility: hidden` while `<details>` has no `open` attribute; overriding `display` on the light-DOM `.sv-header__nav` child alone never reached past it, so the ≥641px "no-op wrapper" rule silently failed to show the nav on a closed `<details>` in those browsers. The ≥641px media query now also resets `.sv-header__nav-toggle::details-content` (`content-visibility`, `block-size`, `overflow`) back to its unhidden defaults; browsers without `::details-content` support simply skip that rule and keep relying on the existing `display` override.
