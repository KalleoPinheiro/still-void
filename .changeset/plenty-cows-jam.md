---
"@still-void/ui": minor
---

`Header`'s nav is now collapsible below 640px. It renders inside a native `<details>`/`<summary>` disclosure — zero JavaScript, no client boundary, `Header` stays server-safe. `<summary>` shows a `menu` icon as the tap target; opening it turns the nav into a right-aligned dropdown panel with 44px touch targets per link. Above 640px the markup is unchanged in behavior: CSS forces the nav to stay visible regardless of the native open/closed state, so there is exactly one `Header` markup for every width, never a duplicated mobile/desktop nav.

`headerClasses` gains two new keys: `navToggle` (`sv-header__nav-toggle`) and `navSummary` (`sv-header__nav-summary`), for consumers composing their own markup around the recipe instead of the `Header` component.
