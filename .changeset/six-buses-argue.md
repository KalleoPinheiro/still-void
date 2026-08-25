---
"@still-void/ui": patch
---

Documentation-accuracy fixes surfaced by a design critique: `DESIGN.md`'s frontmatter listed `text-3-light: "#6F6F78"`, a value superseded by a second WCAG contrast fix (`#6D6D76`) that was already what shipped in `theme.css` — the frontmatter now matches. `DESIGN.md`'s Elevation section described the card hover lift as "1px translateY", while `.sv-card-hover:hover` has always shipped `translateY(-2px)` — the doc now matches the code. Also documented, in `docs/design-system.md` and `src/lib/utils.ts`, why `cn()` (shadcn-derived family, `clsx` + `tailwind-merge`) and `cx()` (`recipes/cx`, plain joiner) intentionally coexist rather than one replacing the other. No runtime behavior changed.
