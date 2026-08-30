---
"@still-void/ui": minor
---

Add icon and none collapsible modes to the app sidebar.

Extends `SidebarProvider` with `collapsible` prop supporting `'icon'` (displays rail of icons when closed on desktop, drawer on mobile), `'offcanvas'` (default, drawer on mobile), and `'none'` (always expanded, no trigger rendered). `SidebarTrigger` returns `null` when `collapsible="none"`. All modes render `data-collapsible` attribute for CSS-driven styling.
