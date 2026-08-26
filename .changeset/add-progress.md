---
"@still-void/ui": minor
---

Add `Progress`, a server-safe generic progress bar (`value`/`max`, mirroring the native `<progress>` element's default `max=100`), distinct from the existing `ReadingProgress` (client-only, scroll-driven). Renders `role="progressbar"` with the full `aria-valuenow`/`aria-valuemin`/`aria-valuemax` trio; `value` is clamped into `[0, max]`.
