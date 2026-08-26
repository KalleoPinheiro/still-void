# Round 4 — Validation Report

**Verifier**: independent (did not author the implementation)
**Date**: 2026-08-26
**Method**: spec-anchored AC check, mutation testing (discrimination sensor), full gate run, design-principles audit.

---

## Verdict per requirement

| Requirement | Verdict | Notes |
| --- | --- | --- |
| R4-01 IconName gains `camera`/`blocked`/`pending` | **PASS (minor gap)** | Geometry-uniqueness loop in `tests/ui-icon.test.tsx` covers the 3 new names automatically and would catch a duplicate-glyph mistake (verified by mutation, see below). But no test pins `ICON_NAMES.length === 18` against a literal constant — the spec's own "Independent Test" line calls for exactly this assertion and it is not present. The suite compares `drawn.size` to `ICON_NAMES.length` (self-referential), so a scenario where only 1 or 2 of the 3 new icons were actually added (instead of 3) would still pass every existing assertion. |
| R4-02 DialogContent `closeLabel` | **PASS** | `tests/ui-dialog-behavior.test.tsx` covers all 3 ACs: default `"Close dialog"` preserved, override to `"Fechar"` works, `showCloseButton={false}` still wins over `closeLabel`. Mutation-tested (see below): killed. |
| R4-03 Separator | **PASS** | All 5 ACs covered in `tests/ui-separator.test.tsx` with real DOM/attribute assertions (role, aria-orientation, classList) plus `tests/ui-separator-css-contract.test.ts` for the CSS declaration (`var(--sv-border)`, no box-shadow, width/height swap on `--vertical`). Mutation-tested: killed. |
| R4-04 Progress | **PASS** | All 6 ACs + both clamp edge cases covered in `tests/ui-progress.test.tsx` (ARIA trio, defaults, indicator width incl. `value>max` and negative `value`, plus a `max=0` divide-by-zero case not explicitly required by spec but a reasonable addition) and `tests/ui-progress-css-contract.test.ts`. Mutation-tested: killed. |
| R4-05 Pagination family | **PASS** | All 7 ACs + the href+onClick edge case covered in `tests/ui-pagination.test.tsx`, including tag-name assertions (`<a>` vs `<button>`), `aria-current`, icon presence, i18n label override, and the full composed range. CSS contract file checks active/hover/focus-visible tokens and outline-not-shadow. Mutation-tested: killed. |
| R4-06 Chart primitives | **PASS** | All 6 ACs + empty-array edge cases covered in `tests/ui-chart.test.tsx` with element-level assertions (`viewBox`, `points` string equality, `fill`/`stroke` attributes, tick `<text>` content and anchor). CSS contract checks `overflow: visible` and token-sourced stroke/fill colors. Mutation-tested: killed. |

**Overall: 6/6 requirements have real, spec-anchored test coverage.** One minor gap found in R4-01 (see Discrimination Sensor / Gaps below) — not a functional defect, but a coverage weakness relative to what the spec's own Independent Test line promised.

---

## Discrimination sensor (mutation testing)

6 mutants injected (one per file), one at a time, `git diff` verified empty after each revert. All 6 mutants were killed by the existing test suite:

| # | File | Mutation | Command | Result |
| --- | --- | --- | --- | --- |
| 1 | `src/components/ui/progress.tsx` | Dropped the upper clamp: `Math.min(Math.max(value, 0), max)` → `Math.max(value, 0)` | `npx vitest run tests/ui-progress.test.tsx` | **Killed** — "value above max clamps to 100%" test failed (`147.05...%` vs `100%`) |
| 2 | `src/components/ui/icon-set.ts` | Swapped `pending: ClockIcon` → `pending: NoSymbolIcon` (duplicate of `blocked`'s glyph) | `npx vitest run tests/ui-icon.test.tsx` | **Killed** — "every curated name maps to a real, distinct glyph" failed (`17` distinct geometries vs `18` names) |
| 3 | `src/components/ui/separator.tsx` | Flipped orientation check: `orientation === "vertical" && ...` → `orientation === "horizontal" && ...` for the `--vertical` modifier class | `npx vitest run tests/ui-separator.test.tsx` | **Killed** — 2 tests failed (default no longer clean, vertical no longer gets the modifier) |
| 4 | `src/components/ui/pagination.tsx` | Flipped `href !== undefined` → `href === undefined` in `PaginationLink` (inverts `<a>`/`<button>` selection) | `npx vitest run tests/ui-pagination.test.tsx` | **Killed** — multiple failures (href test rendering a button, i18n label lookup on wrong element type, etc.) |
| 5 | `src/components/ui/chart.tsx` | Changed `ChartLine`'s point-join separator from `,` to `;` | `npx vitest run tests/ui-chart.test.tsx` | **Killed** — `points` string-equality assertion failed |
| 6 | `src/components/ui/dialog.tsx` | Hardcoded wrong default: `closeLabel = 'Close dialog'` → `closeLabel = 'Fechar'` | `npx vitest run tests/ui-dialog-behavior.test.tsx` | **Killed** — "without closeLabel the accessible name stays 'Close dialog'" failed |

No mutant survived. `git diff` confirmed empty after every revert; final `git status` shows a clean working tree.

---

## Full gate check

| Gate | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | **PASS** (no output, exit 0) |
| Full test suite | `npx vitest run` | **PASS** — 66 test files, 1286 tests, 0 failures |
| Coverage | `npm run test:coverage` | **PASS** — 100% across the board (see below) |
| Build | `npm run build` | **PASS** — tsup ESM/CJS/DTS builds succeeded for both `react/index` and `react/client/index`, CSS copied |
| Package lint | `npm run lint:package` | **PASS** — publint "All good!", attw all green (node10/node16-cjs/node16-esm/bundler) for both subpaths |
| Server-safety | `npx vitest run tests/server-safety.test.ts` | **PASS** — 118 tests, walker confirms no hook reachable from the server-safe entry |

### Coverage summary

```
 Test Files  66 passed (66)
      Tests  1286 passed (1286)
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------
=============================== Coverage summary ===============================
Statements   : 100% ( 565/565 )
Branches     : 100% ( 340/340 )
Functions    : 100% ( 189/189 )
Lines        : 100% ( 542/542 )
================================================================================
```

Threshold (100% lines/branches/functions/statements, `vitest.config.ts`) is met.

---

## Design-principles check (DESIGN.md)

- **No `box-shadow` (other than `none`)** in the Separator/Progress/Pagination/Chart CSS sections of `src/css/style.css`: confirmed by direct read of all 4 sections (lines 1445–~1583) and by the `no box-shadow` assertion present in each of the 4 CSS contract test files, all passing.
- **Colors from `var(--sv-*)` tokens, no hardcoded hex/rgb**: confirmed by direct read — every color-bearing declaration in the 4 new sections (`background`, `stroke`, `fill`, `color`) uses a `var(--sv-*)` token (`--sv-border`, `--sv-surface-2`, `--sv-accent`, `--sv-surface`, `--sv-text`, `--sv-text-2`, `--sv-text-3`, `--sv-accent-ink`). No `#` or `rgb(` literals found in these sections.
- **Focus states use `outline`, never `box-shadow`/ring**: `.sv-pagination__link:focus-visible` uses `outline: 2px solid var(--sv-accent-ink)` with `outline-offset: 2px` — no box-shadow-based focus ring anywhere in the new sections. (Separator/Progress/Chart have no focusable elements of their own, so no focus rule is expected there.)
- **No React hook / `useId` / `createContext` / `'use client'` in the 4 new server-safe files** (`separator.tsx`, `progress.tsx`, `pagination.tsx`, `chart.tsx`): confirmed by direct grep of each file — none found.
- **`tests/server-safety.test.ts` gate**: run explicitly, 118/118 passing, confirming the server-safe entry graph (including the 6 new exports) contains no hook.

All design-principles checks **PASS**.

---

## Gaps found (ranked)

1. **(Low severity) R4-01 AC2 — no literal assertion pinning `ICON_NAMES.length === 18`.** The spec's own "Independent Test" line for this requirement explicitly calls for `ICON_NAMES.length === 18` as an assertion. `tests/ui-icon.test.tsx` instead asserts `drawn.size === ICON_NAMES.length` and `new Set(drawn.values()).size === ICON_NAMES.length` — both self-referential to whatever `ICON_NAMES` currently contains, not to the literal count of 18 the spec promises. Confirmed via `grep` for `18` in the test file (zero matches) and via mutation testing: swapping one new icon's glyph for a duplicate was caught (uniqueness check works), but a scenario where fewer than 3 new names were added in the first place (e.g. only `camera` and `blocked`, `pending` forgotten) would not be caught by this test — it would just make `ICON_NAMES.length` be 17 and the test would still pass at 17-of-17 unique. This is a coverage gap against the spec's stated Independent Test, not a functional defect — the actual shipped code does have all 18 names, confirmed by direct read of `icon-set.ts`.

No other gaps found. All 6 requirements' acceptance criteria have real, behavior-asserting tests; all 6 injected mutants were killed; all gate commands (typecheck, full suite, 100% coverage, build, lint:package, server-safety) pass; all DESIGN.md constraints (no box-shadow, token-only colors, outline-based focus, server-safety/no-hooks) verified directly against source.
