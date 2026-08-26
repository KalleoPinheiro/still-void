---
"@still-void/ui": minor
---

`DialogContent` gains a `closeLabel?: string` prop for the native close button's accessible name, defaulting to the existing hardcoded `"Close dialog"` (zero behavior change when omitted). Lets a consumer translate the button (e.g. `closeLabel="Fechar"`) instead of disabling it via `showCloseButton={false}` just to avoid shipping untranslated UI.
