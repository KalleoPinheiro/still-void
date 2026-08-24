---
"@still-void/ui": patch
---

Fix theming, focus visibility, and packaging defects in the shadcn-derived components.

- **Components now follow `[data-theme]`.** The package's Tailwind config previously hard-coded its color tokens as literal hex values, so every shadcn-derived component (including `Input`) stayed locked to the dark palette even under `[data-theme='light']`. Colors now reference the same `var(--sv-*)` custom properties the rest of the system uses — `theme.css` itself is unchanged, this is a wiring fix, not a value change. The 9 `*-light` color aliases in the Tailwind config, which had no effect once the variables carried the switch, were removed.
- **Every form field now shows a visible focus ring.** `focus-visible:ring-accent` referenced a Tailwind color that didn't exist in the package's config, so keyboard focus was invisible on any field (a WCAG 2.4.7 failure). Focus is now `outline: 2px solid var(--sv-accent-ink)` with a 2px offset, on `Input`, `Textarea`, `NativeSelect`, `FileInput`, `Checkbox`, and `RadioGroupItem`.
- **`Button` and `Badge` no longer reference nonexistent colors.** Classes like `bg-destructive`, `bg-background`, `text-accent`, `ring-ring`, and `bg-red-500` resolved to nothing in the package's own config; they now map to the corresponding Still Void tokens (`--sv-danger`, `--sv-bg`, `--sv-accent-ink`, etc). `Badge`'s default variant no longer pins to cyan — it now follows the active `data-accent`, like every other accent-bearing element (the One-Accent Rule).
- **The Tailwind preset and `shadcn-overrides.css` now ship in the published package** — both were referenced in documentation but absent from the npm tarball until now.
- **One visual value changed:** the form-field frame's `font-size` moves from Tailwind's unspecified `text-sm` default (14px) to `var(--sv-text-base)` (15px). This affects `Input`, `Textarea`, `NativeSelect`, and `FileInput`. 14px was never a Still Void spec value — it was an unlabeled Tailwind default — so this is a correction against the token scale, not a redesign; height, corner radius, padding, and colors are unchanged.
