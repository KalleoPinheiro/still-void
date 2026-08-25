---
"@still-void/ui": patch
---

Close the last 5 findings from a design critique's mechanical detector sweep of the Storybook catalog: `CategoryPill`'s `RawColor` story is now marked with an inline exception comment (it demonstrates a documented arbitrary-color passthrough, exempted by DESIGN.md's One-Accent Rule — not drift), and four off-scale inline-style literals (`Icon.stories.tsx`, `Select.stories.tsx`, `Tooltip.stories.tsx` ×2) now reference real DESIGN.md tokens instead of hardcoded values. All changes are in Storybook demo code only — no component or CSS shipped to consumers changed.
