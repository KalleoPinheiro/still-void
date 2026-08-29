---
"@still-void/ui": minor
---

Add action support to toasts.

Extends `ToastOptions` with optional `action` parameter containing label, required altText, and onClick callback. Renders as a button within the toast with accompanying close button. Action click dismisses the toast after executing callback. AltText requirement enforced by types.
