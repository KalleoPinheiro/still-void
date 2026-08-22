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

---

## Revision — 2026-08-22: test-coverage / security / performance audit

Post-ship revision requested by user: find technical gaps, bring unit-test coverage to 100%, review security and performance across the feature's file surface (`src/**`).

### Risks & Concerns

| Concern | Location (file:line) | Impact | Mitigation |
| ------- | -------------------- | ------ | ---------- |
| Security — `copyToClipboard` reads `navigator.clipboard` unguarded for the case `navigator` itself is undefined | `src/behaviors/clipboard.ts:3` | If ever invoked outside a DOM environment (e.g. accidentally imported into a server path, or a future non-browser test harness) this throws an uncaught `ReferenceError` instead of returning `false` per its own doc contract ("Returns false when the Clipboard API is unavailable") | Add `typeof navigator === 'undefined'` guard; add regression test for both "no navigator" and "no Clipboard API" paths |
| Test coverage gap — 0 tests for every shadcn primitive | `src/components/ui/{alert,badge,button,card,dialog,dropdown-menu,input,select,tabs,tooltip}.tsx` | Regressions in variant class logic (button/badge), `forwardRef` wiring, or Radix composition ship undetected | Add RTL render tests per component: default render, ref forwarding, variant class branches, `className` merge via `cn` |
| Test coverage gap — `cn` (`clsx` + `tailwind-merge`) has no direct test | `src/lib/utils.ts:4` | Silent regression in class-merge precedence (e.g. Tailwind conflict resolution) goes unnoticed | Unit test covering merge/override/falsy-filtering behavior |
| Test coverage gap — client wrapper components untested directly (only their underlying `behaviors/*` are) | `src/react/client/ReadingProgress.tsx`, `src/react/client/TableOfContents.tsx`, `src/react/client/ThemeToggle.tsx`, `src/react/client/hooks.ts` | Wiring bugs between hook output and rendered markup/ARIA attrs (e.g. `announce` branch, `aria-current`) would not be caught even though the underlying behavior is | Add RTL tests per wrapper: default + `announce` prop, `TableOfContents` active-link wiring, `ThemeToggle` inside/requires `ThemeProvider` |
| Test coverage gap — `ThemeProvider`/`useTheme` untested | `src/react/client/ThemeProvider.tsx:83-87` | The documented `throw` when `useTheme` is used outside a provider, and the mount→subscribe→unsubscribe lifecycle, are unverified | Add tests: throws outside provider, provides state, updates on `setMode`/`setAccent`/`toggleMode`, unsubscribes on unmount |
| Test coverage gap — several server-safe presentational components exported but never rendered in tests | `src/react/components/Article.tsx` (`ArticleHeader`, `Prose`, `Lead`), `src/react/components/Content.tsx` (`FeaturedPostCard`, `PostGrid`, `Layout`, `Sidebar`, `SidebarSection`, `Skeleton`, `CardSkeleton`), `src/react/components/Shell.tsx` (`Logo`, `Footer`) | Conditional branches (e.g. `ArticleHeader` meta row only when `author`/`date`/`readMinutes` present; `FeaturedPostCard` visual slot) unverified | Add RTL render tests per component covering conditional branches |
| Test coverage gap — `src/react/client/shadcn.ts` re-export barrel unverified | `src/react/client/shadcn.ts` | A broken re-export (typo, wrong source path) would only surface at build/typecheck time, not test time, delaying feedback | Add a smoke test importing every named export and asserting it is defined |
| Tooling gap — no coverage provider configured | `vitest.config.ts` | "100% coverage" is unverifiable without instrumentation; can't gate future regressions | Add `@vitest/coverage-v8`, wire a `coverage` npm script, set `thresholds` in `vitest.config.ts` |
| Performance — reviewed, no action needed | `src/behaviors/readingProgress.ts`, `src/behaviors/scrollSpy.ts`, `src/react/client/ThemeProvider.tsx` | n/a | Already rAF-throttled (readingProgress), IntersectionObserver-based (scrollSpy), and context value is `useMemo`'d (ThemeProvider) — no bottleneck found |

### Tech Decisions

| Decision | Choice | Rationale |
| -------- | ------ | --------- |
| Coverage provider | `@vitest/coverage-v8` | Already using Vitest; v8 provider needs no extra instrumentation step, matches Node/browser (jsdom) runtime already configured |
| Coverage scope | `src/**` excluding `src/react/stories/**` (Storybook demos, not shipped logic) and `src/css/**` | Stories are documentation fixtures, not testable units — including them would force meaningless tests just to hit a number |
| Coverage threshold | 100% lines/branches/functions/statements on in-scope files, enforced via `vitest.config.ts` `test.coverage.thresholds` | Matches the user's explicit "100%" requirement; hard-gates future PRs, not just a one-time report |
