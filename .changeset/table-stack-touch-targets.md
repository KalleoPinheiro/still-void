---
"@still-void/ui": minor
---

Narrow and touch viewports:

- `Table` accepts `stack`: below 40rem each row renders as a block of label/value pairs. Pass the column name to each cell with the new `TableCell` `label` prop (rendered as `data-label`). The header row is hidden visually and stays available to assistive technology. At 40rem and up the table renders as before.
- On `(width < 40rem), (pointer: coarse)`, `.sv-btn` gets `min-height` and `min-width` of 44px, `.sv-field` and `.sv-tabs__trigger` get `min-height: 44px`, and `.sv-tabs__list` grows to fit its triggers and scrolls horizontally inside itself instead of widening the page. This meets WCAG 2.5.5 touch targets. Pointer-fine desktop keeps the current sizes.
- Fix: `.sv-layout` uses `grid-template-columns: minmax(0, 1fr)` so its column no longer grows to its content's min-content and pushes narrow pages sideways.
- Below 40rem, `Hero`'s title uses the headline step (`--sv-text-2xl`, 1.75rem) instead of the display step, so a phone shows the page's content above the fold. No token value changes.
- Fix: `TabsContent` stretches to the width of `Tabs` (`align-self: stretch`); the root's `align-items: flex-start` was shrinking panels to their content's min-content width.
