# Still Void Gaps — Round 4 Specification

## Problem Statement

`docs/BACKLOG-DESIGN-SYSTEM.md`-style intake do VittaFlow (`still-void-v3-migration`)
levantou 6 lacunas reais contra `@still-void/ui@3.1.0`, verificadas por leitura direta
da export line de `dist/react/index.d.ts` e `dist/react/client/index.d.ts`: quatro
componentes ausentes do catálogo (`Pagination`, `Progress`, `Separator`, primitivos de
gráfico), um gap de três `IconName`, e um defeito de i18n em `DialogContent`. Esta rodada
fecha as seis no lado da lib, seguindo `port, don't redesign`: nenhum valor de token é
inventado, tudo lê `var(--sv-*)` existente.

## Goals

- [ ] `Separator` — divisor genérico, server-safe, com `role="separator"` disponível.
- [ ] `Progress` — barra de progresso genérica (`value`/`max`), server-safe, distinta de `ReadingProgress`.
- [ ] `Pagination` — família composta (nav/lista/link/prev/next/ellipsis), server-safe.
- [ ] Primitivos de gráfico (`Chart*`) — container SVG + grid + eixo + linha + barra, tokens do sistema, server-safe. Sem motor de escalas de domínio (ver Assumptions).
- [ ] `IconName` ganha `camera`, `blocked`, `pending`.
- [ ] `DialogContent` ganha `closeLabel`, permitindo i18n do botão de fechar sem desabilitá-lo.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Motor de escala de dados (domain → pixel) nos primitivos de gráfico | Doc de origem já marca `data-chart` como o item mais específico do domínio clínico e o que menos generaliza — a lib fornece a geometria visual (grid/eixo/linha/barra sobre tokens), o consumidor mapeia PUSH/DET/dor para posição, exatamente como faz hoje |
| Paginação client-side com estado (página atual controlado internamente) | `Pagination` é composição de marcação (como `Table`), sem hook — estado de página é do consumidor, igual ao padrão já usado por `Tabs`/`Select` só que sem Radix aqui, porque não há necessidade de gerenciar foco/teclado além do que `<a>`/`<button>` nativos já dão |
| Tradução automática de `closeLabel` (i18n runtime) | Fora do escopo de um design system; a prop resolve o problema (permitir string custom), não decide a estratégia de i18n do consumidor |
| Migrar `ReadingProgress` para reusar `Progress` por baixo | `ReadingProgress` é client-only e orientado a scroll; `Progress` é server-safe e orientado a valor — unificar agora é escopo não pedido |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| `Separator` usa Radix (`@radix-ui/react-separator`) ou é hand-rolled | Hand-rolled (`forwardRef<HTMLDivElement>`) | Sem estado, sem gerenciamento de foco — só ARIA estática (`role`, `aria-orientation`). Evita nova dependência para o que uma `<div>` com 3 atributos resolve; mesmo padrão já usado por `Table`/`Badge`/`Alert` no catálogo server-safe | y |
| `Separator` decorative default | `decorative = true` (omite `role`), igual ao `Separator` do shadcn/ui upstream | Segue a prática WAI-ARIA (um divisor puramente visual não deve ser anunciado por padrão) e o padrão que qualquer dev que já usou shadcn reconhece. O call site do VittaFlow (divisor "ou" com sentido semântico) passa `decorative={false}` explicitamente para obter `role="separator"` — a lacuna documentada ("sem role=separator") é fechada pela prop existir, não pelo default forçar em todo divisor do catálogo | y |
| `Progress` usa Radix (`@radix-ui/react-progress`) ou é hand-rolled | Hand-rolled | Mesma razão do Separator: sem interatividade, ARIA estática (`role="progressbar"`, `aria-valuenow/min/max`) | y |
| `Progress` quando `value` é omitido | `value = 0` (nunca indeterminado) | Os três usos citados no gap (PUSH, DET, dor) sempre têm valor numérico conhecido no render; indeterminado é um estado que nenhum call site pede, YAGNI | y |
| Escopo dos primitivos de gráfico | `ChartContainer`, `ChartGrid`, `ChartAxis`, `ChartLine`, `ChartBar` — todos recebem geometria já calculada em pixels (`points`, `ticks`, `bars`), nenhum faz mapeamento domínio→pixel | O próprio doc de origem marca este item "baixa prioridade" e "o que menos se generaliza"; um motor de escala (D3-like) é território de app, não de design system. Os primitivos resolvem a parte genuinamente genérica: cor/traço/grade lendo `var(--sv-accent-ink)`/`var(--sv-info-ink)`/`var(--sv-warning-ink)`/`var(--sv-border)` em vez de SVG cru com hex — que é exatamente o que o `healing-chart.tsx` já faz manualmente hoje | y |
| `Pagination`, componentes de link recebem `href` ou `onClick`? | Ambos — `PaginationLink` renderiza `<a>` se `href` for passado, senão `<button>` | Paginação real usa `<a>` (SEO, navegação, botão direito "abrir em nova aba"); paginação client-side pura usa `onClick`. Suportar os dois sem forçar Radix/hook mantém o componente server-safe | y |
| `closeLabel` default | `'Close dialog'`, valor idêntico ao hardcoded atual | Preserva comportamento existente byte-a-byte quando a prop não é passada — zero regressão, `minor` bump (prop nova, opcional) | y |
| Nomes dos três `IconName` novos | `camera`, `blocked`, `pending` | Literais sugeridos pelo próprio doc de origem (`API sugerida`); heroicons correspondentes confirmados no pacote instalado: `CameraIcon`, `NoSymbolIcon`, `ClockIcon` (`@heroicons/react/24/outline`) | y |

**Open questions:** nenhuma — todas as decisões de design têm um default definido e justificado acima; nenhuma tem consequência irreversível que justifique parar para perguntar.

---

## User Stories

### P1: `IconName` ganha `camera`, `blocked`, `pending`

**User Story**: Como consumidor renderizando "fotos de pacientes aguardando triagem", "lote vencido" e "lote a vencer", quero usar `<Icon name="camera" | "blocked" | "pending" />` em vez de deixar glifos Unicode como texto, para ter o mesmo tratamento visual (cor, tamanho, tema) que todo outro ícone do catálogo.

**Why P1**: Menor risco, maior clareza de acessibilidade — glifo Unicode como texto não tem `aria-hidden`/`role` controlável e varia de fonte para fonte entre SOs.

**Acceptance Criteria**:

1. WHEN `<Icon name="camera" />`, `<Icon name="blocked" />`, `<Icon name="pending" />` são renderizados THEN cada um SHALL produzir um `<svg>` com geometria distinta dos outros 15 nomes já existentes.
2. WHEN `ICON_NAMES` é lido THEN SHALL conter os 18 nomes (15 antigos + 3 novos), cada um mapeando para um heroicon único (nenhum nome duplica geometria de outro).
3. WHEN um nome antigo é renderizado após a mudança THEN sua geometria SHALL permanecer idêntica à anterior (nenhuma regressão nos 15 existentes).

**Independent Test**: `ICON_NAMES.length === 18`; loop de geometria única já existe em `tests/ui-icon.test.tsx` e cobre os 3 novos automaticamente por iterar `ICON_NAMES`.

---

### P1: `DialogContent` ganha `closeLabel`

**User Story**: Como consumidor de uma UI pt-BR, quero passar `closeLabel="Fechar"` para o botão de fechar nativo do `DialogContent`, para não precisar desabilitá-lo (`showCloseButton={false}`) só por causa do texto hardcoded em inglês.

**Why P1**: Regressão de acessibilidade documentada (AD-015 do VittaFlow) — hoje a única saída é desligar o botão nativo inteiro.

**Acceptance Criteria**:

1. WHEN `DialogContent` é renderizado sem `closeLabel` THEN o nome acessível do botão de fechar SHALL continuar `"Close dialog"` (comportamento atual, zero regressão).
2. WHEN `DialogContent` é renderizado com `closeLabel="Fechar"` THEN o nome acessível do botão de fechar SHALL ser `"Fechar"`.
3. WHEN `showCloseButton={false}` e `closeLabel` são passados juntos THEN nenhum botão SHALL renderizar (showCloseButton continua tendo precedência sobre a existência do botão).

**Independent Test**: Renderizar com e sem `closeLabel`, buscar `getByRole('button', { name: ... })` com o texto esperado em cada caso.

---

### P1: `Separator`

**User Story**: Como consumidor com um divisor "ou" entre dois métodos de login, quero um componente `Separator` do catálogo com `role="separator"` real, para não manter um `<span>` sem semântica de acessibilidade.

**Why P1**: Call site real e simples (login), fecha uma lacuna de acessibilidade documentada.

**Acceptance Criteria**:

1. WHEN `<Separator />` é renderizado sem props THEN SHALL emitir um elemento com a classe `sv-separator`, orientação horizontal por padrão, e `decorative` `true` (sem `role`).
2. WHEN `<Separator decorative={false} />` é renderizado THEN SHALL expor `role="separator"` e `aria-orientation` ausente quando horizontal (default do ARIA já é horizontal) ou presente (`"vertical"`) quando `orientation="vertical"`.
3. WHEN `<Separator orientation="vertical" />` é renderizado THEN SHALL emitir a classe adicional `sv-separator--vertical`.
4. WHEN um `className` de consumidor é passado THEN SHALL ser mesclado com `sv-separator`, nunca substituí-lo.
5. WHEN a regra CSS `.sv-separator` é inspecionada THEN a cor SHALL vir de `var(--sv-border)` (mesmo hairline usado no resto do sistema), sem `box-shadow`.

**Independent Test**: Renderizar as 4 combinações de props, inspecionar `role`/`aria-orientation`/classList; ler `style.css` via contrato textual para a declaração de cor.

---

### P1: `Progress`

**User Story**: Como consumidor renderizando scores PUSH (0–17), DET (0–15) e escala de dor (0–10) hoje como SVG à mão, quero um `Progress` genérico com `value`/`max`, para ter uma barra de progresso real do catálogo em vez de recalcular geometria manualmente.

**Why P1**: Call site real (`healing-chart.tsx`), API pequena e bem definida (`value`/`max`, como o `<progress>` nativo do HTML).

**Acceptance Criteria**:

1. WHEN `<Progress value={9} max={17} />` é renderizado THEN a raiz SHALL ter `role="progressbar"`, `aria-valuenow="9"`, `aria-valuemin="0"`, `aria-valuemax="17"`.
2. WHEN `max` é omitido THEN SHALL assumir `100` (paridade com o elemento `<progress>` nativo).
3. WHEN `value` é omitido THEN SHALL assumir `0`.
4. WHEN `value` é renderizado THEN o indicador interno SHALL ter `width` igual a `(value / max) * 100%`, expresso via `style` inline (o único valor deste componente que não pode vir de um token — é dado em runtime).
5. WHEN um `className` de consumidor é passado THEN SHALL ser mesclado com `sv-progress` na raiz, nunca substituí-lo.
6. WHEN a regra CSS `.sv-progress` e `.sv-progress__indicator` são inspecionadas THEN a cor de preenchimento SHALL vir de `var(--sv-accent)` e a trilha de `var(--sv-surface-2)`, sem `box-shadow`.

**Independent Test**: Renderizar com valores variados de `value`/`max`, ler atributos ARIA e `style.width` do indicador; contrato CSS textual para as duas classes.

---

### P2: `Pagination`

**User Story**: Como consumidor com listas de auditoria e faturamento que crescem, quero uma família `Pagination` (`Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`) no catálogo, para não replicar o mesmo `Button variant="outline"` "Carregar mais" toda vez que a UI precisa de paginação numerada.

**Why P2**: Call site é um padrão único replicado (não múltiplos usos divergentes), e o workaround atual (botão "Carregar mais") já funciona — não bloqueia nada, mas limita o que a UI consegue expressar.

**Acceptance Criteria**:

1. WHEN `<Pagination>` é renderizado THEN a raiz SHALL ser um elemento `<nav>` com `aria-label="pagination"` e classe `sv-pagination`.
2. WHEN `<PaginationContent>` é renderizado dentro de `<Pagination>` THEN SHALL ser um `<ul>` com classe `sv-pagination__content`.
3. WHEN `<PaginationItem>` é renderizado THEN SHALL ser um `<li>` com classe `sv-pagination__item`.
4. WHEN `<PaginationLink href="/p/2">2</PaginationLink>` é renderizado THEN SHALL emitir um `<a href="/p/2">`; WHEN `<PaginationLink onClick={fn}>2</PaginationLink>` (sem `href`) THEN SHALL emitir um `<button type="button">`.
5. WHEN `<PaginationLink isActive>` é renderizado THEN SHALL ter `aria-current="page"` e a classe `sv-pagination__link--active`.
6. WHEN `<PaginationPrevious />` / `<PaginationNext />` são renderizados THEN SHALL renderizar um `PaginationLink` com ícone (`chevron-left`/`chevron-right`) e rótulo acessível ("Previous"/"Next" por padrão, sobrescrevível via prop de texto).
7. WHEN `<PaginationEllipsis />` é renderizado THEN SHALL ter `aria-hidden="true"` e um indicador visual ("…") sem ser um link focável.

**Independent Test**: Renderizar a composição completa com página ativa no meio de um range, inspecionar `href`/`aria-current`/`role` de cada membro.

---

### P3: Primitivos de gráfico (`Chart*`)

**User Story**: Como consumidor com um gráfico de 250 linhas desenhado à mão para scores clínicos, quero primitivos SVG (`ChartContainer`, `ChartGrid`, `ChartAxis`, `ChartLine`, `ChartBar`) que já leem os tokens do sistema, para não escrever `<svg>` cru com atributos de estilo hardcoded para grade/eixo/rótulos — as três séries (`--sv-accent-ink`/`--sv-info-ink`/`--sv-warning-ink`) o componente já usa corretamente hoje.

**Why P3**: O próprio doc de origem marca este item como baixa prioridade e o mais específico de domínio da lista inteira — fecha a lacuna genérica (visual) sem tentar portar lógica clínica (PUSH/DET/dor → pixel) para a lib.

**Acceptance Criteria**:

1. WHEN `<ChartContainer width={400} height={200}>` é renderizado THEN SHALL emitir um `<svg role="img" viewBox="0 0 400 200">` com classe `sv-chart`, aceitando `aria-label` opcional para nome acessível.
2. WHEN `<ChartGrid orientation="horizontal" positions={[0, 50, 100]} width={400} />` é renderizado dentro de `ChartContainer` THEN SHALL emitir uma `<line>` por posição, stroke `var(--sv-border)`, classe `sv-chart__grid-line`.
3. WHEN `<ChartAxis orientation="bottom" ticks={[{ position: 0, label: '0' }, { position: 100, label: '10' }]} length={400} />` é renderizado THEN SHALL emitir uma linha de base e um `<text>` por tick, fill `var(--sv-text-2)`, classe `sv-chart__axis`/`sv-chart__axis-label`.
4. WHEN `<ChartLine points={[{x:0,y:10},{x:50,y:5},{x:100,y:20}]} color="var(--sv-accent-ink)" />` é renderizado THEN SHALL emitir um `<polyline>` com `points` igual a `"0,10 50,5 100,20"`, `fill="none"`, `stroke` igual ao `color` passado, classe `sv-chart__line`.
5. WHEN `<ChartBar bars={[{x:0,y:10,width:20,height:30}]} color="var(--sv-info-ink)" />` é renderizado THEN SHALL emitir um `<rect>` por barra com as dimensões dadas, `fill` igual ao `color` passado, classe `sv-chart__bar`.
6. WHEN a regra CSS `.sv-chart` é inspecionada THEN SHALL ter `overflow: visible` (rótulos de eixo não são cortados) e nenhum `box-shadow`.

**Independent Test**: Renderizar cada primitivo isoladamente com dados de exemplo, inspecionar os elementos SVG filhos gerados (tag, atributos, contagem).

---

## Edge Cases

- WHEN `Progress` recebe `value` maior que `max` THEN o indicador SHALL ser clampado a `100%` (nunca ultrapassar a trilha) — sem lançar erro.
- WHEN `Progress` recebe `value` negativo THEN SHALL ser clampado a `0%`.
- WHEN `PaginationLink` recebe `href` **e** `onClick` juntos THEN SHALL renderizar `<a>` (href tem precedência) mas ainda disparar `onClick` — um link real navegável que também notifica o consumidor, o padrão usual de paginação client + prefetch.
- WHEN `ChartLine`/`ChartBar` recebem array vazio (`points: []` / `bars: []`) THEN SHALL renderizar o `<svg>`/grupo sem filhos, sem lançar erro.
- WHEN `Separator` é usado sem `orientation` dentro de um layout flex vertical (caso comum: divisor entre itens de uma lista) THEN o default horizontal já é o caso mais comum — nenhuma mudança de comportamento necessária além do que a spec já define.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| R4-01 | P1: IconName gaps | Execute | ✅ Verified |
| R4-02 | P1: DialogContent closeLabel | Execute | ✅ Verified |
| R4-03 | P1: Separator | Execute | ✅ Verified |
| R4-04 | P1: Progress | Execute | ✅ Verified |
| R4-05 | P2: Pagination | Execute | ✅ Verified |
| R4-06 | P3: Chart primitives | Execute | ✅ Verified |
