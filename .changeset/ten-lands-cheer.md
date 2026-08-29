---
"@still-void/ui": minor
---

Add SidebarPanel, SidebarTrigger and SidebarInset components for app shell.

Introduces responsive sidebar components: `SidebarPanel` renders statically in-flow above breakpoint or as off-canvas drawer below, `SidebarTrigger` provides menu button with toggle functionality, and `SidebarInset` is the content container that adjusts via CSS. Exports from `@still-void/ui/react/client`. Depends on `useMediaQuery` for breakpoint detection and `@radix-ui/react-dialog` for drawer modal behavior (already installed). Focus management and scroll-lock handled by Radix Dialog.
