# Rodada 4 — Tasks

**Design**: [design.md](design.md)
**Status**: Pending

## Test Coverage Matrix

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Componente React novo (`separator.tsx`, `progress.tsx`, `pagination.tsx`, `chart.tsx`) | unit (RTL) | Todos os branches; 1:1 com ACs da spec | `tests/ui-*.test.tsx` | `npm run test` |
| Componente existente tocado (`icon-set.ts`, `dialog.tsx`) | unit (RTL) | Regressão zero nos 15 ícones/comportamento atual; novo comportamento coberto | `tests/ui-icon.test.tsx` (sem mudança, cobre por loop), `tests/ui-dialog-behavior.test.tsx` (+casos) | `npm run test` |
| CSS novo (`style.css`, 4 seções) | unit (contrato textual) | Toda regra prometida existe; cor vem de `var(--sv-*)`; nenhum `box-shadow` | `tests/ui-*-css-contract.test.ts` | `npm run test` |
| Entry (`react/index.ts`) | unit | Todo export novo resolve; grafo server-safe intacto | `tests/server-safety.test.ts` (existente, sem edição — cobre por grafo) | `npm run test` |
| Manifesto/build | — | 100% coverage threshold do `vitest.config.ts` | — | `npm run test:coverage`, `npm run typecheck`, `npm run lint:package` |

Threshold: 100% lines/branches/functions/statements (`vitest.config.ts`), gate de CI.

## Gate Check Commands

| Gate | Quando | Comando |
| --- | --- | --- |
| Quick | task sem arquivo de teste novo | `npm run test` |
| Full | task que cria teste novo ou muda tipo público | `npm run test && npm run typecheck` |
| Build | fim de fase / toca CSS publicado ou manifesto | `npm run build && npm run lint:package && npm run test:coverage` |

---

## Execution Plan

Sequencial — sem dependência cruzada entre tasks, mas cada uma é um commit atômico próprio (changeset incluso).

### T1 — `IconName`: `camera`, `blocked`, `pending` (R4-01)
**Where**: `src/components/ui/icon-set.ts`
**Do**: importar `CameraIcon`, `NoSymbolIcon`, `ClockIcon` de `@heroicons/react/24/outline`; adicionar aos union `IconName` e ao `Record` `ICON_GLYPHS`.
**Done-when**: `tests/ui-icon.test.tsx` passa sem edição (loop sobre `ICON_NAMES` cobre os 3 novos); `ICON_NAMES.length === 18`.
**Gate**: Quick.
**Commit**: `feat(icon): add camera, blocked, pending to IconName`
**Changeset**: minor.

### T2 — `DialogContent.closeLabel` (R4-02)
**Where**: `src/components/ui/dialog.tsx`
**Do**: `closeLabel?: string` em `DialogContentProps`, default `'Close dialog'`; usar no `<span className="sv-sr-only">{closeLabel}</span>`.
**Done-when**: casos novos em `tests/ui-dialog-behavior.test.tsx` (default preservado, override funciona) passam; suíte existente sem regressão.
**Gate**: Full.
**Commit**: `feat(dialog): add closeLabel prop for i18n of the close button`
**Changeset**: minor.

### T3 — `Separator` (R4-03)
**Where**: `src/components/ui/separator.tsx` (novo), `src/css/style.css` (+seção Separator), `src/react/index.ts` (+export), `tests/ui-separator.test.tsx` (novo).
**Do**: componente hand-rolled, `forwardRef<HTMLDivElement>`, props `orientation`/`decorative`/`className`.
**Done-when**: 5 ACs da spec (P1 Separator) cobertos.
**Gate**: Full.
**Commit**: `feat: add Separator component`
**Changeset**: minor.

### T4 — `Progress` (R4-04)
**Where**: `src/components/ui/progress.tsx` (novo), `src/css/style.css` (+seção Progress), `src/react/index.ts` (+export), `tests/ui-progress.test.tsx` (novo).
**Do**: componente hand-rolled, ARIA `progressbar`, clamp de `value`.
**Done-when**: 6 ACs + 2 edge cases (clamp) cobertos.
**Gate**: Full.
**Commit**: `feat: add Progress component`
**Changeset**: minor.

### T5 — `Pagination` family (R4-05)
**Where**: `src/components/ui/pagination.tsx` (novo, 7 membros), `src/css/style.css` (+seção Pagination), `src/react/index.ts` (+exports), `tests/ui-pagination.test.tsx` (novo).
**Do**: `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`.
**Done-when**: 7 ACs + edge case (href+onClick) cobertos.
**Gate**: Full.
**Commit**: `feat: add Pagination component family`
**Changeset**: minor.

### T6 — Chart primitives (R4-06)
**Where**: `src/components/ui/chart.tsx` (novo, 5 membros), `src/css/style.css` (+seção Chart), `src/react/index.ts` (+exports), `tests/ui-chart.test.tsx` (novo).
**Do**: `ChartContainer`, `ChartGrid`, `ChartAxis`, `ChartLine`, `ChartBar` — geometria pré-calculada, sem escala de domínio.
**Done-when**: 6 ACs + edge case (arrays vazios) cobertos.
**Gate**: Full.
**Commit**: `feat: add Chart primitives (ChartContainer, ChartGrid, ChartAxis, ChartLine, ChartBar)`
**Changeset**: minor.

### T7 — Build/lint/coverage final
**Where**: repo inteiro.
**Do**: `npm run build && npm run lint:package && npm run test:coverage && npm run typecheck`.
**Done-when**: tudo verde, 100% coverage mantido.
**Gate**: Build.
**Commit**: nenhum (verificação, sem mudança de código) — se algo precisar de fix, vira commit próprio.

---

## Requirement Traceability

| Requirement ID | Task | Status |
| --- | --- | --- |
| R4-01 | T1 | Pending |
| R4-02 | T2 | Pending |
| R4-03 | T3 | Pending |
| R4-04 | T4 | Pending |
| R4-05 | T5 | Pending |
| R4-06 | T6 | Pending |
