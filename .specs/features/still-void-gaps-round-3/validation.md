# Still Void Gaps — Round 3 Validation

**Date**: 2026-08-25
**Spec**: `.specs/features/still-void-gaps-round-3/spec.md`
**Diff range**: `93b97e4..HEAD` (`18d4660` fix(client): displayName, `64fa362` fix(tabs): sv-tabs container)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

No `tasks.md` exists for this feature — spec.md is scoped "Medium" and explicitly skips Design/Tasks in favor of two atomic commits listed in the Requirement Traceability table.

| Requirement | Commit | Status |
| ----------- | ------ | ------ |
| R3-01 | `18d4660` | ✅ Done |
| R3-02 | `64fa362` | ✅ Done |

---

## Spec-Anchored Acceptance Criteria

### P1: `displayName` real em componentes derivados do Radix (R3-01)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| AC1: WHEN DevTools inspeciona qualquer membro `forwardRef` das 6 famílias THEN `displayName` SHALL ser o nome literal do export | Literal string equal to export identifier for every forwardRef member across Dialog, Tabs, Tooltip, Select, DropdownMenu, AlertDialog | `src/components/ui/dialog.tsx:24,63,91,103`; `src/components/ui/alert-dialog.tsx:21,40,68,80,95,107`; `src/components/ui/tabs.tsx:15,26,38,50`; `src/components/ui/tooltip.tsx:22`; `src/components/ui/select.tsx:46,60,74,108,139,151,163`; `src/components/ui/dropdown-menu.tsx:43,55,69,83,107,136,150,162` — each is `X.displayName = "X"` (literal, not `XPrimitive.Y.displayName`) | ✅ PASS |
| AC2: WHEN a test lê `Componente.displayName` para qualquer membro das 6 famílias THEN o valor SHALL ser string igual ao identificador, nunca `undefined` | Every asserted value is the literal export name string | `tests/ui-dialog-behavior.test.tsx:212-217` — `expect(DialogOverlay.displayName).toBe('DialogOverlay')` (+3 more); `tests/ui-alert-dialog.test.tsx:190-197` — `expect(AlertDialogContent.displayName).toBe('AlertDialogContent')` (+7 more); `tests/ui-tabs-classes.test.tsx:135-140` — `expect(Tabs.displayName).toBe('Tabs')` (+3 more); `tests/ui-tooltip-classes.test.tsx:88-91` — `expect(TooltipContent.displayName).toBe('TooltipContent')`; `tests/ui-select.test.tsx:94-100` — `expect(SelectTrigger.displayName).toBe('SelectTrigger')` (+6 more); `tests/ui-dropdown-menu.test.tsx:86-94` — `expect(DropdownMenuSubTrigger.displayName).toBe('DropdownMenuSubTrigger')` (+8 more) | ✅ PASS |
| AC3: WHEN membros que já tinham `displayName` literal fixo (`DialogHeader`, `DialogFooter`, `AlertDialogHeader`, `AlertDialogFooter`, `DropdownMenuShortcut`) são revisados THEN o valor SHALL permanecer inalterado | Same literal string as before this round, no regression | `src/components/ui/dialog.tsx:71,79` — `DialogHeader.displayName = "DialogHeader"` / `DialogFooter.displayName = "DialogFooter"` (untouched lines, confirmed via `git diff` — no diff hunk on these lines); `src/components/ui/alert-dialog.tsx:48,56` untouched; `src/components/ui/dropdown-menu.tsx:170` untouched; asserted unchanged by `tests/ui-dialog-behavior.test.tsx:218-219`, `tests/ui-alert-dialog.test.tsx:196-197`, `tests/ui-dropdown-menu.test.tsx:94` | ✅ PASS |

**Status**: ✅ All ACs covered — 3/3 spec-anchored, 0 gaps.

### P1: `Tabs` emite `sv-tabs` no container raiz (R3-02)

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| AC1: WHEN `Tabs` é renderizado sem `className` THEN o elemento raiz SHALL ter a classe `sv-tabs` | Root element carries exactly `sv-tabs` | `tests/ui-tabs-classes.test.tsx:97-105` — `expect(container.firstElementChild).toHaveClass('sv-tabs')` | ✅ PASS |
| AC2: WHEN `Tabs` é renderizado com `className="custom"` THEN o elemento raiz SHALL ter ambas as classes (`sv-tabs custom`) via `cn` | Both classes present, merged | `tests/ui-tabs-classes.test.tsx:107-116` — `expect(container.firstElementChild).toHaveClass('sv-tabs')` and `.toHaveClass('mine')` | ✅ PASS |
| AC3: WHEN a regra `.sv-tabs` no CSS é inspecionada THEN ela SHALL declarar `align-items: flex-start` | `align-items` computed value is exactly `flex-start` | `tests/client-css-contract.test.ts:440-445` — `expect(decl(tabs, '.sv-tabs', 'align-items')).toBe('flex-start')` | ✅ PASS |
| AC4: WHEN `tests/ui-tabs.test.tsx` (suíte já existente) roda após a mudança THEN todos os testes SHALL continuar passando sem alteração de asserção | Pre-existing suite unmodified and green | `tests/ui-tabs.test.tsx` — `git diff 93b97e4..HEAD` shows **zero changes** to this file; full suite run confirms all tests pass (see Gate Check) | ✅ PASS |

**Status**: ✅ All ACs covered — 4/4 spec-anchored, 0 gaps.

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| --- | --- | --- | --- |
| 1 | `src/components/ui/tabs.tsx:11` | Reverted `className={cn("sv-tabs", className)}` → `className={className}` (Tabs stops emitting `sv-tabs`) | ✅ Killed — `tests/ui-tabs-classes.test.tsx` 2 failed (root-class + merge tests) |
| 2 | `src/components/ui/tooltip.tsx:22` | Changed `TooltipContent.displayName = "TooltipContent"` → `"WrongName"` | ✅ Killed — `tests/ui-tooltip-classes.test.tsx` 1 failed (component identity test) |
| 3 | `src/css/style.css:1312-1316` | Removed `align-items: flex-start;` from `.sv-tabs` (falls back to default `stretch`) | ✅ Killed — `tests/client-css-contract.test.ts` 1 failed (`.sv-tabs aligns to flex-start...`) |

All mutations applied directly to the working tree, confirmed failing, then reverted with `git checkout -- <file>`. Working tree verified clean (`git status --short`) after each revert and at sensor completion.

**Sensor depth**: lightweight (3 targeted mutations, default tier)
**Result**: 3/3 killed — PASS ✅

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code | ✅ — 2 commits, 16 files total, each change directly traces to R3-01 or R3-02 |
| Surgical changes | ✅ — no unrelated formatting/comment changes; `DialogHeader`/`DialogFooter`/etc. literal-displayName lines left untouched |
| No scope creep | ✅ — `git show --stat` on both commits matches exactly the 6 component families + their test files + 2 changesets + `style.css`; no files outside that set touched |
| Matches existing patterns | ✅ — `Tabs`'s new `forwardRef<ElementRef, ComponentPropsWithoutRef>` structure is byte-for-byte the same shape as `TabsList`/`TabsTrigger`/`TabsContent` in the same file (and the other 5 already-converted families) |
| Spec-anchored outcome check (asserted values match spec) | ✅ — every assertion targets the literal string spec.md requires (`"ComponentName"`) or the literal CSS value (`flex-start`), not a vague "is defined" check |
| Per-layer Coverage Expectation met | ✅ — all 6 families + CSS contract covered 1:1 with the two ACs |
| Every test maps to a spec requirement | ✅ — new/changed tests all tagged `R3-01`/`R3-02` in their `describe` titles |
| Documented guidelines followed | `CLAUDE.md` (port-don't-redesign / changeset discipline) — both changesets are `patch`-level per the "token value corrected against the spec is a patch" rule; no aesthetic value invented, `align-items: flex-start` is a correctness fix, not a redesign |

**Test Integrity note**: 4 pre-existing tests (`ui-dialog-behavior.test.tsx`, `ui-alert-dialog.test.tsx`, `ui-tabs-classes.test.tsx`, `ui-tooltip-classes.test.tsx`) previously asserted `expect(X.displayName).toBeUndefined()`. Rewriting them to assert the literal name is not a test-integrity violation — it is the explicit, spec-required outcome of R3-01 (AC1/AC2), and spec.md's Assumptions table documents this as the inherited decision from round 2's T25. Confirmed via `git diff` on all 4 files: each rewritten assertion changed `toBeUndefined()` → `toBe('LiteralName')`, strengthening rather than weakening the assertion.

Two source-scan regex tests (`tests/ui-tabs-classes.test.tsx`, `tests/ui-tooltip-classes.test.tsx`) were narrowed from "every quoted string literal in the file" to "only `className=` positions." Verified as legitimate, not scope creep: the identical narrowed pattern (`className=(?:\{cn\(([^)]*)\)\}|"([^"]*)")` with the same "Only className positions..." comment) already existed, unmodified by this round, in `tests/ui-dialog-behavior.test.tsx` (pre-existing, confirmed via `git diff` — the source-scan block there has zero diff hunks) and `tests/ui-alert-dialog.test.tsx` (same, zero diff hunks on that block). The narrowing was necessary because the new literal `displayName` string values (e.g. `"TabsList"`) would otherwise be caught by a bare string sweep and fail the `sv-*` pattern check — this round's change brought tabs/tooltip in line with dialog/alert-dialog's pre-existing, more precise pattern.

---

## Edge Cases

- [x] Edge case 1 (ref forwarding): `Tabs` uses `React.forwardRef<React.ElementRef<typeof TabsPrimitive.Root>, ...>` and passes `ref` through to `TabsPrimitive.Root`. Verified by `tests/ui-tabs-classes.test.tsx:118-125` — `expect(ref.current).toBeInstanceOf(HTMLDivElement)`.
- [x] Edge case 2 (regression guard on already-literal displayNames): Covered by AC3 above — the pre-existing regression assertions for `DialogHeader`/`DialogFooter`/`AlertDialogHeader`/`AlertDialogFooter`/`DropdownMenuShortcut` remain in the test files and pass unchanged.

---

## Gate Check

- **Gate commands**: `npm run test`, `npm run typecheck`, `npm run build`, `npm run lint:package`
- **Result**:
  - `npm run test`: 55 test files passed, **1137 tests passed**, 0 failed — exit 0
  - `npm run typecheck`: exit 0, no output (clean)
  - `npm run build`: exit 0, ESM/CJS/DTS builds succeeded for both `react` and `react/client` entries, CSS copied
  - `npm run lint:package`: exit 0 — publint "All good!", attw all green (🟢) across node10/node16/bundler for both subpaths
- **Test delta**: `git diff 93b97e4..HEAD -- tests/` shows 10 new `test(` blocks added, 4 removed (the 4 rewritten `toBeUndefined` tests, replaced 1:1 with literal-name assertions) → **net +6 tests** for this round (new displayName-identity tests for DropdownMenu, Select; new sv-tabs root-container tests ×3; new CSS contract test for `align-items`; net of the AlertDialog/Dialog/Tooltip/Tabs rewrites nets to zero new tests, since old assertion was replaced in place).
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

None — no gaps found.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| --- | --- | --- |
| R3-01 | Implementing (commit `18d4660`) | ✅ Verified |
| R3-02 | Implementing (commit `64fa362`) | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 7/7 ACs matched spec outcome (3 for R3-01, 4 for R3-02), 0 spec-precision gaps
**Sensor**: 3/3 mutations killed
**Gate**: 4/4 commands passed (test, typecheck, build, lint:package)

**What works**:
- All 6 Radix-derived families (`Dialog`, `Tabs`, `Tooltip`, `Select`, `DropdownMenu`, `AlertDialog`) now assign literal `displayName` strings to every `forwardRef` member; pre-existing literal-displayName members (headers/footers/shortcut) are untouched and regression-tested.
- `Tabs` is now `forwardRef`, emits `sv-tabs` on its root, merges consumer `className` via `cn`, and forwards `ref` — matching the pattern already used by its 3 sibling members and the other 5 converted families.
- `.sv-tabs` CSS rule now declares `align-items: flex-start`, fixing the `stretch`-vs-`inline-flex` contradiction the round-2 finding (T26) identified.
- Both changesets are correctly scoped `patch` (correctness fixes, no behavior/API change for existing consumers), consistent with `CLAUDE.md`'s versioning rules.
- Scope is tight: `git show --stat` on both commits shows only the files directly implicated by R3-01/R3-02 — no drive-by changes.

**Issues found**: none

**Next steps**: none — feature is ready to close out T25/T26 debt from round 2.
