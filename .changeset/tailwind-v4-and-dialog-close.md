---
"@still-void/ui": major
---

Require Tailwind v4 (drop the v3 preset), and give `DialogContent` a close button by default.

- **`tailwindcss` moves from `>=3 <4` to `>=4`**, still an optional peer — a consumer with no Tailwind installed at all is unaffected, since no component this package ships has needed Tailwind since this same release migrated the last holdouts (`Dialog`, `DropdownMenu`, `Select`, `Tabs`, `Tooltip`) to `sv-*` CSS.
- **`@still-void/ui/tailwind-preset` is removed**, along with `tailwind.config.ts`. It shipped in Tailwind v3's config format; keeping it exported under a v4 peer range would have re-enabled Tailwind's Preflight for anyone who loaded it, fighting `style.css`. `@still-void/ui/tailwind.css` (see the accompanying minor release) is the v4 replacement, for consumers composing their own markup with Tailwind utilities.
- **`DialogContent` now renders a close button by default** — an `X` icon with the accessible name "Close dialog", positioned top-right. Opt out with `showCloseButton={false}` to keep rendering your own. If your own tests query the dialog by the text "Close" and now get an ambiguous match against ours, either pass `showCloseButton={false}` or scope the query more specifically (e.g. `getByRole('button', { name: 'Close dialog' })`).

See [`docs/migration-v2-to-v3.md`](https://github.com/KalleoPinheiro/still-void/blob/main/docs/migration-v2-to-v3.md) for the full upgrade path.
