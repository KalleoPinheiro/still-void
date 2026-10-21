---
'@still-void/ui': minor
---

New `--sv-control-border` token (`controlBorder` in `colors`, `sv-control-border` in the Tailwind theme): the edge of form controls at ≥3:1 on every surface, in both themes (WCAG 1.4.11). `.sv-field` (Input, Textarea, NativeSelect, FileInput) now uses it, so field borders are visibly stronger than before; the decorative `--sv-border` and `--sv-border-strong` are unchanged.
