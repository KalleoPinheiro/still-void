# React/Next.js-Specific Design System — Design

## Architecture Decision

Public API collapses from 3 entries (`.`, `./react`, `./react/client`) to 2 (`./react`, `./react/client`). Internal source layout (`src/tokens`, `src/recipes`, `src/behaviors`, `src/components/ui`) stays as-is — nothing there is framework-coupled, they're just no longer *directly* importable by consumers. `src/index.ts` (the old public core barrel) is deleted; its content is redistributed into the two remaining public barrels so nothing is lost (parity audit below).

## Parity Audit (old `.` entry → new home)

| Old export (from `src/index.ts`) | New home | Reason |
| --- | --- | --- |
| `tokens/colors`, `tokens/typography`, `tokens/spacing`, `tokens/motion`, `tokens/categories`, `tokens/zIndex` | `./react` (re-export) | Pure data, server-safe |
| `types` (`PostSummary`, `TocItem`, `NavItem`) | `./react` (already there) | No change |
| `recipes/cx`, `recipes/shell`, `recipes/content`, `recipes/article` | `./react` (re-export) | Pure functions, server-safe, consumers building custom slots need these class builders |
| `behaviors/themeManager`, `behaviors/scrollSpy`, `behaviors/readingProgress`, `behaviors/clipboard` | `./react/client` (re-export) | DOM/localStorage access — client-only |

Internal components already import tokens/recipes/behaviors via relative paths (`../../tokens/...` etc.), never via the old `.` barrel — deleting `src/index.ts` does not touch internal wiring.

## Package.json Changes

- Remove `exports["."]`
- Remove top-level `main`, `module`, `types` (no legacy fallback — resolution fails loudly per RNS-03)
- `sideEffects: ["*.css"]` unchanged
- `exports["./theme.css"]`, `exports["./style.css"]`, `exports["./package.json"]` unchanged
- `peerDependenciesMeta.react.optional` / `react-dom.optional` → remove (`react`/`react-dom` become hard peer deps, no longer optional)
- `description` updated to drop "framework-agnostic"
- `version`: bumped by changeset (major), not hand-edited

## Build Changes (tsup.config.ts)

Remove `index: 'src/index.ts'` from the first build group's `entry` map. Keep `'react/index'` in that group (ESM+CJS, no `'use client'` banner) and the second group unchanged (`react/client/index`, `'use client'` banner).

## File Changes

- Delete `src/index.ts`
- `src/react/index.ts`: add re-exports for tokens (colors/typography/spacing/motion/categories/zIndex) and recipes (cx/shell/content/article)
- `src/react/client/index.ts`: add re-exports for behaviors (themeManager/scrollSpy/readingProgress/clipboard)
- `scripts/copy-css.mjs`: verify it doesn't reference `dist/index.*` (CSS copy is independent of JS entries — confirm during implementation, no expected change)

## Documentation Deliverables

- `docs/design-system.md` — new: architecture (server vs client split), token catalog, component catalog with import examples, design principles (ported from PRODUCT.md/DESIGN.md, reframed React-first)
- `docs/migration-v1-to-v2.md` — new: breaking changes list, old→new import mapping table (mirrors Parity Audit above), explicit "no migration path" note for non-React consumers, step-by-step upgrade checklist
- `README.md`: update framing (drop "framework-agnostic" positioning), link to new docs
- `DESIGN.md` / `CONTRIBUTING.md`: light edits only where they assert framework-agnosticism as a still-true fact

## Versioning

New changeset: `major` bump. Description (consumer-facing): removal of the framework-agnostic core entry point (`@still-void/ui`), package is now React/Next.js-only; see migration guide.

## Risks

- Anything outside `src/` importing the old `.` entry (tests, Storybook stories, playground) breaks — must grep and fix as part of implementation, not just publish surface.
- `attw`/`publint` must be re-validated against the reduced `exports` map.

## Task Grouping (for Tasks phase)

1. **Package restructure** — delete core entry, add re-exports, update package.json + tsup, fix any internal reference to old entry, verify build/typecheck/lint:package/tests green.
2. **Documentation** — `docs/design-system.md`, README/DESIGN.md/CONTRIBUTING.md updates.
3. **Migration guide + changeset** — `docs/migration-v1-to-v2.md`, major changeset.

3 phases ≤ 3 → execute inline, no sub-agent delegation offer needed.
