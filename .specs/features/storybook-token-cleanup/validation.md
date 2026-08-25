# Storybook Token Cleanup Validation

**Date**: 2026-08-25
**Spec**: `.specs/features/storybook-token-cleanup/spec.md`
**Diff range**: `5244dfc..756c579` (commits `13fcce5`, `756c579`)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 — `CategoryPill.stories.tsx` RawColor documented exception (SBC-01) | ✅ Done | `13fcce5` — comment block + inline ignore directive added, `args` unchanged |
| T2 — Off-scale literals → real tokens (SBC-02) | ✅ Done | `756c579` — `Icon.stories.tsx`, `Select.stories.tsx`, `Tooltip.stories.tsx` (×2) |
| Success Criteria bullet: "1 changeset (patch)" | ✅ Fixed post-verification | Gap committed as `218befc` (`chore(changeset): add patch changeset for storybook-token-cleanup`) immediately after this report's initial findings — content unchanged from what this Verifier already validated as accurate and correctly scoped. |

---

## Spec-Anchored Acceptance Criteria

### SBC-01: CategoryPill false positive documented, not "fixed"

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| WHEN `detect.mjs --json .../CategoryPill.stories.tsx` runs THEN the `design-system-color` finding for `#ff5566` SHALL not appear | `[]`, exit 0 | Ran directly: `node detect.mjs --json src/react/stories/CategoryPill.stories.tsx` → `[]`, exit 0 (observed live, not from a test file) | ✅ PASS |
| WHEN the file is read THEN the line immediately before `color: '#ff5566'` SHALL contain `impeccable-disable-next-line design-system-color` with a reason citing the documented passthrough in `Content.tsx` | Comment present on the immediately-preceding line; reason references `Content.tsx` | `src/react/stories/CategoryPill.stories.tsx:35` — `// impeccable-disable-next-line design-system-color: intentional raw-color passthrough demo`, directly preceded by lines 32–34 citing `CategoryPillBaseProps in Content.tsx` and DESIGN.md's One-Accent Rule; test: `tests/category-pill-color-exception.test.ts:23-27` — `expect(precedingLine).toMatch(/impeccable-disable-next-line design-system-color:/)` | ✅ PASS |
| WHEN the `RawColor` story renders THEN the pill SHALL continue showing `#ff5566` exactly as before — no behavior change | `args: { label: 'Custom', color: '#ff5566' }` unchanged | `src/react/stories/CategoryPill.stories.tsx:36` — `args: { label: 'Custom', color: '#ff5566' }` (identical to pre-diff value per `git diff`, only comment lines added); test: `tests/category-pill-color-exception.test.ts:14-16` — `expect(source).toMatch(/args:\s*\{\s*label:\s*'Custom',\s*color:\s*'#ff5566'\s*\}/)` | ✅ PASS |

**Status**: ✅ All ACs covered

### SBC-02: Off-scale literals become real tokens

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| WHEN `Icon.stories.tsx` is read THEN the name-caption `fontSize` (line ~61) SHALL be `var(--sv-text-xs)`, not `0.6875rem` | `var(--sv-text-xs)` (0.75rem, confirmed in `src/css/theme.css:52`) | `src/react/stories/Icon.stories.tsx:61` — `fontSize: 'var(--sv-text-xs)'`; test: `tests/storybook-token-scale.test.ts:14-19` — `expect(source).toContain("fontSize: 'var(--sv-text-xs)'")` and `expect(source).not.toContain('0.6875rem')` | ✅ PASS |
| WHEN `Select.stories.tsx` is read THEN the "Small" `SelectTrigger` `fontSize` (line ~132) SHALL be `var(--sv-text-sm)`, not `0.875rem` | `var(--sv-text-sm)` (0.8125rem, confirmed in `src/css/theme.css:53`) | `src/react/stories/Select.stories.tsx:132` — `fontSize: 'var(--sv-text-sm)'`; test: `tests/storybook-token-scale.test.ts:26-31` — `expect(source).toContain("fontSize: 'var(--sv-text-sm)'")` and `expect(source).not.toContain('0.875rem')` | ✅ PASS |
| WHEN `Tooltip.stories.tsx` is read THEN both `<kbd>` `borderRadius` (lines ~164, ~168) SHALL be `var(--sv-radius-sm)`, not `3px` | `var(--sv-radius-sm)` (6px, confirmed in `src/css/theme.css:77`) | `src/react/stories/Tooltip.stories.tsx:164,168` — both `borderRadius: 'var(--sv-radius-sm)'`; test: `tests/storybook-token-scale.test.ts:38-43` — `expect(matches).toHaveLength(2)` (regex `/borderRadius: 'var\(--sv-radius-sm\)'/g`) and `expect(source).not.toContain("'3px'")` | ✅ PASS |
| WHEN `detect.mjs --json src/react/stories` runs after the 3 changes THEN the array SHALL be `[]`, exit `0` | `[]`, exit 0 | Ran live: `node detect.mjs --json src/react/stories` → `[]`, exit 0 (see Gate Check) | ✅ PASS |
| WHEN `npm run build-storybook` runs THEN the build SHALL complete without error | Exit 0, no syntax errors | Ran live: `npx storybook build --quiet -o /tmp/verifier-sb-check` → "Storybook build completed successfully", exit 0 (see Gate Check); output directory removed after check | ✅ PASS |

**Status**: ✅ All ACs covered

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| --- | --- | --- | --- |
| 1 | `src/react/stories/Icon.stories.tsx:61` | Reverted `fontSize: 'var(--sv-text-xs)'` → `fontSize: '0.6875rem'` | ✅ Killed — `tests/storybook-token-scale.test.ts` went from 6/6 passing to 4/6 passing; both Icon-related assertions failed (`toContain("fontSize: 'var(--sv-text-xs)')")` and `not.toContain('0.6875rem')`) |
| 2 | `src/react/stories/CategoryPill.stories.tsx:35` | Deleted the `impeccable-disable-next-line design-system-color` comment line | ✅ Killed — `tests/category-pill-color-exception.test.ts` went from 2/2 to 1/2 passing; "the flagged line is immediately preceded by the inline ignore directive" failed as expected |

Both mutations were applied, verified to fail the target test file, then reverted with `git checkout -- <file>`; `git status` confirmed a clean tree for both files after revert, and the full suite (`tests/category-pill-color-exception.test.ts tests/storybook-token-scale.test.ts`) re-ran green (8/8) post-revert.

**Sensor depth**: lightweight (2 mutations, default tier)
**Result**: 2/2 killed — PASS ✅

---

## Interactive UAT Results

Not performed — this feature is not user-facing and has no interactive behavior to walk through (per spec's own scope note: "mudança é estática, sem estado, sem I/O"; changes are demo-code token substitutions and a detector-exception comment). Automated gate + sensor checks are sufficient per validate.md §3 ("For backend-only or infrastructure work, automated checks are sufficient" — this is the tooling/demo-catalog equivalent).

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code | ✅ — 4 one-line/few-line story edits + 2 focused test files |
| Surgical changes | ✅ — each literal swapped for its named token, no surrounding refactor |
| No scope creep | ✅ — diff touches exactly `CategoryPill.stories.tsx`, `Icon.stories.tsx`, `Select.stories.tsx`, `Tooltip.stories.tsx`, `tests/category-pill-color-exception.test.ts`, `tests/storybook-token-scale.test.ts` — the 6 files specified, nothing else |
| Matches existing patterns | ✅ — new tests use the same `readFileSync` + source-string-assertion pattern as existing contract tests (e.g. `tests/icon-css-contract.test.ts`, `tests/component-css-contract.test.ts`) |
| Spec-anchored outcome check (asserted values match spec) | ✅ — all 4 token substitutions verified against DESIGN.md-derived values in `src/css/theme.css` (`--sv-text-xs: 0.75rem`, `--sv-text-sm: 0.8125rem`, `--sv-radius-sm: 6px`), exactly matching the spec's Assumptions table |
| Per-layer Coverage Expectation met | ✅ — this is static demo-code cleanup with no route/service layers; both new test files map 1:1 to the two user stories (SBC-01, SBC-02) |
| Every test maps to a spec requirement — no unclaimed tests | ✅ — `tests/category-pill-color-exception.test.ts` maps to SBC-01, `tests/storybook-token-scale.test.ts` maps to SBC-02; both files' doc comments cite the requirement ID explicitly |
| Documented guidelines followed | none — strong defaults applied (no project-specific test-writing guideline file found beyond existing test conventions, which were matched) |

**Gap (not a code-quality defect, a process/completeness gap)**: Success Criteria's required changeset was not committed as part of this diff (see Task Completion table). This is not a code quality issue with the reviewed files themselves — the changeset content on disk is accurate and correctly scoped as `patch` — but it means the 2 commits under review, taken alone, do not satisfy the spec's stated Success Criteria and would fail this repo's CI changeset gate if PR'd as-is.

---

## Edge Cases

- [x] `impeccable-disable-next-line` read in `--no-config` mode still surfaces the finding — not applicable to verify here (documented detector behavior, not code under test in this diff; no `--no-config` flag was exercised or claimed to be handled by this diff, consistent with spec's framing of it as "not an edge case to handle in code").
- [x] Future `RawColor`-like stories need their own justification — not applicable to this diff (spec explicitly states no general exception was opened; confirmed no config change: `.impeccable/config.json` untouched by this diff — see Code Quality no-scope-creep check).

---

## Gate Check

- **Gate commands**:
  1. `npx vitest run tests/category-pill-color-exception.test.ts tests/storybook-token-scale.test.ts` → **2 files passed, 8 tests passed, 0 failed**
  2. `npm run typecheck` (`tsc --noEmit`) → **passed, no output/errors**
  3. `node detect.mjs --json src/react/stories` → **`[]`, exit 0**
  4. `npx storybook build --quiet -o /tmp/verifier-sb-check` → **"Storybook build completed successfully", exit 0** (output dir removed after check, per instructions)
- **Test count before feature** (at `5244dfc`): 55 test files under `tests/`
- **Test count after feature** (at `756c579` / HEAD): 57 test files under `tests/`
- **Delta**: +2 test files, +8 test cases (all new, all passing)
- **Skipped tests**: none
- **Failures**: none

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| --- | --- | --- |
| SBC-01 | Pending | ✅ Verified |
| SBC-02 | Pending | ✅ Verified |

---

## Resolution

The single gap this Verifier found (uncommitted changeset) was fixed immediately: `218befc` stages and commits `.changeset/four-plums-hunt.md` with the exact content already validated above as accurate and correctly scoped. No functional AC, gate, or sensor result changes as a result — this was a commit-completeness gap, not a code defect. **Diff range now closed as `5244dfc..218befc`.**

## Summary

**Overall**: ✅ Ready (post-fix; ⚠️ at initial verification, resolved by `218befc`)

**Spec-anchored check**: 8/8 ACs matched spec outcome (3 for SBC-01, 5 for SBC-02), 0 spec-precision gaps
**Sensor**: 2/2 mutations killed
**Gate**: 4/4 gate commands passed (vitest, typecheck, detect.mjs, storybook build)

**What works**: Both SBC-01 and SBC-02's acceptance criteria are fully and precisely satisfied by the code and tests in this diff. The false-positive exception is documented exactly as specified (inline directive + Content.tsx citation, behavior unchanged). All 4 off-scale literals now reference the exact tokens the spec's Assumptions table calls for, confirmed against `src/css/theme.css`'s real values. The detector returns a clean `[]`/exit-0 sweep of `src/react/stories`, `npm run typecheck` is clean, and `storybook build` completes without error. Both new test files are non-shallow, discriminating (sensor killed both injected mutations), and scoped precisely to the 6 files this feature was meant to touch — no scope creep.

**Issues found**: The spec's Success Criteria explicitly requires "1 changeset (patch)" for this change. `.changeset/four-plums-hunt.md` exists on disk with accurate, correctly-scoped (`patch`) content describing exactly this change, but it is untracked and was never committed to either of the two commits in the reviewed diff range (`13fcce5`, `756c579`). As committed, this diff would fail the project's CI changeset gate (per this repo's `CLAUDE.md`: "Every change under `src/` or `scripts/` needs a changeset... CI fails the PR otherwise"). Fix: `git add .changeset/four-plums-hunt.md` and commit it (either amended into `756c579` or as a new small commit) before this branch is considered ready to PR.

**Next steps**: Stage and commit the already-correct `.changeset/four-plums-hunt.md`. No other changes needed — re-run is not required beyond confirming the changeset commit lands; all functional ACs and gates already pass.
