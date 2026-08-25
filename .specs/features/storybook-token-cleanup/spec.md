# Storybook Token Cleanup Specification

## Problem Statement

O critique de `/impeccable critique` em `.impeccable/critique/2026-08-25T17-23-10Z__src-react-stories.md` fechou com 5 achados residuais do detector mecânico (`design-system-color`, `design-system-font-size`, `design-system-radius`), todos em `src/react/stories/*.stories.tsx` — nenhum em componente shipado. Um é falso positivo (feature documentada sendo lida como drift); os outros quatro são valores literais fora da escala de tokens de DESIGN.md, todos em código de demonstração do Storybook, não em CSS publicado.

## Goals

- [ ] `node detect.mjs --json src/react/stories` retorna array vazio, exit code 0.
- [ ] O falso positivo (`CategoryPill.stories.tsx` `RawColor`) fica documentado como exceção no próprio arquivo, não "corrigido" — a feature que ele demonstra (passthrough de cor arbitrária) continua existindo e sendo demonstrada.
- [ ] Os 4 valores literais fora da escala (`Icon.stories.tsx`, `Select.stories.tsx`, `Tooltip.stories.tsx` ×2) passam a referenciar tokens reais de DESIGN.md.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Adicionar variante `size="sm"` real ao componente `Select` | `Select.stories.tsx`'s "Small" é uma demonstração de override via `style` no `SelectTrigger`, não uma prop do componente — DESIGN.md não documenta tamanhos para `Select`; criar a prop é uma feature nova, fora do escopo de uma limpeza de achados de detector |
| Revisar outros achados do critique (P0–P2 do relatório) | Já fechados em rodada anterior desta mesma conversa (harden, polish, adapt, document) |
| Mudar `detector.ignoreValues`/`ignoreFiles` em `.impeccable/config.json` | A exceção da `CategoryPill` é escopada a uma linha via comentário inline (`impeccable-disable-next-line`), não uma regra de projeto — mais preciso e autoexplicativo no próprio arquivo |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Como marcar o falso positivo da `CategoryPill` | Comentário inline `impeccable-disable-next-line design-system-color -- <razão>` na linha do `color: '#ff5566'` | `detect.mjs --help` documenta esse mecanismo como escopado à linha exata, viaja com o arquivo, e é o que o próprio relatório do critique pediu ("documented exception", não fix de config global) | y |
| Token para `Icon.stories.tsx:61` (legenda `0.6875rem`) | `var(--sv-text-xs)` (0.75rem) | Menor step real da escala tipográfica de DESIGN.md; a legenda é o menor texto da story, então é o step correto por função, não só o mais próximo numericamente | y |
| Token para `Select.stories.tsx:132` ("Small" trigger, `0.875rem`) | `var(--sv-text-sm)` (0.8125rem) | Equidistante entre `--sv-text-sm` (0.8125rem) e `--sv-text-base` (0.9375rem), mas a story existe especificamente para demonstrar um trigger *menor* que o default — `sm` é a direção semanticamente correta, `base` anularia o propósito da story | y |
| Token para `borderRadius: 3px` em `<kbd>` (`Tooltip.stories.tsx` ×2) | `var(--sv-radius-sm)` (6px) | Menor step real da escala de radius de DESIGN.md (6/8/12/16/9999px); não existe step menor para aproximar | y |

**Open questions:** none — todas resolvidas acima, sem necessidade de discussão com o usuário (decisões de qual token usar são de autoridade do design system, não de produto).

---

## User Stories

### P1: Falso positivo da `CategoryPill` fica documentado, não corrigido ⭐ MVP

**User Story**: Como mantenedor rodando o detector do impeccable, quero que o achado de `CategoryPill.stories.tsx:32` (`#ff5566`) pare de aparecer como drift, sem que a story pare de demonstrar a feature real (passthrough de cor arbitrária no prop `color`).

**Why P1**: É o achado mais enganoso dos 5 — sem a exceção documentada, qualquer scan futuro volta a listar como "possível drift" um comportamento que DESIGN.md já isenta explicitamente (One-Accent Rule: cores de `CategoryPill`/callout são fixas por significado, não pelo acento ativo).

**Acceptance Criteria**:

1. WHEN `node detect.mjs --json src/react/stories/CategoryPill.stories.tsx` roda THEN o achado `design-system-color` para a linha do `#ff5566` SHALL não aparecer no output.
2. WHEN o arquivo `CategoryPill.stories.tsx` é lido THEN a linha imediatamente anterior ao `color: '#ff5566'` SHALL conter um comentário `impeccable-disable-next-line design-system-color` com uma razão citando o passthrough documentado em `Content.tsx`.
3. WHEN a story `RawColor` é renderizada THEN o pill SHALL continuar exibindo a cor `#ff5566` exatamente como antes — nenhuma mudança de comportamento ou remoção da demonstração.

**Independent Test**: Rodar o detector isolado nesse arquivo antes e depois; comparar a contagem de achados (1 → 0) sem tocar em nenhum outro arquivo.

---

### P1: Valores literais fora da escala viram tokens reais

**User Story**: Como mantenedor do catálogo Storybook, quero que todo `fontSize`/`borderRadius` inline nas stories venha da escala de DESIGN.md, para que o catálogo pare de ensinar valores que não existem no design system.

**Why P1**: São os 4 achados restantes do detector (`design-system-font-size` ×2, `design-system-radius` ×2) — todos em código de demonstração, nenhum em CSS publicado, mas ainda assim modelando drift pra quem copia a story como referência.

**Acceptance Criteria**:

1. WHEN `Icon.stories.tsx` é lido THEN o `fontSize` da legenda de nome de ícone (linha ~61) SHALL ser `var(--sv-text-xs)`, não `0.6875rem`.
2. WHEN `Select.stories.tsx` é lido THEN o `fontSize` do `SelectTrigger` na story "Small" (linha ~132) SHALL ser `var(--sv-text-sm)`, não `0.875rem`.
3. WHEN `Tooltip.stories.tsx` é lido THEN o `borderRadius` de cada `<kbd>` na story `Keyboard` (linhas ~164 e ~168) SHALL ser `var(--sv-radius-sm)`, não `3px`.
4. WHEN `node detect.mjs --json src/react/stories` roda após as 3 mudanças acima THEN o array de achados SHALL estar vazio e o exit code SHALL ser `0`.
5. WHEN `npm run build-storybook` roda após as mudanças THEN o build SHALL completar sem erro (regressão visual não é testável por script nessas stories, mas quebra de build seria um sinal de erro de sintaxe).

**Independent Test**: Rodar o detector no diretório `src/react/stories` inteiro antes (5 achados) e depois (0 achados); rodar `build-storybook` pra confirmar que nenhuma sintaxe quebrou.

---

## Edge Cases

- WHEN o comentário `impeccable-disable-next-line` é lido pelo detector em modo `--no-config` THEN o achado SHALL voltar a aparecer — comportamento documentado do próprio detector, não um edge case a tratar no código.
- WHEN qualquer outro `RawColor`-like story for adicionado no futuro fora de `CategoryPill` THEN ele SHALL precisar da mesma justificativa explícita — este spec não abre uma exceção geral, só documenta a existente.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| SBC-01 | P1: Falso positivo documentado | Execute | ✅ Verified (commit `13fcce5`) |
| SBC-02 | P1: Tokens reais nas stories | Execute | ✅ Verified (commit `756c579`) |

**ID format:** `SBC-NN` (Storybook Cleanup, sequencial)

**Status values:** Pending → Implementing → Verified

**Coverage:** 2 total, 2 mapeados para tasks implícitas em Execute, 0 unmapped

---

## Success Criteria

- [x] `node detect.mjs --json src/react/stories` → `[]`, exit code `0`.
- [x] `npm run typecheck` verde.
- [x] `npm run build-storybook` verde.
- [x] Nenhuma mudança de comportamento visível na `CategoryPill` `RawColor` story (mesma cor renderizada).
- [x] 1 changeset (`patch`) — commit `218befc` (achado do Verifier: ficou de fora dos 2 commits iniciais, corrigido na hora).

**Verificado**: Verifier independente rodou PASS após o fix do changeset — 8/8 ACs com evidência `file:line`, 4/4 gates verdes, 2/2 mutantes mortos pelo sensor. Relatório: `.specs/features/storybook-token-cleanup/validation.md`.

---

*Escopo: Medium — feature clara, 2 tasks (uma por story, 4 arquivos ao todo), sem ambiguidade (decisões de token são de autoridade do design system). Design e Tasks formais pulados; Execute lista os passos atômicos inline. Dimensões implícitas (validação de input, falha parcial, auth, concorrência, etc.) não se aplicam — mudança é estática, sem estado, sem I/O.*
