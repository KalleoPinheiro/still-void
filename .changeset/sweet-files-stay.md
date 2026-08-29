---
"@still-void/ui": minor
---

Add SidebarProvider and useSidebar for responsive app shell.

Introduces `SidebarProvider` component providing state management for application sidebar with breakpoint detection via `useMediaQuery`. Includes `useSidebar()` hook exposing `{ open, setOpen, toggle, isMobile, collapsible, panelId }`. Supports both controlled and uncontrolled modes. Default `collapsible` mode is `'offcanvas'`. Invalid breakpoint values fall back to 1024px. Wrapper element (`.sv-app-shell`) emits `data-state`, `data-collapsible`, and `data-mobile` attributes for CSS-driven responsive layout. Exported from `@still-void/ui/react/client`.
