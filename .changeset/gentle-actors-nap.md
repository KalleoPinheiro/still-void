---
"@still-void/ui": patch
---

Fix two stale spots in the shadcn Storybook catalog: `Button`'s `accent` variant — implemented since `3.0.0` and reading `var(--sv-accent-ink)` — was missing from the story's `argTypes` and `AllVariants` render, so it was undiscoverable without already knowing it existed; `Input`'s `FocusState` story described the pre-fix Tailwind `ring-2 ring-accent` mechanism instead of the `outline`-based focus ring the package has actually shipped since the WCAG 2.4.7 fix. Also replaced the raw 🎨 emoji standing in for an icon in `Button`'s icon-size stories with the package's own `Icon` component. No component or CSS changed.
