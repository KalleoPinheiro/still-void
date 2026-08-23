# Form & Data Primitives — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/form-and-data-primitives/design.md`
**Status**: In Progress

---

## Progresso

| Fase | Tasks | Status | Testes acumulados |
| --- | --- | --- | --- |
| 1 — Fundação | T1 `775bc85`, T2 `714493c`, T3 `8df34e6`, T4 `319030e`, T5 `aa2ef50` | ✅ completa | 475 (base 320, +155) — cobertura 100% |
| 2 — Campos | T6 `054d294`, T7 `b37405c`, T8 `ad89a23`, T9 `6271147` | ✅ completa | 502 (base 475, +27) — cobertura 100% |
| 3 — Escolhas e tabela | T10–T12 | ⏳ pendente | — |
| 4 — Barril e integração | T13–T14 | ⏳ pendente | — |
| 5 — Distribuição | T15–T16 | ⏳ pendente | — |
| 6 — Migração P2 | T17–T20 | ⏳ pendente | — |
| 7 — Catálogo e release | T21–T24 | ⏳ pendente | — |

---

## Test Coverage Matrix

> Gerada a partir do codebase, das diretrizes do projeto e da spec. Diretrizes encontradas: `CLAUDE.md`, `CONTRIBUTING.md`, `vitest.config.ts` (thresholds **100%** em lines/branches/functions/statements sobre `src/**`), `.github/workflows/*.yml` (typecheck → test → build → lint:package).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Receita (`src/recipes/*.ts`) | unit | 100% de branches — **toda** variante/opção tem caso nomeado; 1:1 com as AC da spec | `tests/*.test.ts` | `npm test` |
| Componente React (`src/components/ui/*.tsx`) | unit | 100% de branches; 1:1 com as AC da story correspondente; todo edge case listado na spec tem teste; mínimo herdado de `tests/ui-input.test.tsx` (render, atributo, `ref`, `disabled`, merge de `className`) | `tests/ui-*.test.tsx` | `npm test` |
| Barril de export (`src/react/index.ts`) | unit | Lista exaustiva nos dois sentidos (`Object.keys(...).sort()`), como `tests/shadcn-barrel.test.ts:52` | `tests/react-barrel.test.ts` | `npm test` |
| Composição de formulário (vários componentes juntos) | integration | Submissão real via `FormData`: um caso por tipo de campo + exclusividade mútua dos rádios | `tests/forms-integration.test.tsx` | `npm test` |
| CSS (`src/css/*.css`) | contract (texto) | Toda regra prometida existe; nenhuma cor/espaçamento literal fora de `var(--sv-*)`; padrão de `tests/tokenParity.test.ts` | `tests/*-css-contract.test.ts` | `npm test` |
| Config de build/publicação (`package.json`, `tailwind.config.ts`, `scripts/copy-css.mjs`) | contract (texto) | Todo subpath, campo `files` e peer dep prometidos existem; zero hex literal no config Tailwind | `tests/package-contract.test.ts`, `tests/tailwind-config-contract.test.ts` | `npm test` |
| Stories (`src/react/stories/**`) | none | Excluídas da cobertura por `vitest.config.ts`; verificação é visual no Storybook | — | build gate |
| Documentação (`docs/`, `README.md`, `DESIGN.md`) | none | Revisão humana | — | build gate |

## Parallelism Assessment

> Gerada a partir do codebase.

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
| --- | --- | --- | --- |
| unit (componente/receita) | **Sim** | jsdom por arquivo de teste + `afterEach(cleanup)` do Testing Library; nenhum store, conexão ou global mutável compartilhado | `tests/setup.ts` (só carrega matchers), `tests/ui-input.test.tsx:6` |
| integration (formulário) | **Sim** | Mesma isolação — o "sistema" é o DOM da própria renderização, descartado a cada teste | `tests/theme-provider.test.tsx` já faz render+interação isolado |
| contract (texto de CSS/config) | **Sim** | Leitura de arquivo somente leitura, sem escrita | `tests/tokenParity.test.ts:16-17` |

Nenhum tipo de teste é sequencial-obrigatório neste repo. As restrições de `[P]` abaixo vêm **só** de dependência de código.

## Gate Check Commands

> Gerada a partir do codebase (`package.json` scripts + `.github/workflows`).

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Após task que só adiciona/altera testes unitários | `npm test` |
| Full | Após qualquer task que crie ou altere arquivo em `src/` | `npm run typecheck && npm run test:coverage` |
| Build | Fim de fase, ou task que toca build/publicação/config | `npm run typecheck && npm run test:coverage && npm run build && npm run lint:package` |

> **Nota de cobertura:** o CI hoje roda `npm test` (sem cobertura), mas `vitest.config.ts` declara thresholds de **100%**. O gate Full desta feature usa `test:coverage` de propósito — um arquivo novo em `src/` sem cobertura total falha o gate mesmo que o CI atual deixasse passar.

> **Pré-requisito:** `npm ci` — já executado neste worktree.

> **Baseline verificada em 2026-08-22:** `npm test` → **26 arquivos, 320 testes, todos passando**. Toda contagem de teste nas tasks abaixo é incremento sobre essa base.

---

## Execution Plan

### Fase 1 — Fundação: CSS, receitas e o fix de tema (sequencial na origem, paralelo nas folhas)

T1 e T5 são independentes. T3 depende de T1; T4 depende de T2.

```
T1 (CSS campos) ──→ T3 (recipes/field.ts)
T2 (CSS tabela) ──→ T4 (recipes/table.ts)
T5 (tailwind.config var(--sv-*))  [independente]
```

### Fase 2 — Família de campos (paralela após T3)

```
T3 ──┬→ T6 (Input migra)  [P]
     ├→ T7 (Textarea)     [P]
     ├→ T8 (NativeSelect) [P]
     └→ T9 (FileInput)    [P]
```

### Fase 3 — Escolhas e tabela (paralela)

```
T1 ──┬→ T10 (Checkbox)   [P]
     └→ T11 (RadioGroup) [P]
T4 ───→ T12 (Table)      [P]
```

### Fase 4 — Barril e integração (sequencial)

```
T6,T7,T8,T9,T10,T11,T12 ──→ T13 (exports) ──→ T14 (integração de formulário)
```

### Fase 5 — Distribuição do pacote (paralela)

```
T13 ──┬→ T15 (copy-css + subpath overrides) [P]
      └→ T16 (preset Tailwind publicado)    [P]
```

### Fase 6 — Migração do restante da família server-safe (paralela)

```
T1 ──┬→ T17 (Button) [P]
     ├→ T18 (Card)   [P]
     ├→ T19 (Alert)  [P]
     └→ T20 (Badge)  [P]
```

### Fase 7 — Catálogo, documentação e release (sequencial)

```
T21 (stories campos) → T22 (stories escolhas/tabela) → T23 (docs) → T24 (changesets)
```

---

## Task Breakdown

### T1: Escrever a seção "Forms" de `style.css` ✅ `775bc85`

**What**: Adicionar as regras `.sv-field` (+ modificadores `--textarea`/`--select`/`--file`), `.sv-check`, `.sv-radio`, `.sv-choice`, `.sv-radio-group` (+ `--horizontal`), `.sv-radio-group__legend` e `.sv-sr-only`, exatamente como no contrato de CSS do `design.md`.
**Where**: `src/css/style.css` (append), `tests/field-css-contract.test.ts` (novo)
**Depends on**: None
**Reuses**: padrão de leitura de CSS como texto de `tests/tokenParity.test.ts:16-30`
**Requirement**: FDP-04, SVD-06

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Toda regra listada no contrato de CSS do design existe em `style.css`
- [ ] O teste de contrato afirma, por regra, que ela existe **e** que não contém literal `#`/`oklch(`/`rgba(` — só `var(--sv-*)`, `1px`, `0`, `50%`, `1` e palavras-chave
- [ ] `.sv-field:focus-visible` usa `outline`, e o teste afirma que **nenhuma** regra nova usa `box-shadow` (Flat-By-Default)
- [ ] `.sv-sr-only` usa `clip-path: inset(50%)`, não `display:none` nem `visibility:hidden` (teste explícito)
- [ ] Gate Quick passa: `npm test`
- [ ] Test count: ≥12 testes novos passam

**Tests**: contract (texto) · **Gate**: quick
**Commit**: `feat(css): add sv-field, sv-check and sv-radio-group form rules`

---

### T2: Escrever a seção "Table" de `style.css` ✅ `714493c`

**What**: Adicionar `.sv-table-container`, `.sv-table`, `.sv-table__head|body|foot|row|th|td|caption` conforme o contrato de CSS.
**Where**: `src/css/style.css` (append), `tests/table-css-contract.test.ts` (novo)
**Depends on**: None
**Reuses**: mesmo padrão de T1
**Requirement**: FDP-11

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] As 9 regras existem
- [ ] Teste afirma zero literal de cor e zero `box-shadow`
- [ ] Teste afirma que `.sv-table-container` declara `overflow-x: auto` (é o que garante FDP-10 no nível CSS)
- [ ] Teste afirma `caption-side: bottom` em `.sv-table`
- [ ] Gate Quick passa: `npm test`
- [ ] Test count: ≥8 testes novos passam

**Tests**: contract (texto) · **Gate**: quick
**Commit**: `feat(css): add sv-table data table rules`

---

### T3: Criar a receita `field()` ✅ `8df34e6`

**What**: `src/recipes/field.ts` com `field()`, `FieldVariant`, `FieldOptions` e `fieldClasses`, na forma de `categoryPill()`.
**Where**: `src/recipes/field.ts` (novo), `tests/recipes-field.test.ts` (novo)
**Depends on**: T1
**Reuses**: `src/recipes/cx.ts`, forma de `src/recipes/content.ts:13-25`
**Requirement**: FDP-04

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `field()` sem argumento devolve exatamente `'sv-field'`
- [ ] `field({variant:'input'})` devolve exatamente `'sv-field'` (sem modificador redundante)
- [ ] Cada uma das outras 3 variantes tem caso próprio devolvendo `'sv-field sv-field--<variant>'`
- [ ] `fieldClasses` é `as const` e contém `choice` e `srOnly`
- [ ] Cobertura 100% de branches deste arquivo
- [ ] Gate Full passa: `npm run typecheck && npm run test:coverage`
- [ ] Test count: ≥6 testes novos passam

**Tests**: unit · **Gate**: full
**Commit**: `feat(recipes): add field() recipe as the single source of truth for form fields`

---

### T4: Criar a receita `table()` ✅ `319030e`

**What**: `src/recipes/table.ts` com `table()` e `tableClasses`.
**Where**: `src/recipes/table.ts` (novo), `tests/recipes-table.test.ts` (novo)
**Depends on**: T2
**Reuses**: `src/recipes/cx.ts`, forma de `postCardClasses`
**Requirement**: FDP-11

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `table()` devolve `'sv-table'`
- [ ] `tableClasses` cobre as 8 chaves do design e é `as const`
- [ ] Teste cruza cada valor de `tableClasses` contra a existência da regra em `style.css` (evita classe fantasma)
- [ ] Cobertura 100% deste arquivo
- [ ] Gate Full passa
- [ ] Test count: ≥4 testes novos passam

**Tests**: unit · **Gate**: full
**Commit**: `feat(recipes): add table() recipe and class map`

---

### T5: Ligar `tailwind.config.ts` às variáveis de tema (D1) ✅ `aa2ef50`

**What**: Trocar cada cor literal do config por `var(--sv-*)` e remover os 9 aliases `*-light`, que ficam inertes.
**Where**: `tailwind.config.ts`, `tests/tailwind-config-contract.test.ts` (novo)
**Depends on**: None
**Reuses**: `src/css/theme.css` como fonte dos nomes de var
**Requirement**: SVD-01, SVD-02

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Nenhuma entrada de `theme.extend.colors` contém `#`, `oklch(` ou `rgba(`
- [ ] Cada chave `sv-*` restante referencia uma var que **existe** em `theme.css` (teste cruza os dois arquivos, como `tokenParity`)
- [ ] Nenhuma chave terminada em `-light` permanece
- [ ] `src/css/theme.css` **não** foi modificado (verificado por `git diff --quiet -- src/css/theme.css` na revisão)
- [ ] `tests/tokenParity.test.ts` passa sem edição
- [ ] Gate Full passa
- [ ] Test count: ≥5 testes novos passam

**Tests**: contract (texto) · **Gate**: full
**Commit**: `fix(theme): bind Tailwind color tokens to CSS variables so components follow data-theme`

---

### T6: Migrar `Input` para `field()` [P] ✅ `054d294`

**What**: Trocar a string de utilitárias Tailwind por `cn(field(), className)`, sem alterar props, tipos, `forwardRef` ou `displayName`.
**Where**: `src/components/ui/input.tsx`, `tests/ui-input.test.tsx` (estender)
**Depends on**: T3
**Reuses**: `field()` de T3, `cn()` de `src/lib/utils.ts`
**Requirement**: FDP-05, SVD-06

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Os 5 testes existentes de `ui-input.test.tsx` passam **sem edição** (se algum precisar mudar, é regressão de API — parar e reportar)
- [ ] Novo teste afirma que o `className` renderizado contém `sv-field`
- [ ] Novo teste afirma que `className="custom"` produz `sv-field` **e** `custom`
- [ ] Novo teste afirma que nenhuma utilitária Tailwind de cor (`bg-sv-`, `border-sv-`, `text-sv-`, `ring-`) sobrou no `className` renderizado
- [ ] Gate Full passa
- [ ] Test count: 5 existentes + ≥3 novos passam

**Tests**: unit · **Gate**: full
**Commit**: `fix(input): style via sv-field so the field follows data-theme and shows a focus ring`

---

### T7: Criar `Textarea` [P] ✅ `b37405c`

**What**: Componente `Textarea` server-safe conforme o contrato do design.
**Where**: `src/components/ui/textarea.tsx` (novo), `tests/ui-textarea.test.tsx` (novo)
**Depends on**: T3
**Reuses**: forma de `src/components/ui/input.tsx`, `field()`
**Requirement**: FDP-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Renderiza `<textarea>` (`getByRole('textbox')` resolve para `HTMLTextAreaElement`)
- [ ] `rows={6}` chega ao DOM como `rows="6"` (AC P1-Campos #4)
- [ ] `ref` aponta para `HTMLTextAreaElement` (AC #6)
- [ ] `disabled` desabilita (AC #7)
- [ ] `className` compõe com `sv-field sv-field--textarea`, não substitui (AC #5)
- [ ] `placeholder`, `name`, `defaultValue`, `aria-*` e `data-*` passam sem filtro (edge case da spec)
- [ ] Nenhum import de `react` client-only, nenhum `'use client'` no arquivo (teste de texto do arquivo-fonte)
- [ ] Cobertura 100% deste arquivo
- [ ] Gate Full passa
- [ ] Test count: ≥8 testes novos passam

**Tests**: unit · **Gate**: full
**Commit**: `feat(ui): add server-safe Textarea`

---

### T8: Criar `NativeSelect` [P] ✅ `ad89a23`

**What**: Componente `NativeSelect` server-safe, `<select>` real.
**Where**: `src/components/ui/native-select.tsx` (novo), `tests/ui-native-select.test.tsx` (novo)
**Depends on**: T3
**Reuses**: forma do `Input`, `field()`
**Requirement**: FDP-02

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Renderiza `<select>`; `getByRole('combobox')` resolve para `HTMLSelectElement`
- [ ] `userEvent.selectOptions` altera o valor (AC P1-Campos #3 — é o comportamento que o `Select` do Radix não oferece)
- [ ] `name` chega ao DOM e o valor aparece em `new FormData(form)` (AC #3)
- [ ] `ref`, `disabled`, merge de `className` cobertos
- [ ] `multiple` é repassado e `getAllByRole('option')` funciona (edge case)
- [ ] `<NativeSelect />` sem `<option>` renderiza sem lançar (edge case)
- [ ] Teste de texto do fonte: sem `'use client'`, sem import de `@radix-ui/*`
- [ ] Cobertura 100% deste arquivo
- [ ] Gate Full passa
- [ ] Test count: ≥9 testes novos passam

**Tests**: unit · **Gate**: full
**Commit**: `feat(ui): add server-safe NativeSelect that coexists with the Radix Select`

---

### T9: Criar `FileInput` [P] ✅ `6271147`

**What**: Componente `FileInput` com `type` blindado.
**Where**: `src/components/ui/file-input.tsx` (novo), `tests/ui-file-input.test.tsx` (novo)
**Depends on**: T3
**Reuses**: forma do `Input`, `field()`
**Requirement**: FDP-03

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Renderiza `<input type="file">`
- [ ] `accept="image/*"` e `multiple` chegam ao DOM (AC P1-Campos #8)
- [ ] Passar `type="text"` via `props` **não** altera o tipo — permanece `file` (AC #9). Teste escrito por cast, simulando o consumidor JS sem tipos
- [ ] `ref`, `disabled`, merge de `className` cobertos
- [ ] `className` contém `sv-field sv-field--file`
- [ ] Cobertura 100% deste arquivo
- [ ] Gate Full passa
- [ ] Test count: ≥7 testes novos passam

**Tests**: unit · **Gate**: full
**Commit**: `feat(ui): add server-safe FileInput with a styled file-selector button`

---

### T10: Criar `Checkbox` [P]

**What**: `<input type="checkbox">` estilizado, server-safe, sem Radix.
**Where**: `src/components/ui/checkbox.tsx` (novo), `tests/ui-checkbox.test.tsx` (novo)
**Depends on**: T1
**Reuses**: forma do `Input`, `cn()`
**Requirement**: FDP-06

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `getByRole('checkbox')` resolve (AC P1-Escolhas #2)
- [ ] `defaultChecked` marca; `userEvent.click` alterna
- [ ] `name` presente e serializado em `FormData`
- [ ] `type` passado via props não altera o tipo (AC #3)
- [ ] `ref`, `disabled`, merge de `className` (contém `sv-check`)
- [ ] Teste de texto do fonte: sem `'use client'`, sem `@radix-ui/*` (AC #1)
- [ ] Cobertura 100% deste arquivo
- [ ] Gate Full passa
- [ ] Test count: ≥8 testes novos passam

**Tests**: unit · **Gate**: full
**Commit**: `feat(ui): add server-safe native Checkbox`

---

### T11: Criar `RadioGroup` e `RadioGroupItem` [P]

**What**: `<fieldset>`/`<legend>` + itens `<label><input type=radio></label>`, com injeção de `name` em filhos diretos.
**Where**: `src/components/ui/radio-group.tsx` (novo), `tests/ui-radio-group.test.tsx` (novo)
**Depends on**: T1
**Reuses**: `cn()`, `fieldClasses.srOnly` de T3
**Requirement**: FDP-07, FDP-08

**Tools**: MCP: NONE · Skill: NONE

**Done when** — cada AC da story "Escolhas múltiplas" vira um teste nomeado:
- [ ] `<fieldset>` + `<legend>` com o texto; `getByRole('group', {name})` resolve (AC #4)
- [ ] `legendHidden` mantém a `<legend>` no DOM com `sv-sr-only` (AC #5) — teste afirma que o elemento **existe** e não usa `display:none`
- [ ] `name` do grupo é injetado em cada `RadioGroupItem` filho direto (AC #6)
- [ ] `name` próprio do item vence o do grupo (AC #7)
- [ ] Item dentro de wrapper **não** recebe o `name` do grupo e ainda renderiza (AC #8)
- [ ] Filho que não é `RadioGroupItem` (texto, `<hr/>`, `null`, `false`) renderiza intacto sem lançar (AC #9 + edge case)
- [ ] `children` do item vira rótulo: `getByLabelText('Real')` retorna o `<input type="radio">` (AC #10)
- [ ] `orientation="horizontal"` aplica o modificador; default é vertical (AC #11) — dois testes
- [ ] `RadioGroup` sem `name` com itens sem `name` não inventa `name` (edge case)
- [ ] `RadioGroup` sem `children` renderiza `<fieldset>` vazio (edge case)
- [ ] `ref` de ambos aponta para `HTMLFieldSetElement` / `HTMLInputElement`
- [ ] Teste de texto do fonte: sem `'use client'`, sem `createContext`, sem `useId`, sem `@radix-ui/*`
- [ ] Cobertura 100% de branches deste arquivo (todo caminho do `Children.map`)
- [ ] Gate Full passa
- [ ] Test count: ≥15 testes novos passam

**Tests**: unit · **Gate**: full
**Commit**: `feat(ui): add server-safe RadioGroup and RadioGroupItem`

---

### T12: Criar a família `Table` [P]

**What**: Os 8 componentes de tabela, portados do shadcn upstream com classes `sv-*`.
**Where**: `src/components/ui/table.tsx` (novo), `tests/ui-table.test.tsx` (novo)
**Depends on**: T4
**Reuses**: `tableClasses` de T4, `cn()`, estrutura upstream registrada no `design.md`
**Requirement**: FDP-09, FDP-10

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Os 8 exports existem e cada um renderiza seu elemento nativo (8 testes)
- [ ] `<Table>` envolve o `<table>` num container com `sv-table-container` (AC P1-Tabela #2)
- [ ] `containerClassName` vai para o container e `className` para o `<table>` — teste afirma os **dois** alvos separadamente (AC #3)
- [ ] Roles resolvem: `table`, `columnheader`, `row`, `cell`, e `TableCaption` nomeia a tabela (AC #4, #6)
- [ ] `ref` dos 8 aponta para o elemento nativo correto (AC #5)
- [ ] `<Table>` com filhos diretos, sem `TableHeader`/`TableBody`, renderiza (edge case)
- [ ] Cobertura 100% deste arquivo
- [ ] Gate Full passa
- [ ] Test count: ≥16 testes novos passam

**Tests**: unit · **Gate**: full
**Commit**: `feat(ui): add server-safe Table family`

---

### T13: Exportar tudo pelo barril `@still-void/ui/react`

**What**: Adicionar os exports de componentes e receitas em `src/react/index.ts` e criar o teste exaustivo de barril.
**Where**: `src/react/index.ts`, `tests/react-barrel.test.ts` (novo)
**Depends on**: T6, T7, T8, T9, T10, T11, T12
**Reuses**: técnica de `tests/shadcn-barrel.test.ts:52`
**Requirement**: FDP-13

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `Textarea`, `NativeSelect`, `FileInput`, `Checkbox`, `RadioGroup`, `RadioGroupItem` e os 8 `Table*` exportados, com seus tipos de props
- [ ] `field`, `fieldClasses`, `table`, `tableClasses` exportados
- [ ] Teste afirma `Object.keys(reactIndex).sort()` contra a lista esperada — pega export esquecido **e** export acidental
- [ ] Teste afirma que nenhum componente novo aparece em `src/react/client/shadcn.ts` (AD-002 — servidor é o lugar deles)
- [ ] `npm run typecheck` passa
- [ ] Gate Build passa: `npm run typecheck && npm run test:coverage && npm run build && npm run lint:package`
- [ ] Test count: ≥4 testes novos passam

**Tests**: unit · **Gate**: build
**Commit**: `feat(react): export the new form and table primitives from the server-safe entry`

---

### T14: Teste de integração de formulário

**What**: Um `<form>` com todos os campos novos, submetido de verdade, conferindo o `FormData` resultante.
**Where**: `tests/forms-integration.test.tsx` (novo)
**Depends on**: T13
**Reuses**: componentes de T6–T12
**Requirement**: FDP-01, FDP-02, FDP-06, FDP-08

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Formulário com `Input`, `Textarea`, `NativeSelect`, `Checkbox`, `FileInput` e um `RadioGroup` de 3 itens
- [ ] Após interação, `new FormData(form)` traz o par nome/valor correto de cada campo
- [ ] Os 3 rádios do grupo são mutuamente exclusivos: selecionar o terceiro deixa exatamente um valor para aquele `name` (AC P1-Escolhas #6)
- [ ] Checkbox desmarcado **não** aparece no `FormData` (comportamento nativo — asserção de que a lib não o distorce)
- [ ] Dois `RadioGroup` com `name` diferentes na mesma `<form>` não interferem entre si
- [ ] Gate Full passa
- [ ] Test count: ≥5 testes novos passam

**Tests**: integration · **Gate**: full
**Commit**: `test: cover native form submission across the new primitives`

---

### T15: Publicar `shadcn-overrides.css` (D4) [P]

**What**: Copiar a folha para `dist/` no build de CSS e expor o subpath opt-in.
**Where**: `scripts/copy-css.mjs`, `package.json`, `tests/package-contract.test.ts` (novo)
**Depends on**: T13
**Reuses**: estrutura atual de `scripts/copy-css.mjs`
**Requirement**: SVD-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `copy-css.mjs` copia os 3 arquivos CSS
- [ ] `exports['./shadcn-overrides.css']` aponta para `./dist/shadcn-overrides.css`
- [ ] Teste de contrato afirma que **nenhum** arquivo em `src/css/` importa `shadcn-overrides.css` — é opt-in por decisão (ver Risks & Concerns do design), não default
- [ ] `attw` continua excluindo os entries de CSS (`--exclude-entrypoints` atualizado)
- [ ] Gate Build passa
- [ ] Test count: ≥4 testes novos passam

**Tests**: contract (texto) · **Gate**: build
**Commit**: `fix(build): ship shadcn-overrides.css as an opt-in subpath`

---

### T16: Publicar o preset Tailwind e declarar o peer dep (D2, D3) [P]

**What**: Buildar `tailwind.config.ts` como entry `tailwind-preset`, expor o subpath, incluir no `files`, e declarar `tailwindcss` como peer opcional.
**Where**: `tsup.config.ts`, `package.json`, `tests/package-contract.test.ts` (estender)
**Depends on**: T13
**Reuses**: entries existentes de `tsup.config.ts`
**Requirement**: SVD-03, SVD-04

**Tools**: MCP: NONE · Skill: NONE

> **Achado da Fase 1 que afeta esta task:** `tailwind.config.ts` importa `Config` de `tailwindcss`, mas `corePlugins` não existe no tipo `Config` da v4 (o repo tem `tailwindcss ^4` em devDeps com config em formato v3). Hoje isso passa despercebido porque `tsconfig.json` só inclui `src`, `tests` e `.storybook` — o config da raiz nunca é typechecked. Ao buildar o preset como entry publicada, o tipo passa a ser verificado e quebra.
> **Resolução prescrita (dentro do escopo):** mover o objeto para `src/tailwind-preset.ts`, tipado **estruturalmente** (sem importar `Config` da tailwindcss), e reduzir `tailwind.config.ts` a `export { default } from './src/tailwind-preset'`. Fonte única de verdade, publicável, sem assumir a migração v4 — que segue declarada fora de escopo na spec.

**Done when**:
- [ ] `src/tailwind-preset.ts` é a fonte única; `tailwind.config.ts` só reexporta
- [ ] O preset **não** importa tipo de `tailwindcss` (evita o mismatch v3/v4)
- [ ] `exports['./tailwind-preset']` com `types`/`default` para ESM **e** CJS, no mesmo formato dos entries existentes
- [ ] `peerDependencies.tailwindcss` presente **e** `peerDependenciesMeta.tailwindcss.optional === true` (teste afirma os dois — obrigatório seria `major`)
- [ ] `npm pack --dry-run` lista o preset (teste de contrato lê o campo `files` e o resultado do build)
- [ ] `npm run lint:package` verde (`publint --strict` + `attw`)
- [ ] Gate Build passa
- [ ] Test count: ≥5 testes novos passam

**Tests**: contract (texto) · **Gate**: build
**Commit**: `fix(package): publish the Tailwind preset and declare tailwindcss as an optional peer`

---

### T17: Migrar `Button` para CSS `sv-*` [P]

**What**: Trocar utilitárias Tailwind por classe(s) `sv-btn*` com CSS real, preservando toda variante e prop.
**Where**: `src/components/ui/button.tsx`, `src/css/style.css`, `tests/ui-button.test.tsx` (estender)
**Depends on**: T1
**Reuses**: padrão de T6
**Requirement**: FDP-12

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Testes existentes de `ui-button.test.tsx` passam **sem edição**
- [ ] Teste enumera **todos** os nomes de variante existentes e afirma que cada um continua produzindo uma classe distinta (AC P2 #2)
- [ ] Teste afirma que nenhuma utilitária Tailwind de cor sobrou no `className` renderizado
- [ ] Regras CSS novas sem `box-shadow` e sem literal de cor (estende o contrato de T1)
- [ ] Gate Full passa
- [ ] Test count: existentes + ≥4 novos passam

**Tests**: unit · **Gate**: full
**Commit**: `fix(button): style via sv-* CSS so variants follow data-theme`

---

### T18: Migrar a família `Card` para CSS `sv-*` [P]

**What**: `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent` em classes `sv-*`.
**Where**: `src/components/ui/card.tsx`, `src/css/style.css`, `tests/ui-card.test.tsx` (estender)
**Depends on**: T1
**Reuses**: padrão de T6
**Requirement**: FDP-12

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Testes existentes passam sem edição
- [ ] Cada um dos 6 subcomponentes tem teste afirmando sua classe `sv-*` e o merge de `className`
- [ ] Nenhuma utilitária Tailwind de cor no `className` renderizado; nenhum `box-shadow` nas regras novas
- [ ] Gate Full passa
- [ ] Test count: existentes + ≥7 novos passam

**Tests**: unit · **Gate**: full
**Commit**: `fix(card): style via sv-* CSS so the card follows data-theme`

---

### T19: Migrar a família `Alert` para CSS `sv-*` [P]

**What**: `Alert`, `AlertTitle`, `AlertDescription` em classes `sv-*`, preservando variantes.
**Where**: `src/components/ui/alert.tsx`, `src/css/style.css`, `tests/ui-alert.test.tsx` (estender)
**Depends on**: T1
**Reuses**: padrão de T6
**Requirement**: FDP-12

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Testes existentes passam sem edição
- [ ] Toda variante existente enumerada em teste e preservada
- [ ] `role="alert"` preservado (regressão de a11y seria silenciosa sem isso)
- [ ] Sem utilitária Tailwind de cor, sem `box-shadow`
- [ ] Gate Full passa
- [ ] Test count: existentes + ≥4 novos passam

**Tests**: unit · **Gate**: full
**Commit**: `fix(alert): style via sv-* CSS so variants follow data-theme`

---

### T20: Migrar `Badge` para CSS `sv-*` [P]

**What**: `Badge` em classes `sv-*`, preservando variantes.
**Where**: `src/components/ui/badge.tsx`, `src/css/style.css`, `tests/ui-badge.test.tsx` (estender)
**Depends on**: T1
**Reuses**: padrão de T6
**Requirement**: FDP-12

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Testes existentes passam sem edição
- [ ] Toda variante existente enumerada e preservada
- [ ] Sem utilitária Tailwind de cor, sem `box-shadow`
- [ ] Gate Full passa
- [ ] Test count: existentes + ≥3 novos passam

**Tests**: unit · **Gate**: full
**Commit**: `fix(badge): style via sv-* CSS so variants follow data-theme`

---

### T21: Stories dos campos

**What**: `Textarea.stories.tsx`, `NativeSelect.stories.tsx`, `FileInput.stories.tsx`, cada uma mostrando dark/light e um accent.
**Where**: `src/react/stories/` (3 arquivos novos)
**Depends on**: T13
**Reuses**: `src/react/stories/Input.stories.tsx`
**Requirement**: FDP-14

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Uma story por componente, com variação de tema e accent
- [ ] `NativeSelect.stories.tsx` inclui uma story lado a lado com `Input`, evidenciando a moldura compartilhada
- [ ] `npm run build-storybook` completa sem erro
- [ ] Gate Build passa

**Tests**: none (excluídas da cobertura por `vitest.config.ts`) · **Gate**: build
**Commit**: `docs(storybook): add stories for the new field primitives`

---

### T22: Stories de escolhas e tabela

**What**: `Checkbox.stories.tsx`, `RadioGroup.stories.tsx`, `Table.stories.tsx`.
**Where**: `src/react/stories/` (3 arquivos novos)
**Depends on**: T21
**Reuses**: `src/react/stories/Input.stories.tsx`
**Requirement**: FDP-14

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Uma story por componente, com variação de tema e accent
- [ ] `RadioGroup.stories.tsx` mostra vertical **e** horizontal
- [ ] `Table.stories.tsx` mostra caption, footer e uma tabela larga o bastante para exercitar a rolagem do container
- [ ] `npm run build-storybook` completa sem erro
- [ ] Gate Build passa

**Tests**: none · **Gate**: build
**Commit**: `docs(storybook): add stories for Checkbox, RadioGroup and Table`

---

### T23: Atualizar a documentação

**What**: Catálogo, nota sobre Tailwind e fechamento do "open work" de campo declarado em `DESIGN.md:194`.
**Where**: `docs/design-system.md`, `README.md`, `DESIGN.md`
**Depends on**: T22
**Reuses**: tabelas existentes de `docs/design-system.md:63-87`
**Requirement**: FDP-15

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Catálogo server-safe lista os 14 componentes novos
- [ ] Seção explícita: `NativeSelect` (campo) vs `Select` (combobox), com quando usar cada um (AD-003)
- [ ] `field()` e `table()` listados na seção "Recipes"
- [ ] `README.md:206` reescrito: Tailwind passa a ser opcional, com o subpath do preset e o do `shadcn-overrides.css`
- [ ] `DESIGN.md` §6 corrigido — descreve o estado real da camada shadcn após D1–D5, e a linha 194 ("Button/Input pass is open work") é atualizada para registrar que a moldura de campo agora está especificada
- [ ] `DESIGN.md` ganha a especificação da moldura de campo e do estado de foco (AD-005)
- [ ] Limitação documentada: `RadioGroup` injeta `name` só em filhos diretos
- [ ] Gate Build passa

**Tests**: none · **Gate**: build
**Commit**: `docs: document the form and table primitives and the corrected Tailwind story`

---

### T24: Changesets

**What**: Dois changesets — `minor` para o que é novo, `patch` para as correções.
**Where**: `.changeset/*.md` (2 arquivos novos)
**Depends on**: T23
**Reuses**: formato de `CHANGELOG.md`
**Requirement**: FDP-16

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Changeset `minor`: componentes novos, receitas `field()`/`table()`, novos subpaths, `tailwindcss` como peer opcional
- [ ] Changeset `patch`: D1 (tema), D2/D3/D4 (distribuição), D5 (anel de foco), a reancoragem de `font-size` do `Input` (AD-004) nomeada explicitamente, e a remoção dos aliases `*-light`
- [ ] Ambos escritos para o consumidor do changelog, não para o mantenedor
- [ ] Nenhuma edição manual de `version` no `package.json` nem de `CHANGELOG.md` (regra do `CLAUDE.md`)
- [ ] Gate Build passa

**Tests**: none · **Gate**: build
**Commit**: `chore: add changesets for the form/table primitives and the theming fixes`

---

## Parallel Execution Map

```
Fase 1:
  T1 ──→ T3
  T2 ──→ T4
  T5 (independente)

Fase 2 (após T3):
  ├── T6 [P]
  ├── T7 [P]
  ├── T8 [P]
  └── T9 [P]

Fase 3 (após T1 e T4):
  ├── T10 [P]   (T1)
  ├── T11 [P]   (T1)
  └── T12 [P]   (T4)

Fase 4 (após T6–T12):
  T13 ──→ T14

Fase 5 (após T13):
  ├── T15 [P]
  └── T16 [P]

Fase 6 (após T1):
  ├── T17 [P]
  ├── T18 [P]
  ├── T19 [P]
  └── T20 [P]

Fase 7 (após T13):
  T21 ──→ T22 ──→ T23 ──→ T24
```

> **Nota de execução:** T17–T20 (Fase 6) e T21–T24 (Fase 7) tocam `src/css/style.css` e `docs/` respectivamente. Se as fases forem despachadas a workers, elas rodam **em sequência**, nunca concorrentes, para evitar escrita concorrente em `style.css`.

---

## Task Granularity Check

| Task | Escopo | Status |
| --- | --- | --- |
| T1 | 1 seção de CSS + seu contract test | ✅ Granular |
| T2 | 1 seção de CSS + seu contract test | ✅ Granular |
| T3 | 1 receita | ✅ Granular |
| T4 | 1 receita | ✅ Granular |
| T5 | 1 arquivo de config | ✅ Granular |
| T6 | 1 componente (migração) | ✅ Granular |
| T7 / T8 / T9 / T10 | 1 componente cada | ✅ Granular |
| T11 | 2 componentes no mesmo arquivo, acoplados por contrato | ⚠️ OK — coesos, separá-los quebraria a injeção de `name` |
| T12 | 8 componentes no mesmo arquivo | ⚠️ OK — família indivisível; upstream shadcn é um arquivo só e os 8 são triviais |
| T13 | 1 arquivo de barril | ✅ Granular |
| T14 | 1 arquivo de teste | ✅ Granular |
| T15 / T16 | 1 preocupação de build cada | ✅ Granular |
| T17 / T18 / T19 / T20 | 1 componente/família cada | ✅ Granular |
| T21 / T22 | 3 stories coesas cada | ⚠️ OK — arquivos triviais do mesmo tipo |
| T23 | doc | ✅ Granular |
| T24 | changesets | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (corpo) | Diagrama mostra | Status |
| --- | --- | --- | --- |
| T1 | None | raiz | ✅ |
| T2 | None | raiz | ✅ |
| T3 | T1 | T1 → T3 | ✅ |
| T4 | T2 | T2 → T4 | ✅ |
| T5 | None | independente | ✅ |
| T6 | T3 | T3 → T6 | ✅ |
| T7 | T3 | T3 → T7 | ✅ |
| T8 | T3 | T3 → T8 | ✅ |
| T9 | T3 | T3 → T9 | ✅ |
| T10 | T1 | T1 → T10 | ✅ |
| T11 | T1 | T1 → T11 | ✅ |
| T12 | T4 | T4 → T12 | ✅ |
| T13 | T6–T12 | T6…T12 → T13 | ✅ |
| T14 | T13 | T13 → T14 | ✅ |
| T15 | T13 | T13 → T15 | ✅ |
| T16 | T13 | T13 → T16 | ✅ |
| T17 | T1 | T1 → T17 | ✅ |
| T18 | T1 | T1 → T18 | ✅ |
| T19 | T1 | T1 → T19 | ✅ |
| T20 | T1 | T1 → T20 | ✅ |
| T21 | T13 | T13 → T21 | ✅ |
| T22 | T21 | T21 → T22 | ✅ |
| T23 | T22 | T22 → T23 | ✅ |
| T24 | T23 | T23 → T24 | ✅ |

Nenhuma task marcada `[P]` depende de outra `[P]` da mesma fase. ✅

---

## Test Co-location Validation

| Task | Camada criada/alterada | Matriz exige | Task declara | Status |
| --- | --- | --- | --- | --- |
| T1 | CSS | contract | contract | ✅ |
| T2 | CSS | contract | contract | ✅ |
| T3 | Receita | unit | unit | ✅ |
| T4 | Receita | unit | unit | ✅ |
| T5 | Config de build | contract | contract | ✅ |
| T6 | Componente | unit | unit | ✅ |
| T7 | Componente | unit | unit | ✅ |
| T8 | Componente | unit | unit | ✅ |
| T9 | Componente | unit | unit | ✅ |
| T10 | Componente | unit | unit | ✅ |
| T11 | Componente | unit | unit | ✅ |
| T12 | Componente | unit | unit | ✅ |
| T13 | Barril | unit | unit | ✅ |
| T14 | Composição de formulário | integration | integration | ✅ |
| T15 | Config de build | contract | contract | ✅ |
| T16 | Config de build | contract | contract | ✅ |
| T17 | Componente + CSS | unit | unit | ✅ |
| T18 | Componente + CSS | unit | unit | ✅ |
| T19 | Componente + CSS | unit | unit | ✅ |
| T20 | Componente + CSS | unit | unit | ✅ |
| T21 | Stories | none | none | ✅ |
| T22 | Stories | none | none | ✅ |
| T23 | Documentação | none | none | ✅ |
| T24 | Changesets | none | none | ✅ |

Nenhuma violação. Nenhuma task produz código sem verificação na própria task.

---

## Requirement Traceability (fechamento)

| Requisito | Tasks |
| --- | --- |
| FDP-01 | T7, T14 |
| FDP-02 | T8, T14 |
| FDP-03 | T9 |
| FDP-04 | T1, T3 |
| FDP-05 | T6 |
| FDP-06 | T10, T14 |
| FDP-07 | T11 |
| FDP-08 | T11, T14 |
| FDP-09 | T12 |
| FDP-10 | T2, T12 |
| FDP-11 | T2, T4 |
| FDP-12 | T17, T18, T19, T20 |
| FDP-13 | T13 |
| FDP-14 | T21, T22 |
| FDP-15 | T23 |
| FDP-16 | T24 |
| SVD-01 | T5 |
| SVD-02 | T5 |
| SVD-03 | T16 |
| SVD-04 | T16 |
| SVD-05 | T15 |
| SVD-06 | T1, T6 |

**Cobertura:** 22 requisitos, 22 mapeados a tasks, 0 sem mapeamento.
