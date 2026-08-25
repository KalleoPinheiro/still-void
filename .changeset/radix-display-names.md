---
"@still-void/ui": patch
---

Give every Radix-derived component in the client family a real `displayName`. `Dialog`, `Tabs`, `Tooltip`, `Select`, `DropdownMenu`, and `AlertDialog` previously copied `displayName` from the underlying Radix primitive (`X.displayName = XPrimitive.Y.displayName`), but `@radix-ui/react-dialog`, `-tabs`, `-tooltip`, `-select`, and `-dropdown-menu` never declare one — so every one of these components showed up as `ForwardRef` in React DevTools instead of its own name. No behavior change.
