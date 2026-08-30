---
"@still-void/ui": minor
---

Add SidebarInset component for responsive content area.

Introduces `SidebarInset` as the main content container that adjusts responsively to sidebar state via CSS selectors reading `data-state` and `data-collapsible` attributes from the wrapper. Renders as `<main class="sv-app-sidebar-inset">` and supports custom className merging. Allows layout to adapt without JavaScript calculations, following Flat-By-Default Rule.
