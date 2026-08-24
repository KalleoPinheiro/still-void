# Form & Data Primitives — Validation

**Date**: 2026-08-23
**Spec**: `.specs/features/form-and-data-primitives/spec.md`
**Diff range**: `4422b64..50c1f2d` (35 commits, branch `claude/tlc-spec-still-void-gaps-ee7589`; `4422b64` = merge-base with `main`)
**Verifier**: independent sub-agent (author ≠ verifier), evidence-or-zero
**Verdict**: ❌ **FAIL** — implementation is correct everywhere it was probed and every gate is green, but the discrimination sensor found **5 surviving mutants** and 3 AC clauses have **no test evidence**. All gaps are test-strength gaps, not shipped defects.

---

## Task Completion

All 24 tasks (T1–T24, plus T20b) are marked ✅ in `tasks.md` with commit hashes. Spot-checked T20b (`08993f1`), T23 (`4e82a07`), T24 (`dd7b8a0`) against the diff — each commit contains what the task claims.

One process note: `.specs/STATE.md` **Handoff** section is stale — it still reads *"Phase / Task: Design — spec.md escrito e confirmado; design.md em redação"* while all 24 tasks are complete. Not an AC; flagged so a resuming agent isn't misled.

---

## Gate Check

Independently re-run at HEAD `50c1f2d`, real working tree, exit codes captured:

| Gate | Command | Exit | Result |
| --- | --- | --- | --- |
| Typecheck | `npm run typecheck` | **0** | clean |
| Tests + coverage | `npm run test:coverage` | **0** | **40 files, 757 passed, 0 failed, 0 skipped** |
| Build | `npm run build` | **0** | clean |
| Package lint | `npm run lint:package` | **0** | `publint --strict` + `attw` all 🟢 across `./react`, `./react/client`, `./tailwind-preset`, `./package.json` |

Coverage summary: **Statements 100% (442/442), Branches 100% (247/247), Functions 100% (154/154), Lines 100% (419/419)**.

**Test integrity**: baseline recorded in `tasks.md` was 26 files / 320 tests. Now 40 files / 757 tests → **+437**. No test deleted, none skipped. Three pre-existing assertions in `ui-button.test.tsx` / `ui-badge.test.tsx` were **rewritten** (see P2-2 AC#4 below) — verified strengthened, not weakened.

Reality check beyond the tests: `npm pack --dry-run` on the built tree ships `dist/tailwind-preset.{js,cjs,d.ts,d.cts}`, `dist/shadcn-overrides.css`, `dist/style.css`, `dist/theme.css` (25 files total) — P2 AC#1 confirmed against the actual tarball, not only against the proxy assertions.

---

## Spec-Anchored Acceptance Criteria

### P1: Campos de formulário nativos e coerentes

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| #1 Textarea/NativeSelect/FileInput exist, render `<textarea>`/`<select>`/`<input type=file>`, no `'use client'`/hooks/Radix | native element per component; server-safe | `tests/ui-textarea.test.tsx:14` — `expect(textarea).toBeInstanceOf(HTMLTextAreaElement)`; `tests/ui-native-select.test.tsx:20` — `toBeInstanceOf(HTMLSelectElement)`; `tests/ui-file-input.test.tsx:11` — `toHaveAttribute('type','file')`. Server-safety asserted at `ui-textarea:58,66` and `ui-native-select:92` | ⚠️ **PARTIAL** — **no server-safety assertion for `FileInput`** (see Gap 2) |
| #2 all four emit base class `sv-field` | literal `sv-field` on each | `tests/ui-input.test.tsx:37` — `toHaveClass('sv-field')`; `ui-textarea:36`; `ui-native-select:69`; `ui-file-input:46` | ✅ PASS |
| #3 `<NativeSelect name>` = real `<select>`, `userEvent.selectOptions`, `FormData` | `name` on DOM; `data.get('fruit')==='banana'` | `tests/ui-native-select.test.tsx:35-36` — `await userEvent.selectOptions(select,'banana'); expect(select).toHaveValue('banana')`; `:49,52` — `toHaveAttribute('name','fruit')`, `expect(data.get('fruit')).toBe('banana')`; end-to-end at `tests/forms-integration.test.tsx:73` — `expect(data.get('country')).toBe('br')` | ✅ PASS |
| #4 `<Textarea rows={6}>` → `rows="6"` | attribute value `"6"` | `tests/ui-textarea.test.tsx:19` — `toHaveAttribute('rows','6')` | ✅ PASS |
| #5 `className` additive, never replacing | base + custom both present | `ui-input:43-44`, `ui-textarea:36-38`, `ui-native-select:69-71`, `ui-file-input:46-48` | ✅ PASS |
| #6 `ref` → native DOM node | correct `HTML*Element` per component | `ui-input:22`, `ui-textarea:25`, `ui-native-select:58`, `ui-file-input:35` | ✅ PASS |
| #7 `disabled` disables + `.sv-field:disabled` treats it | element disabled; CSS rule exists | `ui-input:27`, `ui-textarea:30`, `ui-native-select:63`, `ui-file-input:40`; CSS at `tests/field-css-contract.test.ts:115-116` — `decl('.sv-field:disabled','cursor')).toBe('not-allowed')`, `opacity` `'0.5'` | ✅ PASS |
| #8 `FileInput accept/multiple` + `::file-selector-button` tokenized | attributes present; button styled from `var(--sv-*)` | `ui-file-input:16,21`; `tests/field-css-contract.test.ts:150-160` — exact `decl(...)` per property incl. `background` → `var(--sv-surface-2)`, both `::file-selector-button` and `::-webkit-file-upload-button` | ✅ PASS |
| #9 consumer `type` on FileInput ignored, stays `file` | rendered `type === 'file'` | `tests/ui-file-input.test.tsx:24-30` — untyped cast passes `type="text"`, `expect(...).toHaveAttribute('type','file')` — **runtime half tested**, not only the TS `Omit` | ✅ PASS (mutant 3 killed) |
| #10 every colour/space/radius in `.sv-field` is a `var(--sv-*)` | no hex/oklch/rgb literal | `tests/field-css-contract.test.ts:218-221` — `expect(bodyOf(selector)).not.toMatch(/#[0-9a-fA-F]{3}\|oklch\(\|rgba?\(\|hsla?\(/)` over all 20 required selectors | ✅ PASS (mutant 7a killed) |
| #11 Input parity: 40px / 6px / 12px·8px / 4 colours identical, **only** `font-size` changes to 15px | exact token per property | `tests/field-css-contract.test.ts:94-108` — table-driven exact equality: `height` `var(--sv-space-10)` (theme.css:70 = 40px), `border-radius` `var(--sv-radius-sm)` (:77 = 6px), `padding` `var(--sv-space-2) var(--sv-space-3)`, `border` `1px solid var(--sv-border)`, `background` `var(--sv-surface)`, `color` `var(--sv-text)`, `font-size` `var(--sv-text-base)` (:54 = 0.9375rem = 15px); placeholder at `:111` → `var(--sv-text-2)` | ✅ PASS — **pinned by assertion, not prose** |
| #12 keyboard focus ring 2px `--sv-accent-ink`, offset 2px (D5) | exact declaration | `tests/field-css-contract.test.ts:124-125` — `decl(sel,'outline')).toBe('2px solid var(--sv-accent-ink)')` and `outline-offset` `'2px'`, across `.sv-field`, `.sv-check`, `.sv-radio`; `:129` — Forms section has no `box-shadow` | ✅ PASS |

### P1: Escolhas múltiplas sem boundary client

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| #1 no `'use client'`, no `@radix-ui/*` | source clean | `tests/ui-checkbox.test.tsx:82-83`; `tests/ui-radio-group.test.tsx:219-222` (also asserts no `createContext`/`useId`) | ✅ PASS |
| #2 `<Checkbox name defaultChecked>` → checkbox, role, toggle | `getByRole('checkbox')`, checked, `userEvent.click` toggles, `FormData` | `ui-checkbox:16,22,30-33,43,46` — incl. `expect(data.get('ativo')).toBe('yes')` | ✅ PASS |
| #3 `type` override ignored, stays `checkbox` | rendered `type === 'checkbox'` | `tests/ui-checkbox.test.tsx:52-55` — cast-through-props, **runtime** assertion | ✅ PASS |
| #4 `legend` → `<fieldset>`/`<legend>`, `getByRole('group',{name})` | fieldset + legend tagName | `ui-radio-group:19-21` — `getByRole('group',{name:'Tipo de diagnóstico'})`, `group.tagName === 'FIELDSET'`, legend `tagName === 'LEGEND'` | ✅ PASS |
| #5 `legendHidden` keeps legend in DOM + visual-hide class, never `display:none`/removal | legend present, `sv-sr-only`, not `display:none` | `ui-radio-group:31-34` — `expect(legend.tagName).toBe('LEGEND')`, `toHaveClass('sv-sr-only')`, `not.toHaveStyle({display:'none'})`; CSS at `field-css-contract:207-214` — `clip-path` `inset(50%)`, and `display`/`visibility` **undefined** | ✅ PASS (mutant 6 killed) |
| #6 group `name` injected into direct-child items; mutually exclusive | every radio gets `name="nanda"` | `ui-radio-group:58-69` (**distinct test**) + `:73-90` exclusivity + `forms-integration:130` — `expect(data.getAll('plan')).toEqual(['enterprise'])` | ✅ PASS |
| #7 item's own `name` prevails | `name === 'own-name'` | `ui-radio-group:93-100` (**distinct test**) — `toHaveAttribute('name','own-name')` | ✅ PASS (mutant 2 killed) |
| #8 item inside a wrapper does NOT get the group `name` | no `name` attribute | `ui-radio-group:103-113` (**distinct test**) — `expect(radio).not.toHaveAttribute('name')` | ✅ PASS (mutant 1 killed) |
| #9 non-item children (text, `null`, `<hr>`) render unchanged, no throw | rendered intact | `ui-radio-group:116-126` (text), `:129-137` (`<hr>`), `:140-151` (`null`/`false`) | ✅ PASS |
| #10 `children` become the label; `getByLabelText` returns the radio | input found by label text, `type="radio"` | `ui-radio-group:229-232` | ✅ PASS |
| #11 `orientation="horizontal"` modifier; default vertical | `sv-radio-group--horizontal` present / absent | `ui-radio-group:160` and `:171-172` | ✅ PASS |

Three-assertion requirement for #6/#7/#8 explicitly confirmed: three separate `test(...)` blocks at lines 58, 93 and 103 — no test doing double duty.

### P1: Tabela de dados apresentacional

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| #1 eight exports → eight native elements | `<table>`…`<caption>` | `tests/ui-table.test.tsx:20-126` — one test per component asserting element + base class; export surface at `tests/react-barrel.test.ts:141` (exact-set equality) | ✅ PASS |
| #2 `<Table>` wrapped in horizontal-scroll container | container class + `overflow-x:auto` | `ui-table:134` — `expect(wrapper).toHaveClass('sv-table-container')`; `tests/table-css-contract.test.ts:97-98` — `decl('.sv-table-container','overflow-x')).toBe('auto')`, `width` `'100%'` | ✅ PASS |
| #3 `containerClassName` → container, `className` → `<table>`, **separately addressable** | each class on its own target and *not* on the other | `tests/ui-table.test.tsx:145-150` — `wrapper` has `h-96` and `not.toHaveClass('custom-table')`; `tableEl` has `custom-table` and `not.toHaveClass('h-96')` — **both targets asserted, both negatives asserted** | ✅ PASS (mutant 5 killed) |
| #4 ARIA integrity: table/columnheader/row/cell resolve | roles resolve with expected counts | `ui-table:167-168`, `:184-185`, `:237-241` (3×3 + caption + footer: 3 columnheaders, 4 rows, 9 cells) | ✅ PASS |
| #5 `ref` per component → native node | correct `HTML*Element` ×8 | `ui-table:24,37,50,63,78,95,112,125` | ✅ PASS |
| #6 `TableCaption` → `<caption>` child of `<table>`, names it for AT | `getByRole('table',{name})` | `ui-table:200` — `getByRole('table',{name:'List of users'})`; `:242` — `tagName === 'CAPTION'` | ✅ PASS |
| #7 separators, header band, text colour from `var(--sv-*)`, theme-switching without consumer config | every declaration a token | `tests/table-css-contract.test.ts:117` head `background` → `var(--sv-bg)`; `:127` th `border-bottom` → `1px solid var(--sv-border)`; `:111` `color` → `var(--sv-text)`; `:165-167` no literals in any of 10 selectors | ✅ PASS |

### P1: Componentes deixam de ser cegos a tema (D1)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| #1 no hex/oklch in tailwind colours; each → `var(--sv-*)` | every value matches `^var\(--sv-…\)$` and the var is declared in `theme.css` | `tests/tailwind-config-contract.test.ts:51` — `not.toMatch(/#\|oklch\(\|rgba?\(\|hsla?\(/)`; `:55-56` — `toMatch(/^var\(--sv-[a-z0-9-]+\)$/)` **and** `expect(declaredVars).toContain(...)` (cross-checked against `theme.css`, so a typo'd var fails) | ✅ PASS |
| #2 render migrated components under `[data-theme='light']`/`['dark']`, **resolved background** = light/dark token | `getComputedStyle` resolves to the theme's token | **no evidence** — no test renders under `data-theme` and reads a resolved colour (grep: `getComputedStyle` appears only in a comment at `field-css-contract.test.ts:6`) | ⚠️ **NOT COVERED as written** (see Gap 1) |
| #3 `theme.css` unchanged (wiring fix, not value change) | zero diff | `git diff 4422b64..50c1f2d -- src/css/theme.css` → **empty** | ✅ PASS |
| #4 `tests/tokenParity.test.ts` still passes, unedited | zero diff, green | `git diff … -- tests/tokenParity.test.ts src/tokens/` → **empty**; passes in the 757 | ✅ PASS |
| #5 `*-light` aliases removed | no key ends in `-light`; exactly 13 keys remain | `tailwind-config-contract:62` — `.filter(k=>k.endsWith('-light'))).toEqual([])`; `:66-80` exact 13-key list. Removal disclosed in `.changeset/theme-and-focus-fixes.md` | ✅ PASS |

### P2: Distribuição da camada Tailwind (D2, D3, D4)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| #1 tarball contains preset + `shadcn-overrides.css` | both present in `npm pack` | `tests/package-contract.test.ts:35-44` (copy-css covers all three CSS files), `:101` (`files` includes `dist`); **verified for real**: `npm pack --dry-run` lists `dist/tailwind-preset.*` and `dist/shadcn-overrides.css` | ✅ PASS |
| #2 `./tailwind-preset` resolves, valid ESM+CJS types | exact `exports` shape with `types`+`default` per condition | `package-contract:82-92` — full `toEqual` on the conditions object; `:95-97` `typesVersions`; independently, `attw` reports 🟢 for `node16 (CJS)`, `node16 (ESM)`, `bundler`, `node10` | ✅ PASS |
| #3 `./shadcn-overrides.css` resolves to `dist/` | `exports['./shadcn-overrides.css'] === './dist/shadcn-overrides.css'` | `package-contract:49` | ✅ PASS |
| #4 `tailwindcss` peer + `peerDependenciesMeta.optional: true` | both present | `package-contract:107,111`; real `package.json`: `peerDependencies.tailwindcss = ">=3"`, `peerDependenciesMeta.tailwindcss.optional = true` | ✅ PASS |
| #5 `publint --strict` + `attw` pass, CSS subpaths excluded | green, all three CSS entrypoints excluded | `package-contract:64-69`; gate `npm run lint:package` exit **0** | ✅ PASS |
| #6 README / `docs/design-system.md` / DESIGN.md §6 describe the real state | accurate Tailwind-optional story + preset loading | `README.md:211-221`, `docs/design-system.md` "Tailwind is optional" + entries table, `DESIGN.md` §6 "Theming Strategy" — cross-checked below, clean | ✅ PASS |

### P2: Restante da família server-safe migra para CSS `sv-*`

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| #1 Button/Card/Alert/Badge emit `sv-*` with real CSS in `style.css`, no Tailwind for base look | class emitted **and** a real rule behind it | Classes: `ui-button.test.tsx` variant/size matrix, `ui-card.test.tsx:55-64`, `ui-alert.test.tsx` (`sv-alert`, `__title`, `__description`), `ui-badge.test.tsx` variant matrix. "No leftover Tailwind utility": `ui-card`, `ui-alert`, `ui-input:47-53`, dead-class lists in `ui-button`/`ui-badge`. **CSS-rule existence** checked only with `expect(section).toContain('.sv-card')`-style substring matches | ⚠️ **WEAK** — passes, but does not discriminate (Gap 3; mutants 7b/8/9 survived) |
| #2 variant set and names unchanged | every variant maps to a distinct class; set exhaustive | `ui-button.test.tsx` — per-variant modifier + `expect(new Set(classesByVariant).size).toBe(variants.length)`; same shape in `ui-badge.test.tsx` | ✅ PASS |
| #3 `className` composes with base | base + custom | `ui-card:55-64` composition tests, `ui-button`/`ui-badge`/`ui-alert` equivalents | ✅ PASS |
| #4 existing `ui-button`/`ui-card`/`ui-alert`/`ui-badge` tests pass **without edit** | zero edits to existing assertions | **Violated as literally written**: 3 assertions rewritten (`ui-button.test.tsx` dropped `toContain('bg-sv-surface')`/`toContain('h-10')`; `ui-badge.test.tsx` dropped `toHaveClass('bg-sv-signal-cyan')`). **Amended and approved**: `tasks.md` T20b records the collision with AD-001, the user's 2026-08-23 approval, and the amendment ("protects *behaviour*, not the utility-class literal"). Verified independently that the replacements are **stronger** (base class present **and** absence of every modifier) and that the removed classes were live, not inert — with the preset published in T16, `bg-sv-signal-cyan` would have pinned Badge to cyan, violating the One-Accent Rule | ⚠️ **Documented deviation — accepted** |

### P3: Catálogo, documentação e release

| Criterion | Spec-defined outcome | Evidence | Result |
| --- | --- | --- | --- |
| #1 story per new component, dark/light + ≥1 accent | story file exists, theme/accent switchable | `src/react/stories/{Textarea,NativeSelect,FileInput,Checkbox,RadioGroup,Table}.stories.tsx` (6 files, matching the 6 new component families). Dark/light + accent come from the repo-wide harness: `.storybook/preview.tsx:8-13` sets `data-theme`/`data-accent` from globals, `:43,52` enumerate `themeModes`/`accentNames` as toolbar options | ✅ PASS (no automated assertion — Storybook is untested repo-wide; consistent with existing practice) |
| #2 `docs/design-system.md` lists new components + declares `NativeSelect`/`Select` coexistence | catalog rows + explicit section | `docs/design-system.md` server-safe catalog rows for all 6 families + dedicated "`NativeSelect` vs. `Select`" comparison table | ✅ PASS |
| #3 separate changesets: `minor` features / `patch` D1–D4, consumer-facing | two files, correct bump levels | `.changeset/form-and-table-primitives.md` (`minor`), `.changeset/theme-and-focus-fixes.md` (`patch`) | ✅ PASS |
| #4 README Tailwind note reflects post-migration state | "Tailwind is not required" | `README.md:211-221` replaces the old "Tailwind CSS is now a peer dependency" note | ✅ PASS |

---

## Edge Cases

| Edge case | Evidence | Result |
| --- | --- | --- |
| `RadioGroup` children `null`/`undefined`/`false` → empty fieldset, no throw | `ui-radio-group:140-151`, `:186-191` | ✅ |
| `RadioGroup` without `name`, items without `name` → no invented `name` | `ui-radio-group:176-183` — `not.toHaveAttribute('name')` | ✅ |
| `NativeSelect` with no `<option>` → empty `<select>`, no error | `ui-native-select:87-90` — `not.toThrow()` + `toBeEmptyDOMElement()` | ✅ |
| `NativeSelect multiple` passthrough; `.sv-field` must not fix height | `ui-native-select:74-85`; `table`-style CSS check at `field-css-contract:142` — `decl('.sv-field--select[multiple]','height')).toBe('auto')` | ✅ |
| `Table` children without `TableHeader`/`TableBody` still render | `ui-table:263-276` | ✅ |
| New components pass `id`/`aria-*`/`data-*` unfiltered | `ui-textarea:41-56` (aria-label, data-testid, name, defaultValue, placeholder); `data-testid` relied on throughout `ui-file-input` | ✅ |
| `FileInput` `value` passthrough | **no direct assertion**; `forms-integration:96-104` exercises `user.upload` and `input.files` instead | ⚠️ minor — spec itself concedes the browser rejects programmatic `value`; nothing precise to assert |
| `style.css` without `theme.css` degrades to existing fallbacks | **no test**; the new rules use bare `var(--sv-*)` with no fallback, matching the existing `style.css` contract (verified by reading the Forms/Table sections) | ⚠️ spec-precision gap — "mesmo contrato das classes existentes" defines no observable outcome |
| `Checkbox` inside `TableHead`/`TableCell` keeps vertical alignment | `table-css-contract:132` — `decl('.sv-table__td','vertical-align')).toBe('middle')`; no `[role=checkbox]`-specific test | ⚠️ partial — the upstream `[role=checkbox]` handling the spec cites is not asserted |

---

## Discrimination Sensor

Depth: **expanded tier** (a11y surface + published API). All mutations applied to the real files, tests run, then `git checkout --` restored; `git status` verified clean after every round.

| # | File | Mutation | Tests run | Killed? |
| --- | --- | --- | --- | --- |
| 1 | `src/components/ui/radio-group.tsx:45` | `child.type !== RadioGroupItem` → `=== RadioGroupItem` (flip the direct-child guard) | `ui-radio-group` + `forms-integration` | ✅ **Killed** (5 failed) |
| 2 | `src/components/ui/radio-group.tsx:49-51` | removed the `itemProps.name !== undefined` early return (group `name` always wins) | same | ✅ **Killed** (1 failed — `ui-radio-group:93`) |
| 3 | `src/components/ui/file-input.tsx:13-14` | moved `type="file"` **before** `{...props}` | `ui-file-input` + `forms-integration` | ✅ **Killed** (1 failed — `ui-file-input:24`) |
| 4 | `src/recipes/field.ts:21` | dropped `!== 'input'`, so `field({variant:'input'})` emits a modifier | `recipes-field` + `ui-input` | ✅ **Killed** (1 failed) |
| 5 | `src/components/ui/table.tsx:11-12` | swapped `containerClassName` and `className` targets | `ui-table` | ✅ **Killed** (1 failed — `ui-table:139`) |
| 6 | `src/components/ui/radio-group.tsx:65-69` | `legendHidden` omits the `<legend>` entirely instead of hiding it visually | `ui-radio-group` | ✅ **Killed** (1 failed — `ui-radio-group:25`) |
| 7a | `src/css/style.css` Forms | `.sv-field { background: var(--sv-surface) }` → `#0d0d0f` | `field-css-contract` | ✅ **Killed** (2 failed) |
| 7b | `src/css/style.css` Card | **deleted the whole `.sv-card { … }` base rule** (border, radius, background, colour) | `ui-card` | ❌ **SURVIVED** (23/23 passed) |
| 8 | `src/css/style.css` Alert | **deleted the whole `.sv-alert { … }` base rule** | `ui-alert` | ❌ **SURVIVED** (15/15 passed) |
| 9 | `src/css/style.css` Button | **deleted the whole `.sv-btn { … }` base rule** | `ui-button` | ❌ **SURVIVED** (36/36 passed) |
| 10 | `src/css/style.css` Badge | deleted the `.sv-badge { … }` base rule | `ui-badge` | ✅ **Killed** — the `background: var(--sv-accent)` regex at `ui-badge.test.tsx` pins the base rule body |
| 11 | `src/css/style.css` Card | `.sv-card { background }` → `#101014` (bounds the Gap-3 weakness) | `ui-card` | ✅ **Killed** — literal detection *is* sound; only rule *existence* is weak |
| 12 | `src/components/ui/file-input.tsx:1` | prepended `"use client"` | **full suite** | ❌ **SURVIVED** (40 files / 757 passed) |
| 13 | `src/components/ui/table.tsx:1` | prepended `"use client"` | **full suite** | ❌ **SURVIVED** (40 files / 757 passed) |

**Result: 13 injected, 8 killed, 5 survived.** ❌

The five survivors cluster on exactly two root causes (Gaps 2 and 3 below). Every behaviour-level mutation against the feature's *new* logic — name injection, guard direction, JSX spread ordering, recipe branching, class targeting, legend a11y, token literals — was killed.

---

## Ranked Gaps

### Gap 1 — SVD-01 AC#2 has no test (`[data-theme]` render + resolved colour)
**Severity: Major (spec-precision).** The AC asks for a test that renders migrated components under `[data-theme='light']`/`['dark']` and asserts the **resolved** background colour. No such test exists — grep for `getComputedStyle` across `tests/` returns only a comment. The team's substitute (`tests/tailwind-config-contract.test.ts` + `field-css-contract` + `table-css-contract`) proves *bindings and tokens*, and `tailwind-config-contract:56` even cross-checks each var against `theme.css`, which is genuinely strong. But it proves a different proposition than the AC states, and the AC as written is **unsatisfiable under jsdom**, which never loads `style.css`.
**This is a spec-precision gap as much as a coverage gap**: the AC specifies an outcome the chosen test environment cannot observe. Either the AC should be restated in terms the harness can verify, or a browser-mode/Playwright check should be added.
**Evidence**: no `file:line`.

### Gap 2 — AC "P1 Campos" #1 server-safety is unenforced for `FileInput` and the whole `Table` family
**Severity: Major.** Mutants 12 and 13 both survived the **full** 757-test suite: prepending `"use client"` to `src/components/ui/file-input.tsx` or `src/components/ui/table.tsx` breaks nothing. The `not.toContain('use client')` / `not.toMatch(/@radix-ui/)` source assertions exist for Textarea (`ui-textarea:58,66`), NativeSelect (`ui-native-select:92`), Checkbox (`ui-checkbox:77`) and RadioGroup (`ui-radio-group:214`) — and for nothing else. Server-safety is the feature's central architectural promise (AD-002, Goals, both changesets), and it is exactly the property that regresses silently: it costs nothing at test time and only surfaces in a consumer's Next.js build. `tests/react-barrel.test.ts` is not evidence here — a `'use client'` module imports fine under vitest.
**Fix**: extend the existing source-assertion pattern to `file-input.tsx` and `table.tsx`, or better, replace all six with one suite that walks every module reachable from `src/react/index.ts`.
**Evidence**: no `file:line`.

### Gap 3 — AC "P2-2" #1 does not discriminate: `.sv-card`, `.sv-alert`, `.sv-btn` base rules can be deleted with the suite green
**Severity: Major.** Mutants 7b, 8, 9 survived. Cause: the CSS contracts added to `ui-card.test.tsx`, `ui-alert.test.tsx` and `ui-button.test.tsx` assert rule existence with `expect(section).toContain('.sv-card')` — and `.sv-card__header` already contains that substring, so the base rule's existence is never actually tested. The same holds for `.sv-alert` (satisfied by `.sv-alert__title`) and `.sv-btn` (satisfied by `.sv-btn--destructive`). Badge escapes only by accident: `ui-badge.test.tsx` happens to carry a `\.sv-badge\s*\{[^}]*background:\s*var\(--sv-accent\)` regex that pins the body.
The AC's claim — "SHALL emitir classes `sv-*` **com CSS real** em `style.css`" — is therefore half-verified: the class is asserted on the element, the rule behind it is not. This is precisely the ghost-class failure mode `tests/recipes-table.test.ts:50-55` was written to prevent for the table recipe, and that `field-css-contract`/`table-css-contract` prevent by parsing the section into a selector→body map and asserting per-declaration equality.
**Fix**: port the `parseRules`/`decl` approach from `tests/field-css-contract.test.ts` to the Button, Card and Alert sections. Note the colour-literal half is sound (mutant 11 killed) — only rule existence is weak.
**Evidence**: `tests/ui-card.test.tsx` (`toContain('.sv-card')`), `tests/ui-alert.test.tsx` (`toContain('.sv-alert')`), `tests/ui-button.test.tsx` (`buttonSection).toContain('.sv-btn')`).

### Gap 4 — two edge cases with no observable spec outcome
**Severity: Minor (spec-precision).** "`style.css` without `theme.css` degrades to existing fallbacks (mesmo contrato das classes existentes)" and "`Checkbox` inside `TableHead`/`TableCell` keeps vertical alignment (o port upstream já trata `[role=checkbox]`)" both defer to an unstated contract rather than naming an outcome. Neither is tested. Flagged rather than silently passed.

### Gap 5 — stale `.specs/STATE.md` Handoff
**Severity: Cosmetic.** Handoff still says "Design — design.md em redação" though all 24 tasks shipped. Would mislead a resuming agent.

---

## Documentation Cross-Check

Every component name, subpath, prop and class asserted by `README.md`, `docs/design-system.md` and `DESIGN.md` was checked against source. **Clean — no drift found.**

| Doc claim | Verified against | OK |
| --- | --- | --- |
| Server-safe list: `Textarea`, `NativeSelect`, `FileInput`, `Checkbox`, `RadioGroup`/`RadioGroupItem`, 8 `Table*` | `src/react/index.ts`; `tests/react-barrel.test.ts:141` exact-set equality on the barrel | ✅ |
| Client-only list: `Dialog`, `DropdownMenu`, `Select`, `Tabs`, `Tooltip` | `src/react/client/shadcn.ts` | ✅ |
| Field frame: height 40px, radius 6px, padding 12/8, `--sv-text-base` = 15px | `theme.css:70` (40px), `:77` (6px), `:54` (0.9375rem = 15px); `style.css` Forms section | ✅ |
| `Textarea min-height: 80px` | `.sv-field--textarea { min-height: calc(var(--sv-space-10) * 2) }` = 40×2 | ✅ |
| `NativeSelect` "keeps native affordance (no `appearance: none`)" | Forms section contains no `appearance:none` for `.sv-field--select` | ✅ |
| `FileInput` styles `::file-selector-button` with `-webkit-file-upload-button` fallback | both selectors present, `field-css-contract:150-160` | ✅ |
| Focus = `outline: 2px solid var(--sv-accent-ink)`, offset 2px, never `box-shadow`/`ring-*` | `field-css-contract:124-125`, `:129`; `ui-button.test.tsx` focus-visible regex | ✅ |
| `--sv-danger`, `--sv-bg`, `--sv-accent-ink` (changeset claims) exist | `theme.css:98`, `:102`, accent-ink family `:142-154` | ✅ |
| `shadcn-overrides.css` hits bare `button`/`input`/`select`/`textarea` + `[class*="shadow"]` catch-all | `src/css/shadcn-overrides.css:64-69`, `:95` | ✅ |
| `shadcn-overrides.css` never auto-imported | `package-contract:54-60` — neither `theme.css` nor `style.css` references it | ✅ |
| Subpaths `@still-void/ui/tailwind-preset`, `/shadcn-overrides.css`, `/style.css`, `/theme.css`, `/react`, `/react/client` | `package.json` `exports` (6 subpaths + `./package.json`); `attw`/`publint` green; `npm pack --dry-run` ships the files | ✅ |
| `tailwindcss` optional peer | `peerDependencies.tailwindcss = ">=3"`, `peerDependenciesMeta.tailwindcss.optional = true` | ✅ |
| `field({ variant: 'input'\|'textarea'\|'select'\|'file' })`, `fieldClasses` = `{choice, srOnly}` | `src/recipes/field.ts:10,25-28`; `recipes-field:24` asserts the key set is exactly those two | ✅ |
| `tableClasses` = `container, head, body, foot, row, th, td, caption` | `src/recipes/table.ts:12-21`; `recipes-table:16-26` exact key set | ✅ |
| `RadioGroup` name propagation is direct-children only; item's own `name` wins | `radio-group.tsx:44-53`; tests at `:58`, `:93`, `:103` | ✅ |
| DESIGN.md §6: client Radix family still Tailwind-styled, "migrated in a later feature" | matches spec Out of Scope; `select.tsx`/`dialog.tsx` etc. still carry utilities | ✅ |
| DESIGN.md:194 "Button/Input pass open work" replaced with "specified" | old sentence removed in the same edit that adds the frame spec | ✅ |

**Changesets** disclose what actually changed, including AD-004: `.changeset/theme-and-focus-fixes.md` carries an explicit **"One visual value changed"** bullet naming the 14px → `var(--sv-text-base)` (15px) move, the four affected components, and the reasoning that height/radius/padding/colours are unchanged. Bump levels match CONTRIBUTING (`minor` for new exports, `patch` for the corrections). The `*-light` alias removal is disclosed in the same file.

---

## Code Quality

| Principle | Status |
| --- | --- |
| No features beyond what was asked | ✅ — `TableCaption`/`TableFooter` were explicitly in-scope per spec assumption |
| No abstractions for single-use code | ✅ — `field()`/`table()` each have ≥4 and 8 consumers |
| No unnecessary flexibility | ✅ |
| Only touched files required for the tasks | ✅ |
| Didn't "improve" unrelated code | ✅ — `theme.css`, `src/tokens/`, `tokenParity`, `contrast` all byte-identical |
| Matches existing patterns/style | ✅ — `forwardRef` + `cn(base, className)` throughout, mirroring `input.tsx` |
| Would a senior engineer approve? | ✅ with the three gaps above raised as review comments |
| Tests map to ACs and are non-shallow | ⚠️ — true for the new form/table surface (exact-value CSS contracts, three distinct name-propagation tests, runtime `type`-override probes); **not** for the P2 Button/Card/Alert CSS contracts (Gap 3) |
| Spec-anchored outcome check | ⚠️ — 1 AC not covered as written (Gap 1), 1 partial (Gap 2), 1 weak (Gap 3), 1 documented amendment (P2-2 #4) |
| Every test maps to a spec AC / edge case / Done-when | ✅ — no unclaimed tests found; several carry explicit `// AC …` markers |
| Documented guidelines followed | ✅ — `CLAUDE.md` (changeset per `src/` change, bump levels, `exports` as public API), `CONTRIBUTING.md`, AD-001…AD-005 |

---

## Requirement Traceability Update

| Requirement | Previous | New |
| --- | --- | --- |
| FDP-01 `Textarea` | Pending | ✅ Verified |
| FDP-02 `NativeSelect` | Pending | ✅ Verified |
| FDP-03 `FileInput` | Pending | ⚠️ Verified except server-safety assertion (Gap 2) |
| FDP-04 `field()` + `.sv-field` | Pending | ✅ Verified |
| FDP-05 `Input` migration parity | Pending | ✅ Verified |
| FDP-06 `Checkbox` | Pending | ✅ Verified |
| FDP-07 `RadioGroup` | Pending | ✅ Verified |
| FDP-08 `RadioGroupItem` + `name` | Pending | ✅ Verified |
| FDP-09 `Table` family | Pending | ⚠️ Verified except server-safety assertion (Gap 2) |
| FDP-10 scroll container + `containerClassName` | Pending | ✅ Verified |
| FDP-11 `.sv-table*` theme-aware | Pending | ✅ Verified |
| SVD-01 Tailwind config → `var(--sv-*)` | Pending | ⚠️ Verified at the binding level; AC#2 not covered (Gap 1) |
| SVD-02 `*-light` aliases removed | Pending | ✅ Verified |
| SVD-06 visible focus ring | Pending | ✅ Verified |
| SVD-03 preset published | Pending | ✅ Verified (incl. real `npm pack`) |
| SVD-04 optional peer dep | Pending | ✅ Verified |
| SVD-05 `shadcn-overrides.css` in `dist` + subpath | Pending | ✅ Verified |
| FDP-12 Button/Card/Alert/Badge → `sv-*` | Pending | ❌ Needs stronger tests (Gap 3) |
| FDP-13 barrel exports | Pending | ✅ Verified |
| FDP-14 stories | Pending | ✅ Verified |
| FDP-15 docs | Pending | ✅ Verified |
| FDP-16 changesets | Pending | ✅ Verified |

---

## Summary

**Overall**: ⚠️ **Issues — not ready to close**

**Spec-anchored check**: 45 of 48 AC clauses matched their spec-defined outcome with cited `file:line` evidence. 1 not covered (SVD-01 #2), 1 partial (P1-Campos #1 for `FileInput`), 1 weak (P2-2 #1), 1 documented+approved amendment (P2-2 #4). 3 spec-precision gaps flagged (SVD-01 #2, and 2 edge cases with no observable outcome).
**Gate**: typecheck 0 · test:coverage 0 (40 files, 757 passed, 100%/100%/100%/100%) · build 0 · lint:package 0.
**Sensor**: 13 injected, **8 killed, 5 survived**.

**What works**: every new behaviour probed by the sensor is correctly implemented *and* defended. The `RadioGroup` name-propagation trio (direct-child only / own-name wins / wrapper excluded) is three genuinely distinct tests. The `type`-override guards on `FileInput`, `Checkbox` and `RadioGroupItem` are tested at runtime, not just at the type level. `containerClassName` and `className` are asserted as separate targets *with* mutual-exclusion negatives. `field-css-contract.test.ts` and `table-css-contract.test.ts` parse the CSS into a selector→body map and assert exact declaration equality — these would catch a regression, and they pin AC P1-Campos #11 (Input parity, font-size the only change) with real assertions rather than prose. Documentation matches the artifact on every claim checked, and both changesets disclose the AD-004 font-size reancoring by name.

**Issues found**: 3 actionable — (1) SVD-01 AC#2 has no test and is unsatisfiable under jsdom as written; (2) server-safety is unenforced for `FileInput` and the `Table` family, proven by two mutants surviving the full suite; (3) the Button/Card/Alert CSS contracts use substring rule-existence checks that a child selector already satisfies, so three whole base rules can be deleted with the suite green.

**Next steps**: fix Gaps 2 and 3 (both are small, mechanical, and reuse patterns already present in this repo); restate or relocate SVD-01 AC#2; refresh the STATE.md Handoff. Re-verify after.
