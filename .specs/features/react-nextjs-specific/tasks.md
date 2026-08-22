# React/Next.js-Specific Design System — Revision Tasks (test coverage / security / perf audit)

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/react-nextjs-specific/design.md` (see "Revision — 2026-08-22" section)
**Status**: In Progress
**Execution mode**: Inline (user declined per-phase sub-agents)

---

## Test Coverage Matrix

> Generated from codebase sampling (`tests/*.test.{ts,tsx}`, `vitest.config.ts`). Guidelines found: none in `AGENTS.md`/`CLAUDE.md`/`CONTRIBUTING.md` beyond user's explicit "100% coverage" instruction for this revision — strong default + user directive applied (100%, not just AC-mapped).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------- | --------------------- | ----------------- | ------------ |
| shadcn primitives (`src/components/ui/*.tsx`) | unit (RTL) | 100% lines/branches: default render, ref forwarding, every variant/size branch, className merge | `tests/*.test.tsx` | `npm test` |
| Behaviors (`src/behaviors/*.ts`) | unit | 100% lines/branches, all guard clauses (already partially covered — fill remaining branches only) | `tests/*.test.ts` | `npm test` |
| React client wrappers (`src/react/client/*.tsx`, `hooks.ts`, `shadcn.ts`) | unit (RTL) | 100% lines/branches: every prop branch, lifecycle (mount/unmount), error-throw paths | `tests/*.test.tsx` | `npm test` |
| React server-safe components (`src/react/components/*.tsx`) | unit (RTL) | 100% lines/branches: every conditional render branch | `tests/*.test.tsx` | `npm test` |
| `src/lib/utils.ts` (`cn`) | unit | 100%: merge, override, falsy filtering | `tests/*.test.ts` | `npm test` |
| Recipes / tokens (`src/recipes/*.ts`, `src/tokens/*.ts`) | none (already covered by `recipes.test.ts`, `tokenParity.test.ts`, `contrast.test.ts`) | — | — | — |
| Stories (`src/react/stories/**`) | none — excluded from coverage scope (Storybook fixtures, not shipped logic) | — | — | — |

## Parallelism Assessment

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
| --------- | --------------- | ----------------- | -------- |
| RTL component tests | Yes | Each test file renders into its own jsdom container; `afterEach(cleanup)` pattern already used in `tests/react-components.test.tsx:8` and `tests/themeScript.test.tsx:7` | No shared module-level mutable state across these test files |
| Behavior unit tests (`themeManager`, `clipboard`) | No | `themeManager.test.ts` mutates `window.localStorage` / `document.documentElement` attributes — shared jsdom globals across the whole run (default Vitest workers reuse environment per file, but within a file, tests share `document`) | `tests/themeManager.test.ts:8-11` `beforeEach` resets shared `document.documentElement`/`localStorage` state |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ------------ | ------- |
| Quick | After each test-only task | `npm test` |
| Full | After a task that also changes non-test src (e.g. clipboard fix, coverage config) | `npm run typecheck && npm test` |
| Build | Last task of the feature revision | `npm run build && npm run lint:package && npm run typecheck && npm run test:coverage` |

---

## Execution Plan

### Phase 1: Tooling + Security Fix (Sequential)

```
T1 → T2
```

### Phase 2: shadcn Primitive Tests (Parallel OK, no inter-task dependency)

```
      ┌→ T3 [P] ─┐
      ├→ T4 [P] ─┤
      ├→ T5 [P] ─┤
T2 ───┼→ T6 [P] ─┼──→ (Phase 3)
      ├→ T7 [P] ─┤
      ├→ T8 [P] ─┤
      ├→ T9 [P] ─┤
      ├→ T10[P] ─┤
      ├→ T11[P] ─┤
      └→ T12[P] ─┘
```

### Phase 3: Remaining Component / Wrapper Tests (Parallel OK, no inter-task dependency)

```
      ┌→ T13[P] ─┐
      ├→ T14[P] ─┤
      ├→ T15[P] ─┤
(P2)──┼→ T16[P] ─┼──→ (Phase 4)
      ├→ T17[P] ─┤
      ├→ T18[P] ─┤
      └→ T19[P] ─┘
```

### Phase 4: Verification (Sequential)

```
T20
```

---

## Task Breakdown

### T1: Add coverage tooling and 100% threshold gate

**What**: Install `@vitest/coverage-v8`, add `test:coverage` npm script, configure `test.coverage` in `vitest.config.ts` (provider `v8`, `include: ['src/**']`, `exclude: ['src/react/stories/**', 'src/css/**', '**/*.d.ts']`, `thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 }`).
**Where**: `package.json`, `vitest.config.ts`
**Depends on**: None
**Reuses**: existing `vitest.config.ts` structure

**Tools**: MCP: NONE / Skill: NONE

**Done when**:
- [ ] `@vitest/coverage-v8` in `devDependencies`
- [ ] `npm run test:coverage` runs and reports coverage (thresholds will fail until later tasks land — expected at this point)
- [ ] `npm run build`, `npm run typecheck` still pass

**Tests**: none (config-only)
**Gate**: build

**Commit**: `build(test): add v8 coverage provider with 100% threshold gate`

---

### T2: Fix `copyToClipboard` SSR/no-`navigator` guard + regression tests

**What**: Guard `src/behaviors/clipboard.ts:3` against `typeof navigator === 'undefined'` so the function returns `false` instead of throwing `ReferenceError`, per its own documented contract. Add `tests/clipboard.test.ts` covering: (a) resolves `true` when `navigator.clipboard.writeText` succeeds, (b) resolves `false` when `navigator.clipboard` is absent, (c) resolves `false` when `writeText` rejects, (d) resolves `false` when `navigator` itself is undefined.
**Where**: `src/behaviors/clipboard.ts`, `tests/clipboard.test.ts` (new)
**Depends on**: None
**Reuses**: `vi.stubGlobal` pattern from `tests/scrollSpy.test.ts`

**Tools**: MCP: NONE / Skill: NONE

**Done when**:
- [ ] `copyToClipboard()` never throws regardless of `navigator`/`clipboard` availability
- [ ] 4 new tests pass
- [ ] `npm run typecheck` passes

**Tests**: unit
**Gate**: full

**Commit**: `fix(clipboard): guard copyToClipboard against missing navigator`

---

### T3: Test `button.tsx` [P]

**What**: `tests/ui-button.test.tsx` — default render, `ref` forwarding, every `variant` × representative `size` class branch, `className` merge via `cn`, `disabled` passthrough.
**Where**: `tests/ui-button.test.tsx` (new)
**Depends on**: T2 (coverage tooling in place; no code dependency)
**Reuses**: RTL `render`/`cleanup` pattern from `tests/react-components.test.tsx`

**Tools**: MCP: NONE / Skill: NONE
**Done when**: [ ] all variant/size branches in `src/components/ui/button.tsx` exercised; [ ] ref forwarding asserted via `React.createRef`
**Tests**: unit
**Gate**: quick
**Commit**: `test(ui): cover Button variants, sizes and ref forwarding`

---

### T4: Test `badge.tsx` [P]

**What**: `tests/ui-badge.test.tsx` — default variant, each of `secondary`/`destructive`/`outline`, `className` merge.
**Where**: `tests/ui-badge.test.tsx` (new)
**Depends on**: T2
**Tools**: NONE / NONE
**Done when**: [ ] all 4 variant branches in `src/components/ui/badge.tsx` exercised
**Tests**: unit
**Gate**: quick
**Commit**: `test(ui): cover Badge variants`

---

### T5: Test `alert.tsx` [P]

**What**: `tests/ui-alert.test.tsx` — `Alert`/`AlertTitle`/`AlertDescription` render, `role="alert"`, ref forwarding on each, `className` merge.
**Where**: `tests/ui-alert.test.tsx` (new)
**Depends on**: T2
**Tools**: NONE / NONE
**Done when**: [ ] all 3 sub-components rendered and ref-forwarding asserted
**Tests**: unit
**Gate**: quick
**Commit**: `test(ui): cover Alert, AlertTitle, AlertDescription`

---

### T6: Test `card.tsx` [P]

**What**: `tests/ui-card.test.tsx` — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`: render + ref forwarding + className merge for each.
**Where**: `tests/ui-card.test.tsx` (new)
**Depends on**: T2
**Tools**: NONE / NONE
**Done when**: [ ] all 6 sub-components covered
**Tests**: unit
**Gate**: quick
**Commit**: `test(ui): cover Card family components`

---

### T7: Test `input.tsx` [P]

**What**: `tests/ui-input.test.tsx` — default render, `type` passthrough, `disabled`, ref forwarding, className merge.
**Where**: `tests/ui-input.test.tsx` (new)
**Depends on**: T2
**Tools**: NONE / NONE
**Done when**: [ ] ref forwarding + disabled state asserted
**Tests**: unit
**Gate**: quick
**Commit**: `test(ui): cover Input`

---

### T8: Test `tabs.tsx` [P]

**What**: `tests/ui-tabs.test.tsx` — `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` render and switch active tab via user interaction (`@testing-library/user-event` or `.click()`), ref forwarding.
**Where**: `tests/ui-tabs.test.tsx` (new)
**Depends on**: T2
**Reuses**: Radix Tabs is already a runtime dep; no mocking needed (jsdom supports it, same as Dialog pattern to be established in T9)
**Tools**: NONE / NONE
**Done when**: [ ] switching tabs updates `data-state`/visible content
**Tests**: unit
**Gate**: quick
**Commit**: `test(ui): cover Tabs interaction and rendering`

---

### T9: Test `dialog.tsx` [P]

**What**: `tests/ui-dialog.test.tsx` — open via trigger, content becomes visible, `DialogTitle`/`DialogDescription`/`DialogHeader`/`DialogFooter` render, close via `DialogClose`.
**Where**: `tests/ui-dialog.test.tsx` (new)
**Depends on**: T2
**Tools**: NONE / NONE
**Done when**: [ ] open/close lifecycle asserted; [ ] all sub-components rendered at least once
**Tests**: unit
**Gate**: quick
**Commit**: `test(ui): cover Dialog open/close lifecycle and sub-components`

---

### T10: Test `dropdown-menu.tsx` [P]

**What**: `tests/ui-dropdown-menu.test.tsx` — open via trigger, `DropdownMenuItem`/`CheckboxItem`/`RadioItem`/`Label`/`Separator`/`Shortcut`/`Sub`+`SubTrigger`+`SubContent`/`Group`/`RadioGroup` each rendered at least once, `inset` branch on `Item` and `SubTrigger`.
**Where**: `tests/ui-dropdown-menu.test.tsx` (new)
**Depends on**: T2
**Tools**: NONE / NONE
**Done when**: [ ] every exported sub-component rendered; [ ] `inset` true/false branches covered
**Tests**: unit
**Gate**: quick
**Commit**: `test(ui): cover DropdownMenu family and inset variants`

---

### T11: Test `select.tsx` [P]

**What**: `tests/ui-select.test.tsx` — open trigger, `SelectItem`/`SelectLabel`/`SelectSeparator`/`SelectGroup` render, `position="popper"` (default) vs `position="item-aligned"` branch on `SelectContent`.
**Where**: `tests/ui-select.test.tsx` (new)
**Depends on**: T2
**Tools**: NONE / NONE
**Done when**: [ ] both `position` branches covered; [ ] scroll up/down buttons render when applicable
**Tests**: unit
**Gate**: quick
**Commit**: `test(ui): cover Select family and position variants`

---

### T12: Test `tooltip.tsx` [P]

**What**: `tests/ui-tooltip.test.tsx` — `TooltipProvider` + `Tooltip` + `TooltipTrigger` + `TooltipContent` render, default `sideOffset` vs custom override branch.
**Where**: `tests/ui-tooltip.test.tsx` (new)
**Depends on**: T2
**Tools**: NONE / NONE
**Done when**: [ ] default and custom `sideOffset` both exercised
**Tests**: unit
**Gate**: quick
**Commit**: `test(ui): cover Tooltip family`

---

### T13: Test `src/lib/utils.ts` (`cn`) [P]

**What**: `tests/utils.test.ts` — merges multiple class strings, drops falsy values (`false`/`null`/`undefined`), resolves conflicting Tailwind utility classes (tailwind-merge precedence, last wins).
**Where**: `tests/utils.test.ts` (new)
**Depends on**: T2
**Tools**: NONE / NONE
**Done when**: [ ] merge, falsy-filter and conflict-resolution behavior each asserted
**Tests**: unit
**Gate**: quick
**Commit**: `test(lib): cover cn class-merge behavior`

---

### T14: Test `src/react/client/shadcn.ts` barrel [P]

**What**: `tests/shadcn-barrel.test.ts` — import every named export and assert each is defined (`toBeDefined()`), catching broken re-export paths at test time instead of only at build/typecheck time.
**Where**: `tests/shadcn-barrel.test.ts` (new)
**Depends on**: T2
**Tools**: NONE / NONE
**Done when**: [ ] all 15 named exports from `src/react/client/shadcn.ts` asserted defined
**Tests**: unit
**Gate**: quick
**Commit**: `test(react-client): smoke-test shadcn re-export barrel`

---

### T15: Test `ThemeProvider.tsx` + `useTheme` [P]

**What**: `tests/theme-provider.test.tsx` — `useTheme()` throws outside `<ThemeProvider>`; provider supplies `mode`/`accent`; `setMode`/`setAccent`/`toggleMode` update consumers; unsubscribe/destroy on unmount (assert no state updates after unmount, e.g. via spy on `console.error` for act warnings, or by unmounting and triggering a manager event).
**Where**: `tests/theme-provider.test.tsx` (new)
**Depends on**: T2
**Reuses**: `createThemeManager` test patterns from `tests/themeManager.test.ts`
**Tools**: NONE / NONE
**Done when**: [ ] throw-outside-provider asserted; [ ] all 3 setters asserted to update consumer; [ ] unmount cleanup asserted
**Tests**: unit
**Gate**: quick
**Commit**: `test(react-client): cover ThemeProvider and useTheme lifecycle`

---

### T16: Test `ThemeToggle.tsx` [P]

**What**: `tests/theme-toggle.test.tsx` — renders inside `<ThemeProvider>`, label reflects current mode ("Light"/"Dark"), `aria-label` reflects the *next* mode, click calls `toggleMode` and flips rendered label.
**Where**: `tests/theme-toggle.test.tsx` (new)
**Depends on**: T2
**Reuses**: `ThemeProvider` (real, not mocked — matches existing integration-style tests in this repo)
**Tools**: NONE / NONE
**Done when**: [ ] both label states and both `aria-label` states exercised via one click
**Tests**: unit
**Gate**: quick
**Commit**: `test(react-client): cover ThemeToggle label and aria-label states`

---

### T17: Test `ReadingProgress.tsx` (client wrapper) [P]

**What**: `tests/reading-progress-wrapper.test.tsx` — default render has `aria-hidden`, no `role="progressbar"`; `announce` prop renders `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax`/`aria-label`; `target` prop forwarded to the underlying hook (assert via a custom target element's scroll extent affecting reported percent, reusing the `setScrollExtent` helper pattern from `tests/readingProgress.test.ts`).
**Where**: `tests/reading-progress-wrapper.test.tsx` (new)
**Depends on**: T2
**Tools**: NONE / NONE
**Done when**: [ ] both `announce` branches covered; [ ] `target` prop wiring asserted
**Tests**: unit
**Gate**: quick
**Commit**: `test(react-client): cover ReadingProgress wrapper announce/target branches`

---

### T18: Test `TableOfContents.tsx` (client wrapper) [P]

**What**: `tests/table-of-contents.test.tsx` — renders one link per `TocItem`, `href="#id"`, active link gets `aria-current="true"` and the active class when `useScrollSpy` reports that id (mock `IntersectionObserver` per the pattern in `tests/scrollSpy.test.ts`), depth-3 items get the depth modifier class.
**Where**: `tests/table-of-contents.test.tsx` (new)
**Depends on**: T2
**Reuses**: `MockIntersectionObserver` pattern from `tests/scrollSpy.test.ts:10-22`
**Tools**: NONE / NONE
**Done when**: [ ] active-link wiring and depth-3 branch both asserted
**Tests**: unit
**Gate**: quick
**Commit**: `test(react-client): cover TableOfContents active-link and depth wiring`

---

### T19: Test remaining server-safe presentational components [P]

**What**: Extend `tests/react-components.test.tsx` (or a new `tests/react-components-2.test.tsx` if file grows past repo norms) with: `ArticleHeader` (meta row shown/hidden branch), `Prose`/`Lead` (basic render + className merge), `FeaturedPostCard` (with/without `visual` slot branch), `PostGrid`, `Layout` (`withSidebar` branch), `Sidebar`, `SidebarSection`, `Skeleton` (`small` branch), `CardSkeleton`, `Logo` (default vs custom `href`), `Footer` (author/links/children branches).
**Where**: `tests/react-components.test.tsx` (extend) or new file
**Depends on**: T2
**Tools**: NONE / NONE
**Done when**: [ ] every listed component rendered at least once; [ ] every listed conditional branch exercised
**Tests**: unit
**Gate**: quick
**Commit**: `test(react): cover remaining server-safe presentational components`

---

### T20: Verification — 100% coverage gate + build

**What**: Run the Build gate (`npm run build && npm run lint:package && npm run typecheck && npm run test:coverage`). If coverage is below 100% anywhere in scope, identify the uncovered `file:line` and either add the missing assertion to the relevant task's test file (fix-forward, no new task) or, if a line is genuinely unreachable (e.g. a defensive `catch` branch), add a narrowly-scoped `/* v8 ignore next */` with a one-line comment explaining why, and note it in `design.md` Risks & Concerns as resolved.
**Where**: no fixed file — whichever files coverage reports point to
**Depends on**: T1–T19
**Tools**: NONE / NONE

**Done when**:
- [ ] `npm run test:coverage` reports 100% lines/branches/functions/statements for `src/**` (excluding stories/css)
- [ ] `npm run build`, `npm run lint:package`, `npm run typecheck` all pass
- [ ] Feature-level Verifier dispatched per `implement.md` step 10 and `validation.md` updated/appended

**Tests**: none (verification task)
**Gate**: build
**Commit**: (no separate commit unless coverage gaps required fix-forward changes — those get their own small `test(...)`/`fix(...)` commits per gap)

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ----------------------- | --------------- | ------ |
| T1 | None | None | ✅ Match |
| T2 | None | T1 → T2 | ✅ Match (T2 has no code dependency on T1; sequenced only for phase ordering) |
| T3–T12 | T2 | T2 → each, parallel | ✅ Match |
| T13–T19 | T2 | Phase 2 → each, parallel | ✅ Match |
| T20 | T1–T19 | Phase 3 → T20 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | ----------------------------- | ------------------ | ----------- | ------ |
| T1 | config (`vitest.config.ts`) | none | none | ✅ OK |
| T2 | Behaviors (`clipboard.ts`) | unit | unit | ✅ OK |
| T3–T12 | shadcn primitives | unit | unit | ✅ OK |
| T13 | `lib/utils.ts` | unit | unit | ✅ OK |
| T14–T19 | React client/server wrappers | unit | unit | ✅ OK |
| T20 | verification only | — | none | ✅ OK |

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1, T2 | 1 config change / 1 function + its tests | ✅ Granular |
| T3–T18 | 1 file's test suite each | ✅ Granular |
| T19 | Multiple small presentational components, same file, cohesive (all trivial wrapper `<div>`/`<span>` components with no independent logic) | ⚠️ OK — cohesive per Tasks phase granularity rule ("2-3 related things in same file = OK if cohesive"); here it's ~10 near-zero-logic leaf components sharing one recipe module, splitting further would be ceremony without benefit |
| T20 | 1 verification pass | ✅ Granular |
