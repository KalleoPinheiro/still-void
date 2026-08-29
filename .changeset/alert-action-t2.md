---
"@still-void/ui": minor
---

Add action slot to Alert component.

The Alert component now accepts an `action` prop (a ReactNode) that renders inside a `.sv-alert__action` element. The action slot is not rendered if the prop is omitted, keeping the DOM clean. Works seamlessly with variant classes and icons from T1.
