# Rodada 2 Validation

**Date**: 2026-08-25
**Spec**: `.specs/features/still-void-gaps-round-2/spec.md`
**Diff range**: `2658472..HEAD` (37 commits, branch `claude/still-void-gaps-round-2`)
**Verifier**: independent fresh sub-agent (author ≠ verifier), assisted by 4 parallel research sub-agents for evidence gathering (ICON, CLIENT CSS, ALERT+BTN, TW) — all mutation testing, gate runs, and the CLIENT-01/05/06/07/09/10/12/13/14 and CARD-01..06 evidence were re-derived directly by this Verifier, not delegated.

---

## Task Completion

T1–T24 all show a commit hash in tasks.md and every commit listed is present in `git log 2658472..HEAD`. T25 and T26 carry no commit hash and are explicitly listed as follow-up tasks outside the 45-AC scope (`displayName` real values, `.sv-tabs` orphan class) — confirmed **not** required by any of ICON/CLIENT/ALERT/BTN/CARD/TW-numbered ACs in spec.md, so their absence is not a gap.

| Task | Status | Notes |
| --- | --- | --- |
| T1–T24 | ✅ Done | commit hash present, verified in git log |
| T25 | ⏭️ Out of scope | not mapped to any of the 45 ACs; tracked as future work |
| T26 | ⏭️ Out of scope | not mapped to any of the 45 ACs; tracked as future work |

---

## Spec-Anchored Acceptance Criteria (45/45)

### ICON-01..07 — Icon layer

| AC | Spec-defined outcome | file:line — assertion | Result |
| --- | --- | --- | --- |
| ICON-01 | `<svg class="sv-icon" stroke="currentColor" aria-hidden="true">` | `src/components/ui/icon.tsx:33-48`; `tests/ui-icon.test.tsx:33-41` — `expect(svg.getAttribute('stroke')).toBe('currentColor')`, `aria-hidden` = `'true'` | ✅ PASS |
| ICON-02 | `size="sm"/"lg"` → modifier class; `md` → no modifier; size from `var(--sv-space-*)` | `icon.tsx:38-39`; `tests/ui-icon.test.tsx:58-70` (`.not.toMatch(/sv-icon--/)` for md); `src/css/style.css:1015-1028`; `tests/icon-css-contract.test.ts:78-127` (exact-key token map, bans px/hex) | ✅ PASS |
| ICON-03 | `label` swaps `aria-hidden` → `role="img"` + `aria-label` | `icon.tsx:44-46`; `tests/ui-icon.test.tsx:74-88` | ✅ PASS |
| ICON-04 | server-safe, no `'use client'`/hook reachable | `src/react/index.ts:17`; `tests/server-safety.test.ts:250-266` (`test.each(graphEntries)`, exhaustive over reachable first-party files including icon.tsx/icon-set.ts) | ✅ PASS |
| ICON-05 | unknown `name` → `alert-circle` (`ICON_FALLBACK_NAME`), no throw | `icon.tsx:31`; `icon-set.ts:83`; `tests/ui-icon.test.tsx:92-100` (glyph-identity check, not just no-throw) | ✅ PASS |
| ICON-06 | named imports only from `@heroicons/react/24/outline`, no `import *`/root barrel | `icon-set.ts:2-18`; `tests/ui-icon.test.tsx:118-127` (regex on source text) | ✅ PASS |
| ICON-07 | `server-safety` walks bare/third-party specifiers | `tests/server-safety.test.ts:116-147` (`resolveBare`), `:197-209` (queues bare packages), `:278-289` (non-vacuity guard: proves walk reached `@heroicons/react/24/outline/.../XMarkIcon`), `:291-301` (`vendorOffenders` = `[]`) | ✅ PASS |

### CLIENT-01..14 — Client family CSS

| AC | Spec-defined outcome | file:line — assertion | Result |
| --- | --- | --- | --- |
| CLIENT-01 | Only `sv-*` classes emitted by all 5 client components; zero dead-utility residue | `tests/client-class-contract.test.tsx:99-115` (`assertOnlySystemClasses`, sweeps `document.body`, asserts `foreign` array `toEqual([])`, explicitly checks 7 named dead classes absent), run for Dialog/Tabs/Tooltip/Select/DropdownMenu at `:118-207`; corroborated per-component by `tests/ui-dialog-behavior.test.tsx:92-119`, `tests/ui-tabs-classes.test.tsx`, `tests/ui-tooltip-classes.test.tsx` | ✅ PASS |
| CLIENT-02 | every color/spacing/radius/z-index via `var(--sv-*)` | `tests/client-css-contract.test.ts:84-121` (`literalPxDeclarations`, hex/oklch/rgba bans, z-index regex `^var\(--sv-z-[a-z]+\)$`); manual grep of `style.css:1030-1399` confirms only allowed `1px`/`2px` border/outline literals remain | ✅ PASS |
| CLIENT-03 | `[data-state]` opacity + fast/hover transition; `reduce` override in the **same sheet, after** the base rule | `style.css:1044-1054,1076-1083,1152-1159` (base+fade); `style.css:1371,1394-1397` (reduce override, same file, after); `theme.css:234-247` (explicit "moved out" doc comment); `tests/client-css-contract.test.ts:128-134,237-242,317-320`; `tests/reduced-motion-contract.test.ts:88-121` (byte-offset cascade-order structural check, not a hardcoded file list) | ✅ PASS |
| CLIENT-04 | zero `box-shadow` ≠ `none` in client sections | `tests/client-css-contract.test.ts:102` (`not.toMatch(/box-shadow/)`) applied to all 5 sections at `:230-235,309-315,409-411,439-450,467-469`; manual grep of `style.css:1030-1399` confirms zero occurrences | ✅ PASS |
| CLIENT-05 | open `DialogContent` exposes `aria-modal="true"` | `src/components/ui/dialog.tsx:46`; `tests/ui-dialog-behavior.test.tsx:133-139` — `toHaveAttribute('aria-modal', 'true')` | ✅ PASS |
| CLIENT-06 | default close button (`Icon name="x"` + `Close dialog` sr-only text), clicking closes; `showCloseButton={false}` omits it | `dialog.tsx:51-56`; `tests/ui-dialog-behavior.test.tsx:142-186` — renders icon+sr-only text (`:143-150`), accessible name (`:152-158`), click-closes (`:160-166`), opt-out (`:168-175`), no collision with consumer `DialogClose>Close</DialogClose>` (`:177-186`) | ✅ PASS |
| CLIENT-07 | `displayName` identical to pre-migration (which is `undefined` for every Radix-forwarded member, confirmed by grep across dist — see spec's own precision note) | `dialog.tsx:24,60,88,100`; `tests/ui-dialog-behavior.test.tsx:189-199` — asserts `undefined` for forwarded members, literal string for plain-div members; equivalent pattern confirmed for Tabs/Tooltip/Select/DropdownMenu by grep (`X.displayName = XPrimitive.Y.displayName`) | ✅ PASS |
| CLIENT-08 | zero `!important`, zero `@layer` dependency | `tests/client-css-contract.test.ts:110`; manual `grep -n "!important\|@layer" src/css/style.css` → zero matches file-wide | ✅ PASS |
| CLIENT-09 | `SelectItem` (check), `DropdownMenuCheckboxItem` (check), `DropdownMenuRadioItem` (CSS dot `.sv-menu-item__dot`) indicators render only when checked | `select.tsx:125-129`; `tests/ui-select-value.test.tsx:92-105` (checked→svg present, unchecked→indicator absent from DOM, not just hidden); `dropdown-menu.tsx:101-105,130-134`; `tests/ui-dropdown-menu-indicator.test.tsx:25-70` (checkbox + radio-dot, both directions) | ✅ PASS |
| CLIENT-10 | `SelectTrigger` renders `chevron-down`; scroll buttons render `chevron-up`/`chevron-down` | `select.tsx:41,57,71`; `tests/ui-select-value.test.tsx:107-110`; `tests/ui-dropdown-menu-indicator.test.tsx:72-88` (SubTrigger `chevron-right`) | ✅ PASS |
| CLIENT-11 | focus outline `2px solid var(--sv-accent-ink)` / `outline-offset: 2px`, never `ring-*`, on all 5 components' focusable elements | `tests/client-css-contract.test.ts:221-227` (Dialog close), `:368-372` (menu item), `:452-461` (Tabs trigger/content); `tests/field-css-contract.test.ts:120-125` (Select trigger via shared `.sv-field`); Tooltip has no focusable element of its own (correctly untested) | ✅ PASS |
| CLIENT-12 | `ui-dialog/select/tabs/tooltip/dropdown-menu.test.tsx` pass unedited | `git diff --stat 2658472..HEAD -- tests/ui-dialog.test.tsx tests/ui-tabs.test.tsx tests/ui-tooltip.test.tsx` → empty (untouched); `tests/ui-select.test.tsx` and `tests/ui-dropdown-menu.test.tsx` edited only under the documented AD-014 exception — diff confirms only literal-string swaps (`pl-8`→`sv-menu-item--inset`, `bg-sv-border`→`sv-menu-separator`, Tailwind arbitrary-variant strings→`sv-pop--popper`/`sv-pop__viewport--popper`), same behavior re-asserted, never weakened | ✅ PASS |
| CLIENT-13 | `SelectItem` wraps children in `SelectPrimitive.ItemText`; trigger shows picked value's text | `select.tsx:137`; `tests/ui-select-value.test.tsx:66-89` — selects a real value via `userEvent`, asserts `trigger()` `toHaveTextContent('Apple')`, placeholder gone, value switch updates text | ✅ PASS |
| CLIENT-14 | `icon` prop substitutes default indicator on `SelectItem`/`SelectTrigger`/`DropdownMenuCheckboxItem`/`DropdownMenuRadioItem`/`DropdownMenuSubTrigger`; `icon={null}` collapses the slot | `select.tsx:19,27,40,113,119,125`; `dropdown-menu.tsx:19-23,30,89-95,101,114-122,130` — payload-level assertions (custom node present + default icon absent, both directions) at `tests/ui-select-value.test.tsx:113-176` and `tests/ui-dropdown-menu-indicator.test.tsx:91-...` | ✅ PASS |

### ALERT-01..06 — AlertDialog

| AC | Spec-defined outcome | file:line — assertion | Result |
| --- | --- | --- | --- |
| ALERT-01 | 11 exports available from client entry | `src/react/client/shadcn.ts:23-33`; `tests/ui-alert-dialog.test.tsx:77-92`; `tests/shadcn-barrel.test.ts:17-27,64-70` | ✅ PASS |
| ALERT-02 | `role="alertdialog"` + `aria-modal="true"` | `alert-dialog.tsx:29-37`; `tests/ui-alert-dialog.test.tsx:99,105` | ✅ PASS |
| ALERT-03 | only `sv-*` classes, reuses Dialog CSS, no new block | grep of `style.css` confirms no AlertDialog-specific block (only a comment on `.sv-overlay` noting shared use); `tests/ui-alert-dialog.test.tsx:114-144` (exact reused class strings + static-source class-literal sweep) | ✅ PASS |
| ALERT-04 | no X close button | no `showCloseButton`/`Icon name="x"`/`.sv-dialog__close` anywhere in `alert-dialog.tsx`; `tests/ui-alert-dialog.test.tsx:162,164` — `.sv-dialog__close` absent AND exactly 2 buttons exist (positive count, not just absence of a string) | ✅ PASS |
| ALERT-05 | `displayName` matches Dialog family pattern | `alert-dialog.tsx:21,40,68,80,95,107`; `tests/ui-alert-dialog.test.tsx:193-200` | ✅ PASS |
| ALERT-06 | doc↔barrel cross-check | `docs/design-system.md:140`; `tests/shadcn-barrel.test.ts:82-103` (generic drift-catcher, parses doc's family list against live barrel) | ✅ PASS |

### BTN-01..04 — Button accent variant

| AC | Spec-defined outcome | file:line — assertion | Result |
| --- | --- | --- | --- |
| BTN-01 | `sv-btn sv-btn--accent` emitted | `button.tsx:14,20`; `tests/ui-button-accent.test.tsx:24-29` | ✅ PASS |
| BTN-02 | `background: var(--sv-accent-ink)`, `color: var(--sv-bg)`, hover via `color-mix` on same token | `style.css:868-873`; `tests/ui-button-accent.test.tsx:53-67` (regex-exact + no-hex ban) | ✅ PASS |
| BTN-03 | follows `[data-theme]`/`[data-accent]` automatically | `theme.css:140-154` (`--sv-accent-ink` redefined under all 4 `[data-accent]`); `tests/contrast.test.ts:59-67` (WCAG contrast across 4 accents × 2 themes) | ✅ PASS |
| BTN-04 | default/existing 6 variants unchanged | `tests/ui-button.test.tsx:30-80` (pre-existing, unmodified); `tests/ui-button-accent.test.tsx:31-43` (explicit regression + distinctness check) | ✅ PASS |

### CARD-01..06 — Card `as`/`asChild`

| AC | Spec-defined outcome | file:line — assertion | Result |
| --- | --- | --- | --- |
| CARD-01 | `as="section"` etc. → matching tag, `sv-card` kept | `card.tsx:28-33`; `tests/ui-card-element.test.tsx:16-24` (`test.each` over 4 tags) | ✅ PASS |
| CARD-02 | no prop → `<div>` | `tests/ui-card-element.test.tsx:26-29` | ✅ PASS |
| CARD-03 | `asChild` merges class/ref/props onto single child, no wrapper | `card.tsx:25-26`; `slot.tsx:54-109`; `tests/ui-card-element.test.tsx:42-123` — no-wrapper (`:55`), object ref (`:58-67`), callback ref (`:69-77`), composed ref with child's own ref (`:79-90`), onClick merge order `['child','card']` (`:92-101`), className concatenation (`:103-112`), style merge (`:114-123`) — full payload/conjunction coverage, not just "no throw" | ✅ PASS |
| CARD-04 | `asChild` wins over `as` when both given | `card.tsx:24-25` (`if (asChild)` checked before `as` lookup); `tests/ui-card-element.test.tsx:127-138` — asserts rendered tag is `<a>` (child) not `<section>`, and no `<section>` exists anywhere | ✅ PASS |
| CARD-05 | `@still-void/ui/react` stays server-safe | `tests/server-safety.test.ts` `test.each(graphEntries)` covers `card.tsx` and `slot.tsx` (both reachable via `src/react/index.ts:14` → `card.tsx` → `slot.tsx`, relative imports); `slot.tsx` contains no hook, no `'use client'`; `tests/package-contract.test.ts:150-152` confirms `@radix-ui/react-slot` is NOT a dependency. **Note:** the literal spec premise ("WHEN `@radix-ui/react-slot` vira dependência direta") did not occur — AD-015 (dated 2026-08-25, in STATE.md) supersedes the AD-006 plan design.md still describes, after discovering `@radix-ui/react-slot`'s `Slot` calls `useComposedRefs` → `React.useCallback`, a real hook that would have broken server-safety. `Card` instead uses a vendored, hook-free `Slot` port (`slot.tsx`) with zero import of `@radix-ui/react-slot` or `@radix-ui/react-compose-refs`. The AC's *outcome* (server-safe) is achieved and more robustly proven (mechanically true rather than argued), but its stated precondition is now false. Flagged as a spec-precision note, not a gap — see below. | ✅ PASS (spec-precision note) |
| CARD-06 | invalid `as` at runtime → `<div>`, not a literal tag | `card.tsx:13,28` (`Set` lookup, not `as any` cast); `tests/ui-card-element.test.tsx:31-38` | ✅ PASS |

### TW-01..08 — Tailwind v4 CSS entry

| AC | Spec-defined outcome | file:line — assertion | Result |
| --- | --- | --- | --- |
| TW-01 | utilities resolve to `var(--sv-*)` | `tests/tailwind-css-contract.test.ts:148-201` — **real Tailwind v4 compile** via `compile()` from the `tailwindcss` npm package (`:150,179`), `compiled.build([...])` against actual utility names, regex-matched against generated CSS bodies (`:196-200`) | ✅ PASS |
| TW-02 | `@theme inline`, all values `var(--sv-*)`, no `@source`, no dead aliases | `src/css/tailwind.css:34-72`; `tests/tailwind-css-contract.test.ts:50-58,61-71,74-86` | ✅ PASS |
| TW-03 | `exports["./tailwind.css"]` → `./dist/tailwind.css`, copy script | `package.json:59`; `scripts/copy-css.mjs:11`; `tests/tailwind-css-contract.test.ts:130-140`; confirmed present in `dist/tailwind.css` after `npm run build` | ✅ PASS |
| TW-04 | peer `>=4`, optional; dev `^4` | `package.json:95,98-100,123`; `tests/package-contract.test.ts:97-104` | ✅ PASS |
| TW-05 | every `--color-sv-*` has a `theme.css` token | `tests/tailwind-css-contract.test.ts:115-127` | ✅ PASS |
| TW-06 | README: no component requires Tailwind, convenience framing, v4+ | `README.md:220-235` | ✅ PASS |
| TW-07 | v3 preset artifacts fully removed | `tests/package-contract.test.ts:87-115`; filesystem confirms `src/tailwind-preset.ts` and `tailwind.config.ts` both gone; `tsup.config.ts` has only 2 entries; repo grep for `tailwind-preset` (excluding node_modules/CHANGELOG/.specs/.changeset) returns only `tests/package-contract.test.ts` (assertions of absence) | ✅ PASS |
| TW-08 | `docs/migration-v2-to-v3.md` documents the two breaking changes | `docs/migration-v2-to-v3.md:7-8,27-69` | ✅ PASS |

**Status**: ✅ All 45 ACs covered and matched to spec-defined outcomes. One spec-precision note (CARD-05, see above) — outcome achieved, precondition text stale due to a documented mid-round pivot (AD-015).

---

## Discrimination Sensor

All mutations injected directly into the real working tree, run against the targeted test(s), then reverted with `git checkout --` (confirmed `git status` clean before and after every mutation — no stash needed since the tree started clean and each mutation/revert cycle was verified individually).

| # | File:line | Mutation | Target test(s) | Killed? |
| --- | --- | --- | --- | --- |
| 1 | `src/components/ui/dialog.tsx:47` | Reintroduced dead Tailwind class `ring-ring` into `DialogContent`'s className | `tests/client-class-contract.test.tsx` | ✅ Killed — `foreign` array contained `['ring-ring']` |
| 2 | `src/components/ui/select.tsx:137` | Removed `SelectPrimitive.ItemText` wrapper around `SelectItem` children | `tests/ui-select-value.test.tsx` | ✅ Killed — 2 tests failed, trigger text empty instead of `'Apple'` |
| 3 | `src/components/ui/card.tsx:25` | Changed `asChild` precedence to `if (asChild && as === undefined)` so `as` wins when both given | `tests/ui-card-element.test.tsx` | ✅ Killed — `<section>` rendered when it should not have |
| 4 | `src/components/ui/dialog.tsx:46` | Removed `aria-modal="true"` from `DialogContent` | `tests/ui-dialog-behavior.test.tsx` | ✅ Killed — attribute assertion failed, received `null` |
| 5 | `src/css/style.css:1394-1397` | Removed `.sv-overlay` from the `prefers-reduced-motion` override block (reproduces the exact T24 cascade defect) | `tests/reduced-motion-contract.test.ts`, `tests/client-css-contract.test.ts` | ✅ Killed — both files failed |
| 6 | `src/components/ui/icon.tsx:31` | Removed the `?? ICON_GLYPHS[ICON_FALLBACK_NAME]` fallback for an unknown `name` | `tests/ui-icon.test.tsx` | ✅ Killed — threw `Element type is invalid` instead of falling back |

**Sensor depth**: lightweight (6 targeted mutations, above the 1–3 default minimum given the feature's breadth across 3 different verification mechanisms: CSS-as-text, RTL behavior, and a manifest).
**Result**: 6/6 killed — ✅ PASS

---

## Payload/Conjunction Rule — spot check

Applied explicitly to the ACs the task called out as payload-bearing:

- **CLIENT-06** (close button): `tests/ui-dialog-behavior.test.tsx` asserts the *rendered payload* — the icon's class (`:148`), the sr-only text's exact string `'Close dialog'` (`:149`), the accessible name derived from it (`:152-158`), and that clicking actually removes the dialog from the DOM (`:160-166`), not just that a click handler fired.
- **CLIENT-09/13/14** (indicators, `icon` prop): `tests/ui-select-value.test.tsx` and `tests/ui-dropdown-menu-indicator.test.tsx` assert on rendered DOM state after a real `userEvent` interaction — checked item has an `svg` inside `.sv-menu-item__indicator`, unchecked item has no indicator node at all (not just a hidden one), the trigger's `textContent` literally becomes `'Apple'`, and a custom `icon` node is present while the default icon is confirmed absent (`apple.querySelector('svg.sv-icon')).not.toBeInTheDocument()`) — a true value/absence check on both sides of the substitution, not merely "no error was thrown."
- **CARD-03/04** (asChild merge and precedence): `tests/ui-card-element.test.tsx` asserts merge order for `onClick` (`['child', 'card']`, proving both handlers ran, in order), `className` concatenation (both classes present), `style` object merge (both properties present), ref composition (both the Card ref and the child's own ref end up pointing at the same node), and for precedence, a **negative** structural assertion (`container.querySelector('section')` is null) rather than only a positive assertion of the winning tag.

No conjunction gaps found in the sampled ACs — all payload-bearing assertions check actual resulting value/state, not call-occurred-ness.

---

## Spec-Precision Gaps

None of the 45 ACs are ambiguous about their expected outcome — all had a concrete, checkable value (a class string, an attribute value, a boolean, a file path, a token reference) and evidence targeting exactly that value.

One **note** (not a gap): **CARD-05**'s literal precondition ("WHEN `@radix-ui/react-slot` vira dependência direta") is now counterfactual — AD-015 (2026-08-25) replaced that plan with a vendored `Slot` after discovering the real package's hook usage. `design.md`'s "Components" section for `Card` still describes the superseded plan (`@radix-ui/react-slot@1.3.3` promoted to a direct dependency) and was not updated alongside AD-015. The AC's *outcome* — server-safety preserved — is fully satisfied and, per AD-015's own reasoning, satisfied more robustly than the original plan would have been. This is a stale premise in prose, not a functional gap: no fix task warranted.

---

## Code Quality

| Principle | Status |
| --- | --- |
| No features beyond what was asked | ✅ |
| No abstractions for single-use code | ✅ — `slot.tsx` is deliberately narrower than Radix's Slot (no `Slottable`, no lazy support), scoped to Card's actual single-child use |
| Only touched files required for task | ✅ — diff scope matches the 7 phases in design.md |
| Matches existing patterns/style | ✅ — new CSS sections follow the `.sv-field`-style shared-primitive pattern design.md called for |
| Tests map to ACs, non-shallow | ✅ — spot-checked Select/DropdownMenu/Card stories above; all use real interaction (`userEvent`) or structural DOM assertions, not `toContain` on adjacent text |
| Spec-anchored outcome check | ✅ — see 45-AC table above |
| Every test maps to a spec AC or edge case | ✅ — no unclaimed test files found during review |
| Documented guidelines followed | `CLAUDE.md` changeset-per-src-change rule (5 changesets present, correctly leveled patch/minor/major), `CONTRIBUTING.md` bump-level rules (AD-004 patch-vs-major distinction correctly applied), `vitest.config.ts` 100% coverage gate (met) |

---

## Edge Cases (from spec.md)

- [x] `prefers-reduced-motion: reduce` → instant open/close, no residual transition (T24 fix verified, mutation-tested)
- [x] Two dialogs in sequence use `--sv-z-modal`/`--sv-z-backdrop` tokens, never literal `z-50` (CLIENT-02 contract covers z-index as `var(--sv-z-*)` only)
- [x] `Icon` + consumer `className` sums onto `sv-icon`, doesn't replace it (`tests/ui-icon.test.tsx`)
- [x] `Card asChild` with >1 child → explicit Slot error, not silent wrapper (`tests/ui-card-element.test.tsx:141-163`)
- [x] `SelectContent position="item-aligned"` stays CSS-valid — popper modifiers are conditional (`select.tsx:92,100`, tested by `tests/ui-select.test.tsx`'s item-aligned case)
- [x] No-Tailwind consumer renders all 43 client exports correctly styled (CLIENT-01/02 contracts are the proof — zero Tailwind dependency by construction)
- [x] `AlertDialogAction` closes the dialog (`tests/ui-alert-dialog.test.tsx`)
- [x] New CSS sections use the same `/* ---------- Name ---------- */` marker the contract tests slice on (confirmed by reading style.css section headers)
- [x] Consumer `icon` + unchecked item → no leak into neutral state (`tests/ui-select-value.test.tsx:132-147`, `tests/ui-dropdown-menu-indicator.test.tsx`)
- [x] `tailwind-config-contract.test.ts` removal + preset blocks in `package-contract.test.ts` removed intentionally under AD-012, declared in commit `91a151e`

---

## Gate Check

- **Gate command**: `npm run test`, `npm run typecheck`, `npm run build`, `npm run lint:package`, `npm run test:coverage` — all run directly by this Verifier, not taken on faith from prior runs.
- **`npm run test`**: 55 test files, **1129/1129 passed**, 0 failed.
- **`npm run typecheck`**: clean, no errors.
- **`npm run build`**: succeeds; produces `dist/tailwind.css` (3.4K) alongside `style.css`, `theme.css`, `shadcn-overrides.css`.
- **`npm run lint:package`**: `publint --strict` — all good; `attw --pack .` — both `@still-void/ui/react` and `@still-void/ui/react/client` green on node10/node16(CJS)/node16(ESM)/bundler.
- **`npm run test:coverage`**: 1129/1129 passed; **100% statements (508/508), 100% branches (307/307), 100% functions (168/168), 100% lines (485/485)** — meets the project's `vitest.config.ts` 100% gate.
- **Test count**: tasks.md's own running total after T24 was 971; final count is 1129 (+158 from T15–T23: AlertDialog, Button accent, Card, tailwind.css, and associated contract tests). No test count decrease outside the two AD-012-authorized removals (`tailwind-config-contract.test.ts` deleted, preset blocks removed from `package-contract.test.ts`), both declared in commit `91a151e`.
- **Skipped tests**: none found.
- **Failures**: none.

---

## Changeset Verification

5 changesets present in `.changeset/`, all correctly leveled per spec's Success Criteria:
- `patch`: `client-family-css-fixes.md` (round 2 client-family defects), `theme-and-focus-fixes.md` (round 1 leftover)
- `minor`: `round-2-catalog.md` (Icon, AlertDialog, Button accent, Card as/asChild, tailwind.css), `form-and-table-primitives.md` (round 1 leftover)
- `major`: `tailwind-v4-and-dialog-close.md` (peer `>=4`, preset removal, Dialog close-button-by-default)

Matches spec's Success Criteria bullet exactly. `package.json` version is still `2.0.1` (pre-release), which is correct — version bumps are owned by `npm run version-packages` and the release workflow, never hand-edited, per `CLAUDE.md`.

---

## Requirement Traceability Update

All 45 requirements (ICON-01..07, CLIENT-01..14, ALERT-01..06, BTN-01..04, CARD-01..06, TW-01..08) move from **Pending** → **✅ Verified**.

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 45/45 ACs matched spec outcome (1 spec-precision note, non-blocking, see above)
**Sensor**: 6/6 mutations killed
**Gate**: 5/5 commands passed (test, typecheck, build, lint:package, test:coverage), 100% coverage on all 4 metrics

**What works**: All 5 client components (Dialog, Select, DropdownMenu, Tabs, Tooltip) migrated to `sv-*` CSS with zero Tailwind residue, verified by both a whole-tree class sweep and a static source-literal sweep. The Select blank-trigger defect (CLIENT-13) and the reduced-motion cascade defect (CLIENT-03/T24) — both real, previously-shipped bugs — are fixed and mutation-confirmed. `AlertDialog`, `Icon`, `Button variant="accent"`, and `Card as`/`asChild` are all new, fully tested, and server-safety-preserving. The AD-014 test-edit exception (2 files) was verified against its own claim: only literal-string swaps, same behavior re-proven, never weakened. The AD-015 architectural pivot (vendored `Slot` instead of a direct `@radix-ui/react-slot` dependency) was verified against its own claim: `slot.tsx` imports neither `@radix-ui/react-slot` nor `@radix-ui/react-compose-refs`, and is covered by the same server-safety walker as everything else.

**Issues found**: None requiring a fix task. One documentation staleness noted (design.md's Card section describes the pre-AD-015 plan) — cosmetic, does not affect any AC or shipped behavior.

**Next steps**: Ship. T25/T26 remain correctly queued as separate follow-up tasks, out of this round's 45-AC scope.
