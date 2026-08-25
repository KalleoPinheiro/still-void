# Rodada 2 — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: [design.md](design.md)
**Status**: In Progress — Fases 1–5 concluídas (T1–T16 + T24)

---

## Test Coverage Matrix

> Gerada do codebase, das guidelines do projeto e da spec — confirmar antes do Execute. Guidelines encontradas: `CLAUDE.md` (regra do changeset por mudança em `src/`/`scripts/`), `CONTRIBUTING.md` (níveis de bump), `vitest.config.ts` (thresholds de cobertura **100%** em lines/branches/functions/statements), `~/.claude/rules/ecc/common/testing.md` (mínimo 80% — superado pelo threshold local).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Componente React (`src/components/ui/*.tsx`) | unit (RTL) | Todos os branches; 1:1 com as ACs da spec; toda edge case listada tem teste. O threshold de 100% do `vitest.config.ts` é gate de CI, não meta | `tests/ui-*.test.tsx` | `npm run test` |
| CSS do sistema (`src/css/*.css`) | unit (contrato textual) | Toda regra prometida existe; **todo** valor de cor/espaçamento/raio/z-index vem de `var(--sv-*)`; nenhum `box-shadow` ≠ `none`; nenhum `!important` | `tests/*-css-contract.test.ts` | `npm run test` |
| Entry / barrel (`src/react/**`) | unit | Todo export prometido resolve; grafo server-safe sem `'use client'`, sem hook, sem Radix — **incluindo dependências de terceiros** (ICON-07) | `tests/server-safety.test.ts`, `tests/react-barrel.test.ts`, `tests/shadcn-barrel.test.ts` | `npm run test` |
| Manifesto e build (`package.json`, `scripts/`, `tsup.config.ts`) | unit (contrato textual) | Todo subpath exportado aponta para artefato copiado; peers corretos; nada em formato v3 sobrevive | `tests/package-contract.test.ts` | `npm run test` + `npm run lint:package` |
| Documentação (`README.md`, `docs/*.md`) | unit (cross-check) | Toda família anunciada existe no barrel correspondente | `tests/*-barrel.test.ts` (cross-check) | `npm run test` |
| Stories (`src/react/stories/*`) | none | Excluídas da cobertura por `vitest.config.ts`; verificadas pelo build do Storybook | — | `npm run build-storybook` |

## Parallelism Assessment

> Gerada do codebase — confirmar antes do Execute.

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
| --- | --- | --- | --- |
| unit (RTL, jsdom) | **Sim** | `afterEach(cleanup)` por arquivo; nenhum store compartilhado, nenhuma conexão, nenhum estado global mutável entre arquivos | `tests/ui-dialog.test.tsx:14`, `tests/ui-table.test.tsx`, padrão repetido nos 20 arquivos `ui-*` |
| unit (contrato textual sobre arquivo) | **Sim** | Cada arquivo faz `readFileSync` no próprio módulo; leitura pura, sem escrita | `tests/field-css-contract.test.ts:14`, `tests/package-contract.test.ts:20` |
| build / lint de pacote | **Não** | Escreve em `dist/`; dois processos disputam o mesmo diretório | `scripts/copy-css.mjs`, `tsup.config.ts` (`clean: true` na primeira entry) |

## Gate Check Commands

> Gerada do codebase — confirmar antes do Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Depois de task que **não cria arquivo de teste novo** | `npm run test` |
| Full | Task que cria arquivo de teste novo, muda tipo público ou muda assinatura | `npm run test && npm run typecheck` |
| — | **Correção registrada em 2026-08-24**: o gate quick roda só o vitest, que **não** enxerga erro de tipo em arquivo de teste. T10 e T11 passaram no quick e deixaram dois erros de `noUncheckedIndexedAccess` que só apareceram no gate full do T9 (`d324c46`). Toda task que adiciona teste usa full. | |
| Build | Fim de fase, ou task que toca manifesto/build/CSS publicado | `npm run build && npm run lint:package && npm run test:coverage` |

---

## Execution Plan

### Fase 1: Camada de ícones (Sequencial, com um par paralelo)

```
T1 ──┐
     ├──→ T3 ──→ T4
T2 ──┘
```

### Fase 2: Primitivas CSS (Paralelo)

```
T4 ──┬──→ T5 [P]
     ├──→ T6 [P]
     ├──→ T7 [P]
     └──→ T8 [P]
```

### Fase 3: Dialog, Tabs, Tooltip (Paralelo)

```
T5 ──→ T9  [P]
T8 ──→ T10 [P]
T6 ──→ T11 [P]
```

### Fase 4: Select e DropdownMenu (Sequencial no fim)

```
T6, T7 ──┬──→ T12 [P] ──┐
         └──→ T13 [P] ──┴──→ T14
```

### Fase 5: AlertDialog (Sequencial)

```
T9 ──→ T15 ──→ T16
```

### Fase 6: Button e Card (Paralelo)

```
T14 ──→ T17 [P]
T14 ──→ T18 [P]
```

### Fase 7: Tailwind, docs e release (Sequencial)

```
T14, T16, T17, T18 ──→ T19 ──→ T20 ──→ T21 ──→ T22 ──→ T23
```

---

## Task Breakdown

### ✅ T1: Seção `Icons` no `style.css` — `f6697a9`

**What**: declarar `.sv-icon`, `.sv-icon--sm` e `.sv-icon--lg` com tamanho, cor e traço vindos de token.
**Where**: `src/css/style.css` (seção nova `/* ---------- Icons ---------- */`), `tests/icon-css-contract.test.ts`
**Depends on**: None
**Reuses**: parser seletor→corpo de `tests/component-css-contract.test.ts`
**Requirement**: ICON-02

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `.sv-icon` define `width`/`height` por `var(--sv-space-*)`, `color: currentColor` e `flex-shrink: 0`
- [ ] `.sv-icon--sm` e `.sv-icon--lg` mudam só o tamanho, também por token
- [ ] Nenhum `px` literal, nenhum hex, nenhum `!important` na seção
- [ ] Contrato usa o parser seletor→corpo (não `toContain`)
- [ ] Gate: `npm run test`
- [ ] Test count: +6 testes

**Tests**: unit (contrato) · **Gate**: quick
**Commit**: `feat(css): add the sv-icon size scale`

---

### ✅ T2: `@heroicons/react` como dependência direta — `67a85ce`

**What**: adicionar `@heroicons/react` a `dependencies` e travar o contrato no `package-contract`.
**Where**: `package.json`, `package-lock.json`, `tests/package-contract.test.ts`
**Depends on**: None
**Reuses**: blocos existentes de `tests/package-contract.test.ts`
**Requirement**: ICON-06 (parcial)

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `dependencies["@heroicons/react"]` presente com faixa `^2`
- [ ] Teste afirma que a dep está em `dependencies` (não em `devDependencies` nem `peerDependencies`)
- [ ] `npm ls @heroicons/react` resolve sem erro
- [ ] Gate: `npm run build && npm run lint:package && npm run test:coverage`
- [ ] Test count: +2 testes

**Tests**: unit (contrato) · **Gate**: build
**Commit**: `feat(deps): add @heroicons/react as the icon source`

---

### ✅ T3: Componente `Icon` e set curado — `413bb14`

**What**: criar o `Icon` server-safe com union fechada de nomes mapeada para `@heroicons/react/24/outline`.
**Where**: `src/components/ui/icon.tsx`, `src/components/ui/icon-set.ts`, `src/react/index.ts`, `tests/ui-icon.test.tsx`
**Depends on**: T1, T2
**Reuses**: `cn()` de `src/lib/utils.ts`; padrão de `forwardRef` + `displayName` dos componentes da rodada 1
**Requirement**: ICON-01, ICON-03, ICON-04, ICON-05, ICON-06

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `IconName` é union fechada; `icon-set.ts` mapeia cada nome a um import **nomeado** de `@heroicons/react/24/outline`
- [ ] Sem `import * as` e sem import do barrel raiz do pacote
- [ ] `<Icon name="x" />` emite `<svg class="sv-icon">` com `aria-hidden="true"`
- [ ] `size="sm"|"lg"` emite o modificador; `size="md"` **não** emite modificador
- [ ] `label` troca `aria-hidden` por `role="img"` + `aria-label`
- [ ] `name` inválido em runtime cai no default sem lançar (branch coberto)
- [ ] `className` do consumidor soma-se a `sv-icon`, não substitui
- [ ] Exportado de `@still-void/ui/react` com o tipo `IconProps`
- [ ] Gate: `npm run test && npm run typecheck`
- [ ] Test count: +12 testes

**Tests**: unit · **Gate**: full
**Commit**: `feat(icon): add a curated, server-safe Icon component`

---

### ✅ T4: `server-safety` passa a cobrir terceiros — `dae8d9c`

**What**: estender o walker para resolver especificador bare e varrer o `dist` da dependência por `'use client'` e hooks.
**Where**: `tests/server-safety.test.ts`
**Depends on**: T3
**Reuses**: `collectGraph`/`stripComments` já existentes no arquivo
**Requirement**: ICON-07

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Walker resolve import bare via `require.resolve`/`node:module` e inclui o arquivo de entrada da dep no grafo
- [ ] Teste-guarda prova que o grafo **alcançou** `@heroicons/react` (senão as asserções passariam sobre vazio)
- [ ] Asserção de `'use client'` e de hook roda sobre os módulos de terceiros alcançados
- [ ] Sensor manual registrado no commit: trocar temporariamente o import por `lucide-react` faz o teste **falhar**
- [ ] Gate: `npm run test`
- [ ] Test count: +3 testes

**Tests**: unit · **Gate**: quick
**Commit**: `test(server-safety): walk third-party imports for client directives`

---

### ✅ T5: Primitivas `.sv-overlay` e `.sv-dialog*` [P] — `d2cc02a`

**What**: escrever as seções `Overlays` e `Dialog` do `style.css`, com fade por `[data-state]` e reduced-motion.
**Where**: `src/css/style.css`, `src/css/theme.css` (bloco reduced-motion), `tests/client-css-contract.test.ts` (novo)
**Depends on**: T4
**Reuses**: tokens `--sv-z-backdrop`/`--sv-z-modal`, `.sv-sr-only`, bloco `prefers-reduced-motion` de `theme.css:234`
**Requirement**: CLIENT-02, CLIENT-03, CLIENT-04, CLIENT-08, CLIENT-11

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `.sv-overlay` usa `var(--sv-z-backdrop)` e cor por `color-mix` sobre token — sem hex, sem `z-50`
- [ ] `.sv-dialog` usa `var(--sv-z-modal)`, `var(--sv-radius-lg)`, `var(--sv-surface)`, `var(--sv-border)`
- [ ] `.sv-dialog__close` tem foco por `outline: 2px solid var(--sv-accent-ink)` (AD-005)
- [ ] Fade declarado como `.sv-overlay[data-state='open']` / `[data-state='closed']` — **nunca** `[data-state]` solto
- [ ] `prefers-reduced-motion` zera a transição das classes novas
- [ ] Zero `box-shadow` ≠ `none`, zero `!important` na seção
- [ ] Gate: `npm run test`
- [ ] Test count: +14 testes

**Tests**: unit (contrato) · **Gate**: quick
**Commit**: `feat(css): add the overlay and dialog primitives`

---

### ✅ T6: Primitiva `.sv-pop` e `.sv-tooltip` [P] — `1d31a62`

**What**: superfície flutuante compartilhada por `Select`, `DropdownMenu` e `Tooltip`.
**Where**: `src/css/style.css`, `tests/client-css-contract.test.ts`
**Depends on**: T4
**Reuses**: tokens `--sv-z-dropdown`, `--sv-z-tooltip`, `--sv-radius-md`
**Requirement**: CLIENT-02, CLIENT-03, CLIENT-04, CLIENT-08

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `.sv-pop` define superfície, borda, raio e z-index por token, com fade por `[data-state]` ancorado na classe
- [ ] `.sv-pop__viewport` e `.sv-pop__scroll` cobrem o viewport e os botões de scroll do `Select`
- [ ] `.sv-tooltip` declara **só** o que difere de `.sv-pop` (z-index de tooltip, padding menor)
- [ ] Zero `box-shadow` ≠ `none` (fecha o `shadow-md` do `SelectContent`)
- [ ] Gate: `npm run test`
- [ ] Test count: +12 testes

**Tests**: unit (contrato) · **Gate**: quick
**Commit**: `feat(css): add the floating panel primitive`

---

### ✅ T7: Primitiva `.sv-menu-item` e irmãos [P] — `6743cd5`

**What**: item de lista compartilhado por `Select` e `DropdownMenu`, com slot de indicador.
**Where**: `src/css/style.css`, `tests/client-css-contract.test.ts`
**Depends on**: T4
**Reuses**: escala de espaçamento; padrão `--inset` como modificador
**Requirement**: CLIENT-02, CLIENT-08, CLIENT-09

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `.sv-menu-item` com estados `:focus`/`[data-highlighted]`/`[data-disabled]` por token
- [ ] `.sv-menu-item__indicator` reserva o slot **e** o colapsa quando vazio (`:empty`) — o `pl-8` órfão não volta
- [ ] `.sv-menu-item__dot` é o círculo do rádio, por token
- [ ] `.sv-menu-label`, `.sv-menu-separator`, `.sv-menu-shortcut` declarados
- [ ] Gate: `npm run test`
- [ ] Test count: +14 testes

**Tests**: unit (contrato) · **Gate**: quick
**Commit**: `feat(css): add the menu item primitive with an indicator slot`

---

### ✅ T8: Seção `Tabs` do `style.css` [P] — `12a8253`

**What**: `.sv-tabs`, `__list`, `__trigger`, `__content`.
**Where**: `src/css/style.css`, `tests/client-css-contract.test.ts`
**Depends on**: T4
**Reuses**: tokens de superfície e raio
**Requirement**: CLIENT-02, CLIENT-04, CLIENT-08, CLIENT-11

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `.sv-tabs__trigger[data-state='active']` usa `var(--sv-surface)` — e **sem** `box-shadow` (fecha o `shadow-sm`)
- [ ] Foco por `outline` (AD-005), não `ring`
- [ ] `.sv-tabs__content` com espaçamento por token
- [ ] Gate: `npm run test`
- [ ] Test count: +8 testes

**Tests**: unit (contrato) · **Gate**: quick
**Commit**: `feat(css): add the tabs section`

---

### ✅ T9: Migrar `Dialog` [P] — `d7cbf56`

**What**: trocar utilitárias por `sv-*`, adicionar `aria-modal` e o botão de fechar com opt-out.
**Where**: `src/components/ui/dialog.tsx`, `tests/ui-dialog-behavior.test.tsx` (novo)
**Depends on**: T5
**Reuses**: `.sv-overlay`, `.sv-dialog*`, `Icon`, `.sv-sr-only`
**Requirement**: CLIENT-01, CLIENT-05, CLIENT-06, CLIENT-07, CLIENT-12

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Nenhuma utilitária Tailwind sobra no arquivo (grep limpo)
- [ ] `DialogContent` emite `aria-modal="true"`
- [ ] Botão de fechar renderiza por padrão, com `<Icon name="x" />` + `Close` em `sv-sr-only`, e **fecha** o dialog ao clicar
- [ ] `showCloseButton={false}` não renderiza o botão
- [ ] `displayName` de todos os membros idêntico ao anterior
- [ ] `tests/ui-dialog.test.tsx` passa **sem edição**
- [ ] Gate: `npm run test && npm run typecheck`
- [ ] Test count: +10 testes

**Tests**: unit · **Gate**: full
**Commit**: `fix(dialog): style through sv-* classes and close the a11y gaps`

---

### ✅ T10: Migrar `Tabs` [P] — `11f01f3`

**What**: trocar utilitárias por `.sv-tabs*`.
**Where**: `src/components/ui/tabs.tsx`, `tests/ui-tabs-classes.test.tsx` (novo)
**Depends on**: T8
**Reuses**: `.sv-tabs*`
**Requirement**: CLIENT-01, CLIENT-07, CLIENT-12

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Zero utilitária; as classes mortas `ring-ring`/`ring-offset-background` desaparecem
- [ ] `displayName` preservado nos três membros
- [ ] `tests/ui-tabs.test.tsx` passa sem edição
- [ ] Gate: `npm run test`
- [ ] Test count: +6 testes

**Tests**: unit · **Gate**: quick
**Commit**: `fix(tabs): style through sv-* classes`

---

### ✅ T11: Migrar `Tooltip` [P] — `d79d552`

**What**: trocar utilitárias por `.sv-pop` + `.sv-tooltip`.
**Where**: `src/components/ui/tooltip.tsx`, `tests/ui-tooltip-classes.test.tsx` (novo)
**Depends on**: T6
**Reuses**: `.sv-pop`, `.sv-tooltip`
**Requirement**: CLIENT-01, CLIENT-07, CLIENT-12

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Zero utilitária no arquivo
- [ ] `displayName` preservado
- [ ] `tests/ui-tooltip.test.tsx` passa sem edição
- [ ] Gate: `npm run test`
- [ ] Test count: +5 testes

**Tests**: unit · **Gate**: quick
**Commit**: `fix(tooltip): style through sv-* classes`

---

### ✅ T12: Migrar `Select` [P] — `b57e1a7`

**What**: migrar o CSS, envolver children em `ItemText`, renderizar indicador e chevrons, e expor `icon`.
**Where**: `src/components/ui/select.tsx`, `tests/ui-select-value.test.tsx` (novo)
**Depends on**: T6, T7
**Reuses**: `.sv-field` (frame do trigger), `.sv-pop*`, `.sv-menu-item*`, `Icon`, `SelectPrimitive.ItemText`/`ItemIndicator`/`Icon`
**Requirement**: CLIENT-01, CLIENT-09, CLIENT-10, CLIENT-13, CLIENT-14

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `SelectItem` envolve children em `SelectPrimitive.ItemText` — teste **seleciona um valor** e afirma o texto no trigger (defeito CLIENT-13)
- [ ] `SelectItem` renderiza `ItemIndicator` com `<Icon name="check" />`
- [ ] `SelectTrigger` renderiza `SelectPrimitive.Icon` com `chevron-down`; botões de scroll com `chevron-up`/`chevron-down`
- [ ] Prop `icon` substitui o indicador; `icon={null}` colapsa o slot (dois branches testados)
- [ ] Zero utilitária; `ring-offset-background`/`focus:ring-accent` desaparecem
- [ ] `tests/ui-select.test.tsx` passa sem edição
- [ ] Gate: `npm run test && npm run typecheck`
- [ ] Test count: +14 testes

**Tests**: unit · **Gate**: full
**Commit**: `fix(select): render ItemText and the indicator, and style through sv-*`

---

### ✅ T13: Migrar `DropdownMenu` [P] — `c101242`

**What**: migrar o CSS e renderizar os indicadores de checkbox e rádio, com `icon` substituível.
**Where**: `src/components/ui/dropdown-menu.tsx`, `tests/ui-dropdown-menu-indicator.test.tsx` (novo)
**Depends on**: T6, T7
**Reuses**: `.sv-pop`, `.sv-menu-item*`, `Icon`, `DropdownMenuPrimitive.ItemIndicator`
**Requirement**: CLIENT-01, CLIENT-09, CLIENT-14

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `CheckboxItem` renderiza `ItemIndicator` com `check`; `RadioItem` com `.sv-menu-item__dot`
- [ ] `SubTrigger` renderiza `chevron-right`
- [ ] `inset` vira `.sv-menu-item--inset` (branch testado nos dois lados)
- [ ] Prop `icon` substitui; `icon={null}` colapsa
- [ ] Zero utilitária nos 15 exports
- [ ] `tests/ui-dropdown-menu.test.tsx` passa sem edição
- [ ] Gate: `npm run test && npm run typecheck`
- [ ] Test count: +14 testes

**Tests**: unit · **Gate**: full
**Commit**: `fix(dropdown-menu): render indicators and style through sv-*`

---

### ✅ T14: Contrato de pureza de classe da família client — `1845a11`

**What**: um teste que renderiza os cinco e falha se **qualquer** classe emitida estiver fora do prefixo `sv-`.
**Where**: `tests/client-class-contract.test.tsx` (novo)
**Depends on**: T9, T10, T11, T12, T13
**Reuses**: helpers de render dos testes `ui-*`
**Requirement**: CLIENT-01, CLIENT-12

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Percorre o DOM renderizado de cada família e coleta todas as classes
- [ ] Falha se sobrar classe fora de `sv-*` (exceto a que o teste passa via `className`, que é o caso de controle)
- [ ] Cobre nominalmente `bg-background`, `ring-ring`, `ring-accent`, `ring-offset-background`, `shadow-lg`, `shadow-md`, `shadow-sm`
- [ ] Os 5 arquivos de teste antigos seguem intactos (`git diff --stat` no commit prova)
- [ ] Gate: `npm run test`
- [ ] Test count: +8 testes

**Tests**: unit · **Gate**: quick
**Commit**: `test(client): pin the class purity of the migrated family`

---

### ✅ T15: Componente `AlertDialog` — `cd440e6`

**What**: portar a família do shadcn usando as classes já existentes do `Dialog`.
**Where**: `src/components/ui/alert-dialog.tsx`, `tests/ui-alert-dialog.test.tsx` (novo)
**Depends on**: T9
**Reuses**: `.sv-overlay`, `.sv-dialog*`, `@radix-ui/react-alert-dialog` (já em `dependencies`)
**Requirement**: ALERT-01, ALERT-02, ALERT-03, ALERT-04, ALERT-05

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Os 11 membros existem e reexportam os primitivos certos
- [ ] `AlertDialogContent` tem `role="alertdialog"` e `aria-modal="true"`
- [ ] Nenhum bloco de CSS novo — só reuso das classes do `Dialog`
- [ ] Sem botão de fechar em `X`
- [ ] `displayName` no padrão da família `Dialog`
- [ ] `AlertDialogCancel` fecha; `AlertDialogAction` fecha
- [ ] Gate: `npm run test && npm run typecheck`
- [ ] Test count: +12 testes

**Tests**: unit · **Gate**: full
**Commit**: `feat(alert-dialog): port the destructive confirmation family`

---

### ✅ T16: Exportar `AlertDialog` e cruzar a doc — `c73b45c`

**What**: exportar do barrel client e travar o cross-check doc↔barrel que falhou na rodada 1.
**Where**: `src/react/client/shadcn.ts`, `tests/shadcn-barrel.test.ts`, `docs/design-system.md`
**Depends on**: T15
**Reuses**: teste de barrel existente
**Requirement**: ALERT-01, ALERT-06

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] Os 11 exports saem de `@still-void/ui/react/client`
- [ ] Teste extrai as famílias anunciadas em `docs/design-system.md` e afirma que **cada uma** existe no barrel — é o cross-check que deixou passar o `AlertDialog` fantasma
- [ ] Gate: `npm run test`
- [ ] Test count: +6 testes

**Tests**: unit · **Gate**: quick
**Commit**: `feat(client): export the AlertDialog family`

---

### T17: `Button variant="accent"` [P]

**What**: somar `.sv-btn--accent` ao CSS e o valor à union.
**Where**: `src/css/style.css`, `src/components/ui/button.tsx`, `tests/ui-button.test.tsx`, `tests/contrast.test.ts`
**Depends on**: T14
**Reuses**: modificadores `.sv-btn--*` existentes
**Requirement**: BTN-01, BTN-02, BTN-03, BTN-04

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `.sv-btn--accent` com `background: var(--sv-accent-ink)`, `color: var(--sv-bg)` e hover por `color-mix` do mesmo token
- [ ] `<Button variant="accent">` emite `sv-btn sv-btn--accent`
- [ ] As 6 variantes antigas seguem emitindo o que emitiam (regressão coberta)
- [ ] Contraste de `--sv-accent-ink` sobre `--sv-bg` verificado nos dois temas em `tests/contrast.test.ts`
- [ ] Gate: `npm run test && npm run typecheck`
- [ ] Test count: +6 testes

**Tests**: unit · **Gate**: full
**Commit**: `feat(button): add the accent variant`

---

### T18: `Card` com `as` e `asChild` [P]

**What**: promover `@radix-ui/react-slot` a dep direta e abrir o elemento do `Card`.
**Where**: `package.json`, `src/components/ui/card.tsx`, `tests/ui-card.test.tsx`, `tests/package-contract.test.ts`
**Depends on**: T14
**Reuses**: `@radix-ui/react-slot@1.3.3` (hoje transitiva, verificada sem `'use client'` e sem hook)
**Requirement**: CARD-01, CARD-02, CARD-03, CARD-04, CARD-05, CARD-06

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `@radix-ui/react-slot` em `dependencies`, com teste de contrato
- [ ] `as="section"` renderiza `<section>`; sem prop renderiza `<div>`
- [ ] `asChild` funde classe, `ref` e props no filho sem wrapper extra
- [ ] `as` + `asChild` juntos: `asChild` vence (AD-006)
- [ ] `as` inválido em runtime cai em `<div>` via `Set` de tags permitidas
- [ ] `tests/server-safety.test.ts` (já endurecido em T4) continua verde — prova CARD-05
- [ ] Gate: `npm run build && npm run lint:package && npm run test:coverage`
- [ ] Test count: +10 testes

**Tests**: unit · **Gate**: build
**Commit**: `feat(card): support as and asChild for the rendered element`

---

### T19: Publicar `@still-void/ui/tailwind.css`

**What**: criar o arquivo `@theme inline`, copiar para `dist` e expor o subpath.
**Where**: `src/css/tailwind.css` (novo), `scripts/copy-css.mjs`, `package.json`, `tests/tailwind-css-contract.test.ts` (novo)
**Depends on**: T14, T16, T17, T18
**Reuses**: padrão de `tests/tokenParity.test.ts` e dos blocos de cópia do `package-contract`
**Requirement**: TW-01, TW-02, TW-03, TW-05

**Tools**: MCP: `context7` (doc do Tailwind v4, já consultada no Design) · Skill: NONE

**Done when**:
- [ ] Arquivo usa **`@theme inline`** — sem `inline` a variável não resolve sob `[data-theme]` (confirmado na doc oficial)
- [ ] Todo valor é `var(--sv-*)`; nenhum literal
- [ ] Sem `@source` e sem `--color-background`/`--color-ring`/`--color-destructive`/`--color-destructive-foreground`
- [ ] `copy-css.mjs` copia para `dist/tailwind.css`; `exports["./tailwind.css"]` aponta para lá
- [ ] Paridade: cada `--color-sv-*` tem token correspondente em `theme.css`
- [ ] Gate: `npm run build && npm run lint:package && npm run test:coverage`
- [ ] Test count: +12 testes

**Tests**: unit (contrato) · **Gate**: build
**Commit**: `feat(tailwind): publish a v4 CSS-first theme entry`

---

### T20: Tailwind v4-only — remover o preset e estreitar o peer

**What**: apagar o artefato v3 e mover o peer para `>=4`.
**Where**: `src/tailwind-preset.ts` (remover), `tailwind.config.ts` (remover), `tsup.config.ts`, `package.json`, `tests/package-contract.test.ts`, `tests/tailwind-config-contract.test.ts` (remover)
**Depends on**: T19
**Reuses**: —
**Requirement**: TW-04, TW-07

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `exports["./tailwind-preset"]`, o `typesVersions` correspondente, a entry do `tsup` e os dois arquivos sumiram
- [ ] `peerDependencies.tailwindcss` = `>=4`, seguindo opcional em `peerDependenciesMeta`
- [ ] `tests/tailwind-config-contract.test.ts` removido e a remoção **declarada no corpo do commit** como AD-012
- [ ] `grep -r "tailwind-preset"` fora de `node_modules`/`CHANGELOG` retorna zero
- [ ] Gate: `npm run build && npm run lint:package && npm run test:coverage`
- [ ] Test count: −18 testes (remoção intencional), suíte no total ainda crescendo

**Tests**: unit (contrato) · **Gate**: build
**Commit**: `feat(tailwind)!: require Tailwind v4 and drop the v3 preset`

---

### T21: Documentação

**What**: atualizar README e `docs/design-system.md`, e escrever a doc de migração `v2 → v3`.
**Where**: `README.md`, `docs/design-system.md`, `docs/migration-v2-to-v3.md` (novo), `DESIGN.md:243`
**Depends on**: T20
**Reuses**: estrutura de `docs/migration-v1-to-v2.md`
**Requirement**: TW-06, TW-08

**Tools**: MCP: NONE · Skill: `docs-writer`

**Done when**:
- [ ] README declara que **nenhum** componente exige Tailwind e descreve `tailwind.css` como conveniência do consumidor
- [ ] Nota de Tailwind não menciona mais o preset nem a faixa `>=3 <4`
- [ ] `docs/design-system.md` lista `Icon` e a família `AlertDialog` — e o cross-check de T16 prova que a lista é verdadeira
- [ ] `DESIGN.md:243` (parágrafo do preset) corrigido
- [ ] `docs/migration-v2-to-v3.md` cobre as duas quebras + o botão de fechar novo do `Dialog`
- [ ] Gate: `npm run test`
- [ ] Test count: sem mudança

**Tests**: unit (cross-check já em T16) · **Gate**: quick
**Commit**: `docs: document the v3 Tailwind requirement and the new components`

---

### T22: Stories do Storybook

**What**: story para `Icon` e para `AlertDialog`.
**Where**: `src/react/stories/Icon.stories.tsx`, `src/react/stories/AlertDialog.stories.tsx`
**Depends on**: T21
**Reuses**: padrão das 27 stories existentes
**Requirement**: — (cobertura de catálogo; stories são `none` na matriz)

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `Icon` exibe o set curado inteiro nos três tamanhos e com `label`
- [ ] `AlertDialog` demonstra confirmação destrutiva com `Action`/`Cancel`
- [ ] `npm run build-storybook` termina sem erro
- [ ] Gate: `npm run build && npm run lint:package && npm run test:coverage` + `npm run build-storybook`

**Tests**: none (excluídas da cobertura por config) · **Gate**: build
**Commit**: `docs(storybook): add Icon and AlertDialog stories`

---

### T23: Changesets

**What**: escrever os três changesets da rodada, no nível de bump correto.
**Where**: `.changeset/*.md`
**Depends on**: T22
**Reuses**: changesets da rodada 1 como modelo de redação para consumidor
**Requirement**: — (regra do `CLAUDE.md`)

**Tools**: MCP: NONE · Skill: NONE

**Done when**:
- [ ] `patch`: defeitos da família client (CSS morto, `shadow-*`, `aria-modal`, trigger em branco do `Select`)
- [ ] `minor`: `Icon`, família `AlertDialog`, `variant="accent"`, `Card` com `as`/`asChild`, `tailwind.css`
- [ ] `major`: peer `tailwindcss` `>=4`, remoção de `./tailwind-preset`, botão de fechar do `Dialog` por padrão
- [ ] Cada texto escrito para o consumidor da lib, não para o repo
- [ ] Gate: `npm run build && npm run lint:package && npm run test:coverage`

**Tests**: none · **Gate**: build
**Commit**: `chore(changeset): describe the round 2 release`

---

---

### T25: Dar `displayName` real aos membros derivados do Radix

**What**: substituir `X.displayName = XPrimitive.Y.displayName` (que hoje atribui `undefined`) por um nome literal.
**Where**: `src/components/ui/dialog.tsx`, `tabs.tsx`, `tooltip.tsx`, `select.tsx`, `dropdown-menu.tsx`, `alert-dialog.tsx`, testes correspondentes
**Depends on**: T14
**Requirement**: CLIENT-07 (torna o AC não-vacuoso)

**Por que existe**: achado do worker da Fase 3, verificado por grep nos `dist` — `@radix-ui/react-tabs`, `react-tooltip` e `react-dialog` **não declaram `displayName` em lugar nenhum**, então toda a família herda `undefined` e o React DevTools mostra `ForwardRef`. Não é regressão desta rodada; é lacuna que o CLIENT-07 escrito como "idêntico ao de hoje" não alcança.

**Done when**:
- [ ] Todo membro tem `displayName` literal igual ao nome do export
- [ ] Teste afirma o nome de cada membro das 6 famílias
- [ ] Gate: `npm run test && npm run typecheck`

**Tests**: unit · **Gate**: full
**Commit**: `fix(client): give every Radix-derived member a real displayName`

---

### T26: Resolver o `.sv-tabs` órfão

**What**: decidir entre emitir a classe ou remover a regra, e executar.
**Where**: `src/components/ui/tabs.tsx` e/ou `src/css/style.css`, `tests/client-css-contract.test.ts`
**Depends on**: T14
**Requirement**: CLIENT-02

**Por que existe**: achado do worker da Fase 3. `.sv-tabs` existe no CSS e **nenhum componente emite** — `Tabs` é re-export puro do `Root`. Pior: a regra é `display: flex; flex-direction: column` e, com `align-items` no default `stretch`, esticaria `.sv-tabs__list` para a largura toda, contradizendo o `display: inline-flex` do próprio list.

**Decisão**: emitir. `Tabs` vira `forwardRef` que aplica `sv-tabs` e mescla o `className` do consumidor, e a regra ganha `align-items: flex-start`. Assim o consumidor tem um container real para estilizar, que era a intenção da tabela de seções do design.

**Done when**:
- [ ] `Tabs` emite `sv-tabs` e mescla `className`
- [ ] `.sv-tabs` ganha `align-items: flex-start`
- [ ] Teste prova que o list **não** estica (asserção sobre a declaração, no contrato de CSS)
- [ ] `tests/ui-tabs.test.tsx` segue intacto
- [ ] Gate: `npm run test && npm run typecheck`

**Tests**: unit · **Gate**: full
**Commit**: `fix(tabs): emit the sv-tabs container class`

---

### ✅ T24: Corrigir a cascata do `prefers-reduced-motion` — `42e94a6`

**What**: mover as regras de `reduce` para a folha onde as classes são declaradas, para o override vencer a cascata.
**Where**: `src/css/style.css`, `src/css/theme.css`, `tests/reduced-motion-contract.test.ts` (novo), `tests/client-css-contract.test.ts`
**Depends on**: T5–T8
**Requirement**: CLIENT-03

**Por que existe**: levantada pelo worker da Fase 2 e confirmada por inspeção. `@media` não soma especificidade
e o README documenta a ordem `theme.css` → `style.css`, então todo `transition: none` que `theme.css` escrevia
para classe declarada em `style.css` perdia para a regra base. 8 classes afetadas, **5 já publicadas na v2**.

**Done when**:
- [x] Bloco de `reduce` das classes de `style.css` movido para o fim de `style.css`
- [x] `theme.css` mantém só `.sv-card-hover` e `.sv-skeleton`, que ele mesmo declara
- [x] Contrato afirma a **propriedade** (mesma folha, depois da base), não a lista de arquivos
- [x] `.sv-btn`, `.sv-badge`, `.sv-table__row`, `.sv-menu-item`, `.sv-tabs__trigger` entram na lista
- [x] Gate: `npm run test` — 971 passando, cobertura 100%

**Tests**: unit (contrato) · **Gate**: quick
**Commit**: `fix(css): make the reduced-motion overrides win the cascade`

## Parallel Execution Map

```
Fase 1 (Sequencial + par):
  T1 [P] ─┐
  T2 [P] ─┴─→ T3 ──→ T4

Fase 2 (Paralelo, depois de T4):
  ├── T5 [P]
  ├── T6 [P]
  ├── T7 [P]
  └── T8 [P]

Fase 3 (Paralelo):
  T5 → T9 [P]
  T8 → T10 [P]
  T6 → T11 [P]

Fase 4:
  T6,T7 → T12 [P] ─┐
  T6,T7 → T13 [P] ─┴→ T14   (T14 também espera T9, T10, T11)

Fase 5 (Sequencial):
  T9 → T15 → T16

Fase 6 (Paralelo):
  T14 → T17 [P]
  T14 → T18 [P]

Fase 7 (Sequencial):
  T14,T16,T17,T18 → T19 → T20 → T21 → T22 → T23
```

---

## Task Granularity Check

| Task | Escopo | Status |
| --- | --- | --- |
| T1 | 1 seção de CSS + contrato | ✅ |
| T2 | 1 dep + contrato | ✅ |
| T3 | 1 componente + 1 mapa de dados | ✅ coeso, mesmo conceito |
| T4 | 1 arquivo de teste | ✅ |
| T5–T8 | 1 seção de CSS cada | ✅ |
| T9–T11 | 1 componente cada | ✅ |
| T12–T13 | 1 componente cada | ✅ |
| T14 | 1 arquivo de teste | ✅ |
| T15 | 1 componente | ✅ |
| T16 | 1 barrel + 1 cross-check | ✅ coeso |
| T17 | 1 variante (CSS + union) | ✅ |
| T18 | 1 componente + 1 dep | ✅ coeso — a dep existe para essa prop |
| T19 | 1 arquivo CSS + export | ✅ |
| T20 | 1 remoção coordenada | ✅ coeso — remover metade quebra o build |
| T21 | documentação | ✅ |
| T22 | 2 stories | ⚠️ duas, mas mesma camada e sem teste — aceito |
| T23 | 3 changesets | ✅ coeso — é um ato de release |

---

## Diagram-Definition Cross-Check

| Task | Depends On (corpo) | Diagrama mostra | Status |
| --- | --- | --- | --- |
| T1 | None | raiz | ✅ |
| T2 | None | raiz | ✅ |
| T3 | T1, T2 | T1,T2 → T3 | ✅ |
| T4 | T3 | T3 → T4 | ✅ |
| T5 | T4 | T4 → T5 | ✅ |
| T6 | T4 | T4 → T6 | ✅ |
| T7 | T4 | T4 → T7 | ✅ |
| T8 | T4 | T4 → T8 | ✅ |
| T9 | T5 | T5 → T9 | ✅ |
| T10 | T8 | T8 → T10 | ✅ |
| T11 | T6 | T6 → T11 | ✅ |
| T12 | T6, T7 | T6,T7 → T12 | ✅ |
| T13 | T6, T7 | T6,T7 → T13 | ✅ |
| T14 | T9, T10, T11, T12, T13 | T9–T13 → T14 | ✅ |
| T15 | T9 | T9 → T15 | ✅ |
| T16 | T15 | T15 → T16 | ✅ |
| T17 | T14 | T14 → T17 | ✅ |
| T18 | T14 | T14 → T18 | ✅ |
| T19 | T14, T16, T17, T18 | → T19 | ✅ |
| T20 | T19 | T19 → T20 | ✅ |
| T21 | T20 | T20 → T21 | ✅ |
| T22 | T21 | T21 → T22 | ✅ |
| T23 | T22 | T22 → T23 | ✅ |

T12 e T13 são `[P]` entre si e não dependem um do outro. T17 e T18 idem. T5–T8 idem.

---

## Test Co-location Validation

| Task | Camada criada/modificada | Matriz exige | Task diz | Status |
| --- | --- | --- | --- | --- |
| T1 | CSS do sistema | unit (contrato) | unit (contrato) | ✅ |
| T2 | Manifesto | unit (contrato) | unit (contrato) | ✅ |
| T3 | Componente React + entry | unit | unit | ✅ |
| T4 | Entry/barrel (teste) | unit | unit | ✅ |
| T5 | CSS do sistema | unit (contrato) | unit (contrato) | ✅ |
| T6 | CSS do sistema | unit (contrato) | unit (contrato) | ✅ |
| T7 | CSS do sistema | unit (contrato) | unit (contrato) | ✅ |
| T8 | CSS do sistema | unit (contrato) | unit (contrato) | ✅ |
| T9 | Componente React | unit | unit | ✅ |
| T10 | Componente React | unit | unit | ✅ |
| T11 | Componente React | unit | unit | ✅ |
| T12 | Componente React | unit | unit | ✅ |
| T13 | Componente React | unit | unit | ✅ |
| T14 | Componente React (contrato transversal) | unit | unit | ✅ |
| T15 | Componente React | unit | unit | ✅ |
| T16 | Barrel + doc | unit | unit | ✅ |
| T17 | CSS + componente | unit | unit | ✅ |
| T18 | Componente + manifesto | unit | unit | ✅ |
| T19 | CSS publicado + manifesto | unit (contrato) | unit (contrato) | ✅ |
| T20 | Manifesto + build | unit (contrato) | unit (contrato) | ✅ |
| T21 | Documentação | unit (cross-check) | unit (cross-check, em T16) | ✅ |
| T22 | Stories | none | none | ✅ |
| T23 | Changesets | none | none | ✅ |

Nenhuma ❌. Nenhum `Tests: none` justificado por "testado em outra task".
