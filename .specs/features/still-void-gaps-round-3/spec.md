# Still Void Gaps — Round 3 Specification

## Problem Statement

Rodada 2 (`still-void-gaps-round-2`) fechou com dois achados reais da Fase 3, já definidos (Where/Done-when/Gate/Commit/Changeset) mas explicitamente fora do escopo executado: T25 (`displayName` `undefined` em 6 famílias derivadas do Radix) e T26 (classe `.sv-tabs` existe no CSS mas nenhum componente emite). Ambos são regressões de DX/correção, não bloqueiam nada em produção, mas ficaram como dívida rastreada. Esta rodada fecha os dois.

## Goals

- [x] Todo componente derivado do Radix (`Dialog`, `Tabs`, `Tooltip`, `Select`, `DropdownMenu`, `AlertDialog`) expõe `displayName` literal no React DevTools, em vez de herdar `undefined` do primitivo.
- [x] `Tabs` emite a classe `sv-tabs` no elemento raiz, dando ao consumidor um container real para estilizar; a regra CSS correspondente para de esticar `.sv-tabs__list` incorretamente.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Novos componentes ou props | Esta rodada só fecha os dois achados agendados da rodada 2, não expande catálogo |
| Mudança visual em qualquer família além de `Tabs` | T26 é a única correção com efeito CSS observável |
| Revisão de outros primitivos Radix não listados em T25 | Escopo travado nas 6 famílias já identificadas no grep da rodada 2 |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Valor de `displayName` por membro | Nome literal igual ao identificador do export (ex.: `TooltipContent.displayName = "TooltipContent"`) | Definição herdada de T25 na rodada 2; único valor sem ambiguidade — é o que o React DevTools já tentaria mostrar via inferência de nome de variável, agora garantido | y |
| Resolver `.sv-tabs` órfão: emitir vs. remover | Emitir — `Tabs` vira `forwardRef` que aplica `sv-tabs` e mescla `className`; CSS ganha `align-items: flex-start` | Decisão já tomada e documentada em T26 na rodada 2: a intenção de design (container real para a tabela de seções) é genuína, e `align-items: stretch` do default contradiz o `inline-flex` do próprio `__list` | y |
| `Tabs` continua re-exportável como antes ou vira componente novo | Vira `forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof TabsPrimitive.Root>>` (mesmo padrão dos outros membros da família) em vez de `const Tabs = TabsPrimitive.Root` puro | Único jeito de aplicar `className` mesclada sem quebrar a API pública (`Tabs` continua aceitando as mesmas props do `Root`) | y |

**Open questions:** none — todas resolvidas ou herdadas da decisão já registrada em T26/round-2.

---

## User Stories

### P1: `displayName` real em componentes derivados do Radix ⭐ MVP

**User Story**: Como consumidor do pacote depurando com React DevTools, quero ver o nome real de cada componente (`DialogOverlay`, `TabsList`, etc.) em vez de `ForwardRef`, para localizar o componente certo na árvore sem adivinhar.

**Why P1**: Achado real, já verificado por grep nos `dist` de `@radix-ui/react-tabs`, `react-tooltip` e `react-dialog` — esses pacotes não declaram `displayName`, então a atribuição atual (`X.displayName = XPrimitive.Y.displayName`) sempre resulta em `undefined`.

**Acceptance Criteria**:

1. WHEN o React DevTools inspeciona qualquer membro `forwardRef` das famílias `Dialog`, `Tabs`, `Tooltip`, `Select`, `DropdownMenu`, `AlertDialog` THEN o `displayName` exibido SHALL ser o nome literal do export (ex.: `"DialogOverlay"`, `"TabsList"`, `"SelectContent"`).
2. WHEN um teste lê `Componente.displayName` para qualquer membro das 6 famílias THEN o valor SHALL ser uma string igual ao identificador do export, nunca `undefined`.
3. WHEN os membros que já tinham `displayName` literal fixo (ex.: `DialogHeader`, `DialogFooter`, `AlertDialogHeader`, `AlertDialogFooter`, `DropdownMenuShortcut`) são revisados THEN o valor SHALL permanecer inalterado (nenhuma regressão nos que já estavam corretos).

**Independent Test**: Testar isoladamente — importar cada família, montar um membro qualquer, e afirmar `Componente.displayName === "NomeEsperado"` para todos os membros das 6 famílias.

---

### P1: `Tabs` emite `sv-tabs` no container raiz

**User Story**: Como consumidor do pacote estilizando uma tabela de seções com `Tabs`, quero que o componente aplique um container real (`sv-tabs`) e aceite `className` do jeito que os outros membros já aceitam, para não precisar embrulhar `Tabs` manualmente numa `div` extra.

**Why P1**: `.sv-tabs` já existe no CSS publicado (v3.0.0) mas nenhum componente o emite — é uma regra morta. Pior: com `align-items` no default (`stretch`), se algum consumidor aplicasse a classe manualmente, esticaria `.sv-tabs__list` para a largura toda, contradizendo o próprio `display: inline-flex` do `__list`.

**Acceptance Criteria**:

1. WHEN `Tabs` é renderizado sem `className` THEN o elemento raiz SHALL ter a classe `sv-tabs`.
2. WHEN `Tabs` é renderizado com `className="custom"` THEN o elemento raiz SHALL ter ambas as classes (`sv-tabs custom`), mesclagem via `cn`, igual ao padrão dos outros membros da família.
3. WHEN a regra `.sv-tabs` no CSS é inspecionada THEN ela SHALL declarar `align-items: flex-start` (não o `stretch` default), garantindo que `.sv-tabs__list` (que é `inline-flex`) nunca é esticado pelo pai.
4. WHEN `tests/ui-tabs.test.tsx` (suíte já existente) roda após a mudança THEN todos os testes SHALL continuar passando sem alteração de asserção sobre comportamento pré-existente.

**Independent Test**: Renderizar `<Tabs><TabsList>...</TabsList></Tabs>` com e sem `className`, inspecionar `classList` do nó raiz; separadamente, ler a regra CSS via contrato textual (`tests/client-css-contract.test.ts`) e afirmar `align-items: flex-start`.

---

## Edge Cases

- WHEN um consumidor já usava `ref` em `Tabs` (improvável, mas `Root` do Radix aceita) THEN o novo `forwardRef` SHALL continuar repassando o `ref` corretamente (`React.ElementRef<typeof TabsPrimitive.Root>`).
- WHEN um membro que já tinha `displayName` literal (não derivado do primitivo) é tocado por engano THEN o teste de regressão (AC P1-displayName #3) SHALL pegar qualquer mudança acidental de valor.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| R3-01 | P1: displayName real | Execute | ✅ Verified (commit `18d4660`) |
| R3-02 | P1: sv-tabs container | Execute | ✅ Verified (commit `64fa362`) |

**ID format:** `R3-NN` (Round 3, sequencial)

**Status values:** Pending → Implementing → Verified

**Coverage:** 2 total, 2 mapeados para tasks (herdadas de T25/T26 da rodada 2), 0 unmapped

---

## Success Criteria

- [x] `npm run test` verde com asserção de `displayName` para todos os membros das 6 famílias.
- [x] `npm run test` verde com asserção de `sv-tabs` emitido + `align-items: flex-start` no contrato CSS.
- [x] `npm run typecheck` verde.
- [x] Dois changesets `patch` (correção de AC vacuoso / classe órfã, sem mudança de comportamento visível para quem já usa a API atual).

---

*Escopo: Medium — feature clara, 2 tasks, sem ambiguidade (definição herdada literal de T25/T26 na rodada 2). Design e Tasks formais pulados; Execute lista os passos atômicos inline.*
