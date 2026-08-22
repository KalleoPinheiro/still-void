# Validation — React/Next.js-Specific Design System

**Verdict: PASS**

## Per-AC evidence

| Req ID | AC | Evidence |
| --- | --- | --- |
| RNS-01 | tokens/types/recipes exported from `@still-void/ui/react` | `src/react/index.ts` re-exports all 6 token modules + 4 recipe modules + types; `attw`/`publint` green |
| RNS-02 | client behaviors exported from `@still-void/ui/react/client` | `src/react/client/index.ts` re-exports themeManager/scrollSpy/readingProgress/clipboard |
| RNS-03 | bare `@still-void/ui` import fails | `src/index.ts` deleted, `exports["."]`/`main`/`module`/top-level `types` removed from package.json — confirmed no `.` key remains |
| RNS-04 | `publint --strict` + `attw` pass on `./react`, `./react/client`, css, package.json entries | `npm run lint:package` → all 🟢, "All good!" |
| RNS-05 | no token/class value drift | tokens/recipes files untouched, only re-export paths added; `npm test` 171/171 pass (includes `tokenParity.test.ts`, `contrast.test.ts`, `recipes.test.ts`) |
| RNS-06 | theme.css/style.css byte-identical | `scripts/copy-css.mjs` unchanged, still copies `src/css/*.css` verbatim |
| RNS-07/08 | design system doc covers architecture/tokens/catalog, flags client-only components | `docs/design-system.md` written, includes server/client table split per component |
| RNS-09/10/11 | migration guide: full old→new map, no-code-change-to-tokens path, explicit no-path for non-React | `docs/migration-v1-to-v2.md` — full table, "What did not change" section, "If you can't migrate yet" section |
| RNS-12 | major changeset | `.changeset/react-nextjs-only.md`, `"@still-void/ui": major` |

## Discrimination check (manual, no formal mutation harness in this repo)

- Deleting `src/index.ts` without the parity re-exports would have broken `npm run typecheck` (verified: initial run caught the `ReadingProgress` name collision — TS2308 — proving the type-check step actually exercises the new export surface, not a false-green).
- Removing `exports["."]` was confirmed by `publint`/`attw` re-run showing only `./react`, `./react/client`, `./package.json` — no leftover `.` entry.

## Gaps

None blocking. Noted for follow-up (out of this feature's scope, not spec violations):
- No automated CSS byte-diff script exists (RNS-06 verified by unchanged copy logic + passing visual-token tests, not an explicit before/after diff artifact).
- No consumer smoke-test app was created to physically exercise `npm install` against the packed tarball in a Next.js app (Independent Test for P1 story #1 was validated via `publint --pack`/`attw --pack`, which packs and inspects the real tarball, not a full Next.js render).

## Commands run

```
npm run typecheck   # pass
npm run build       # pass
npm run lint:package # pass (publint --strict + attw)
npm test            # 171/171 pass
```

## Diff range

`812fb32..HEAD` on `feature/react-nextjs-specific` (branched from `feature/shadcn-theme-integration`).

---

## Revisão — 2026-08-22: coverage/security/perf audit

**Date**: 2026-08-22
**Design**: `.specs/features/react-nextjs-specific/design.md` — "Revision — 2026-08-22" section
**Tasks**: `.specs/features/react-nextjs-specific/tasks.md` (T1–T20)
**Diff range**: `5cbede0..HEAD` on `feature/react-nextjs-specific`
**Verifier**: independent fresh sub-agent (author ≠ verifier)

**Verdict: PASS ✅** (sensor survivor found and fixed in `b070ffd`; re-verified 5/5 killed, 320/320 tests, coverage still 100% — see Post-Fix Re-Verification below)

### Task Completion (T1–T20)

| Task | Status | Notes |
| --- | --- | --- |
| T1 | ✅ Done | `@vitest/coverage-v8` in `devDependencies` (`package.json`); `vitest.config.ts:9-19` adds `coverage.provider: 'v8'`, `include: ['src/**']`, `exclude: ['src/react/stories/**','src/css/**','**/*.d.ts']`, `thresholds: {lines:100,branches:100,functions:100,statements:100}` |
| T2 | ✅ Done | `src/behaviors/clipboard.ts:3` guards `typeof navigator === 'undefined'`; `tests/clipboard.test.ts` has exactly the 4 specified cases |
| T3–T12 | ✅ Done | `tests/ui-{button,badge,alert,card,input,tabs,dialog,dropdown-menu,select,tooltip}.test.tsx` all present and passing |
| T13 | ✅ Done | `tests/utils.test.ts` covers `cn` merge/falsy-filter/conflict-resolution |
| T14 | ✅ Done | `tests/shadcn-barrel.test.ts` asserts every named export of `src/react/client/shadcn.ts` is defined |
| T15 | ✅ Done | `tests/theme-provider.test.tsx` covers throw-outside-provider, setters, unmount cleanup |
| T16 | ✅ Done | `tests/theme-toggle.test.tsx` covers label/aria-label states |
| T17 | ✅ Done | `tests/reading-progress-wrapper.test.tsx` covers `announce` and `target` branches |
| T18 | ✅ Done | `tests/table-of-contents.test.tsx` covers active-link + depth-3 branch |
| T19 | ✅ Done | `tests/react-components.test.tsx` + `tests/react-components-2.test.tsx` cover remaining server-safe presentational components |
| T20 | ✅ Done | `npm run test:coverage` → 100% statements/branches/functions/lines; `npm run build`, `npm run lint:package`, `npm run typecheck` all pass (re-run independently below) |

### Spec-Anchored Coverage Check (Test Coverage Matrix, `tasks.md`)

| Requirement (Done-when) | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| `copyToClipboard` never throws regardless of `navigator`/`clipboard` availability | resolves `false` (not throw) in all 3 degraded cases + `true` on success | `tests/clipboard.test.ts:9-30` — `expect(copyToClipboard(...)).resolves.toBe(true\|false)` for success/absent-clipboard/rejects/absent-navigator | ✅ PASS |
| `total <= 0` reports 100% (both `measure()` branches: `target` and `document`) | `getPercent() === 1`, `onChange` called with `1` | `tests/readingProgress.test.ts:77-93` — `expect(progress.getPercent()).toBe(1)` for both the document and `target` variants | ✅ PASS |
| shadcn primitives: every variant/size/ref/className-merge branch | ref is the actual DOM node; variant classes present; `className` merged via `cn` (last wins) | `tests/ui-button.test.tsx` (`React.createRef` + `toBe(node)`), `tests/ui-badge.test.tsx`, etc. — spot-checked Button: `ref.current).toBeInstanceOf(HTMLButtonElement)` | ✅ PASS |
| `DropdownMenu` `inset` branches on `Item`/`SubTrigger`/`Label` | inset → `pl-8` class present; non-inset → absent | `tests/ui-dropdown-menu.test.tsx:61-68` — `expect(screen.getByText('Inset label')).toHaveClass('pl-8')` / `expect(...).not.toHaveClass('pl-8')` | ✅ PASS (confirmed via mutation kill, see Sensor) |
| `Select` `position="popper"` vs `"item-aligned"` branch | popper → viewport gets `h-[var(--radix-select-trigger-height)]...` sizing classes; item-aligned → does not | `tests/ui-select.test.tsx:53-60` — asserts only that `Apple`/label text render, **not** that the sizing classes are present/absent on the viewport element | ⚠️ Spec-precision gap — branch is *reached* (100% branch coverage) but the asserted outcome does not target the spec-defined class-presence outcome. See Sensor mutation 5 and Gaps. |
| `ThemeProvider`/`useTheme` throw-outside-provider + lifecycle | `useTheme()` throws when called outside `<ThemeProvider>`; setters update consumer; unsubscribe on unmount | `tests/theme-provider.test.tsx` — throw assertion + setter/unmount assertions present | ✅ PASS |
| `CategoryPill` `interactive` branch | `interactive` → real `<button role="button">` with `aria-pressed`; non-interactive → `<span>`, no button role | `tests/react-components.test.tsx:39,45,50` — `screen.getByRole('button', {name:'IA'})` for interactive; default (span) case asserted via `container.querySelector('.sv-pill')` in the color test | ✅ PASS (confirmed via mutation kill) |
| Security — no `dangerouslySetInnerHTML`/`eval`/`new Function` introduced outside the pre-existing `ThemeScript` | none in new/touched files this revision | `grep -rn "dangerouslySetInnerHTML\|eval(\|new Function(" src/` → only hit is `src/react/components/ThemeScript.tsx:42` (pre-existing, unrelated to this revision) | ✅ PASS |

**Status**: ✅ 7/8 spec-anchored rows fully PASS; 1 spec-precision gap (Select position branch — see Gaps, not a coverage hole, an assertion-strength hole).

### Discrimination Sensor

All 5 mutations were applied to the real working tree (per task instruction), tested, and reverted with `git checkout HEAD -- <file>` immediately after each; `git status --short` confirmed a clean tree after every mutation and at the end of the sensor run.

| # | File:line | Mutation | Killed? |
| --- | --- | --- | --- |
| 1 | `src/behaviors/clipboard.ts:3` | Removed the `typeof navigator === 'undefined'` guard, leaving only `!navigator.clipboard?.writeText` | ✅ Killed — `tests/clipboard.test.ts` "resolves false when navigator itself is undefined" throws `TypeError` instead of resolving |
| 2 | `src/behaviors/readingProgress.ts:45` | Flipped `total <= 0` → `total < 0` (target-element branch) | ✅ Killed — `tests/readingProgress.test.ts` "reports 100% for a target element with no scrollable overflow" gets `NaN` instead of `1` |
| 3 | `src/react/components/Content.tsx:57` | Flipped `if (interactive)` → `if (!interactive)` in `CategoryPill` | ✅ Killed — 2 failures in `tests/react-components.test.tsx` (button role not found for both interactive-branch tests) |
| 4 | `src/components/ui/dropdown-menu.tsx:123` | `DropdownMenuLabel`: `inset && "pl-8"` → `false && "pl-8"` | ✅ Killed — `tests/ui-dropdown-menu.test.tsx` "Inset label" no longer has class `pl-8` |
| 5 | `src/components/ui/select.tsx:75` | `SelectContent` Viewport: `position === "popper"` → `position === "item-aligned"` (swaps which position value gets the popper sizing classes) | ✅ Killed (after fix in `b070ffd`) — originally survived; `tests/ui-select.test.tsx` strengthened to assert `content.className`/`viewport.className` directly for both position values, re-run confirms mutation now fails the suite |

**Sensor depth**: lightweight (5 targeted behavior-level mutations, proportional to a non-P0 UI library revision)
**Result**: 5/5 killed (post-fix)

### Security / Performance Review

| Item (from `design.md` Risks & Concerns) | Verified in code (not just tests)? | Evidence |
| --- | --- | --- |
| `copyToClipboard` SSR/no-`navigator` guard | ✅ Yes | `src/behaviors/clipboard.ts:3` — guard present in source, not just exercised by tests |
| No `dangerouslySetInnerHTML`/`eval`/`new Function` introduced by this revision | ✅ Yes | Full-tree grep shows only the pre-existing `ThemeScript.tsx:42` (documented, CSP-nonce-gated, out of this revision's scope) |
| Performance: readingProgress/scrollSpy/ThemeProvider — no bottleneck | ✅ Yes (unchanged from prior review) | `src/behaviors/readingProgress.ts:67-70` still coalesces scroll/resize into one `rAF`-scheduled update (`schedule()`/`onFrame()`); `ThemeProvider` context value still memoized (unchanged file section, not touched this revision) |
| Coverage tooling actually gates future regressions (not just reports a number) | ✅ Yes | `vitest.config.ts:13-18` sets `thresholds` at 100 for all 4 metrics — a real gate, `npm run test:coverage` exits non-zero below threshold (implicit in vitest coverage behavior, thresholds present) |

No new security-sensitive surface (auth, payments, user-supplied HTML, external network calls) was touched in this revision — it is test-only plus one defensive guard fix, consistent with the diff stat (`src/` changes limited to `clipboard.ts` +1/-1 line and `readingProgress.ts` comment/config, both already covered above).

### Gate Check (re-run independently by this Verifier)

- **Gate command**: `npm run build && npm run lint:package && npm run typecheck && npm run test:coverage`
- **Result**: 4/4 commands passed, 0 failed
  - `npm run build` → tsup ESM+CJS+DTS for both entries, succeeds, CSS copied
  - `npm run lint:package` → `publint --strict` "All good!"; `attw --pack` all 🟢 for `./react`, `./react/client`, `./package.json`
  - `npm run typecheck` → `tsc --noEmit`, no output, exit 0
  - `npm run test:coverage` → **26 test files passed, 319 tests passed**; coverage 100% statements (388/388), 100% branches (236/236), 100% functions (137/137), 100% lines (365/365)
- **Test count before revision** (commit `5cbede0`, counted via `git ls-tree`/`git show`, rough `test(`/`test.each(` occurrence count): ~44 test cases across 10 test files
- **Test count after revision**: 319 tests across 26 test files
- **Delta**: +275 tests (net increase, no deletions found in `git diff --stat 5cbede0..HEAD` — all listed test files are additions)
- **Skipped tests**: none found
- **Failures**: none

### Gaps

None remaining. The one finding from the initial sensor pass (`tests/ui-select.test.tsx` position-branch assertion was shallow — only checked item text rendered, not the actual sizing class list) was fixed in `b070ffd` — `tests/ui-select.test.tsx` now asserts `content.className`/`viewport.className` directly for both `popper` and `item-aligned`. Re-run of mutation #5 against the fixed test now kills the mutant (see Discrimination Sensor above).

### Commands Run

```
git log --oneline 5cbede0..HEAD
git diff --stat 5cbede0..HEAD
npm run build
npm run lint:package
npm run typecheck
npm run test:coverage
npx vitest run tests/clipboard.test.ts                              # sensor mutation 1
npx vitest run tests/readingProgress.test.ts tests/reading-progress-wrapper.test.tsx  # sensor mutation 2
npx vitest run tests/react-components.test.tsx                      # sensor mutation 3
npx vitest run tests/ui-dropdown-menu.test.tsx                      # sensor mutation 4
npx vitest run tests/ui-select.test.tsx                              # sensor mutation 5
npx vitest run                                                       # final full-suite sanity check, 319/319 pass
git status --short                                                   # confirmed clean after every mutation revert
```

### Post-Fix Re-Verification (independent, after `b070ffd`)

Re-ran the full gate independently after the Select assertion fix landed:

- `npm run test:coverage` → 26 test files, **320/320 tests passed** (was 319 pre-fix — the strengthened test replaced 1 test with 2, net +1), coverage still **100%** statements (388/388), branches (236/236), functions (137/137), lines (365/365)
- Mutation #5 re-applied against the fixed `tests/ui-select.test.tsx` → now fails as expected (mutant killed), then reverted; `git status --short` clean after revert

### Summary

**Overall**: ✅ PASS — no known gaps or survivors remaining

**Spec-anchored check**: 8/8 fully matched spec outcome (Select position-branch gap closed by `b070ffd`)
**Sensor**: 5/5 mutations killed (post-fix re-run)
**Gate**: 4/4 gate commands passed, coverage 100% lines/branches/functions/statements

**What works**: The clipboard SSR guard fix is real and tested; the 100% coverage threshold is a genuine enforced gate (not just a report); all 18 new test files map cleanly to the Test Coverage Matrix in `tasks.md`; no dangerous DOM/eval patterns introduced; readingProgress/dropdown-menu/CategoryPill/Select mutations are all caught by the suite.

**Issues found**: none outstanding. The Select position-branch assertion-strength gap found by the initial sensor pass was fixed and re-verified in the same revision.

**Next steps**: None required — revision is complete and clean.
