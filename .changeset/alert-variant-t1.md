---
"@still-void/ui": minor
---

Add semantic variant to Alert component with derived role and default icon.

The Alert component now accepts a `variant` prop ('info', 'success', 'warning', 'danger') that automatically derives the appropriate `role` ('alert' for danger/warning, 'status' for info/success) and renders a semantic icon. The icon can be customized via the `icon` prop or hidden with `icon={null}`. Alerts without a variant maintain their current behavior unchanged.
