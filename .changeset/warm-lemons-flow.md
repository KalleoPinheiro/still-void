---
"@still-void/ui": minor
---

Add an invalid/error state to the form-field system. `Input`, `Textarea`, `NativeSelect`, and `FileInput` already spread `...props`, so `<Input aria-invalid="true" />` alone now paints the border (and the focus outline) in `var(--sv-danger-ink)` — no new boolean prop, no component change required.

New recipe, also exported from `@still-void/ui/react`: `fieldMessage(options?: { variant?: 'hint' | 'error' })`, styling the helper/error text meant to sit under a field and be linked to it via `aria-describedby`. Pair it with `aria-invalid` for a fully accessible error state.
