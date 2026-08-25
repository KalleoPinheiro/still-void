# Lacunas `@still-void/ui` — Rodada 2 · Especificação

- **Status:** aguardando confirmação do usuário
- **Data:** 2026-08-24
- **Origem:** [intake.md](intake.md) — GAP-02..GAP-08, escopo P0+P1 travado
- **Antecedente:** `.specs/features/form-and-data-primitives/` (rodada 1, Verifier PASS, 871 testes)

## Problem Statement

A rodada 1 migrou a família **server-safe** para CSS real `sv-*`, mas deixou os cinco componentes
**client** (`Dialog`, `DropdownMenu`, `Select`, `Tabs`, `Tooltip` — 5 arquivos, 498 linhas, 43 exports)
emitindo utilitárias Tailwind. Consequência verificada: essas classes referenciam cores que **não existem**
no config do pacote (`bg-background`, `ring-ring`, `ring-accent`, `ring-offset-background`), o `shadow-lg`
do `DialogContent` viola a Flat-By-Default Rule que o próprio README declara, e as classes de animação
(`animate-in`, `zoom-*`, `slide-*`) dependem de `tailwindcss-animate`, que **nunca foi instalado** — logo
já são inertes hoje. Um consumidor em Tailwind v4 renderiza os cinco sem cor nenhuma, silenciosamente e
sem erro de build.

Junto disso, três lacunas de catálogo com volume real no consumidor: `AlertDialog` é anunciado na doc e
pago em `dependencies` mas não existe em `src/`; `Button` não tem variante de accent (~20 call sites);
`Card` renderiza `<div>` fixo onde a semântica pede `<section>` ou `<li>` (9 call sites).

## Goals

- [ ] Zero classe utilitária Tailwind emitida por qualquer componente do pacote — o pacote inteiro passa a
      funcionar com **zero configuração de Tailwind** no consumidor
- [ ] Zero `box-shadow` e zero classe de cor inexistente na família client
- [ ] `docs/design-system.md` e o artefato publicado voltam a concordar (`AlertDialog` existe de verdade)
- [ ] Uma camada de ícones padronizada pelo design system, consumível de fora
- [ ] Consumidor em Tailwind v4 tem um caminho suportado e documentado (`@still-void/ui/tailwind.css`)

## Out of Scope

| Item | Motivo |
| --- | --- |
| `Separator`, `Progress` genérico, `Pagination` (GAP-09/10/11) | Catálogo P3; escopo P0+P1 travado com o usuário em 2026-08-23 |
| Variante `label` + input escondido do `FileInput` (GAP-01) | Abordagem decidida em **AD-008**; execução confirmada para a rodada 3 (2026-08-24) |
| `data-chart` (GAP-12) | Declarado permanentemente fora — primitivo de gráfico é feature própria |
| Migrar `ThemeToggle` / `CopyButton` para usar `Icon` | Hoje são texto puro e funcionam; troca é estética, não defeito. Rodada futura |
| Remover `@still-void/ui/tailwind-preset` | Remover export é **major**; o preset continua servindo consumidores v3 |
| Trocar o motor de portal/foco do Radix | Radix continua sendo o comportamento; esta rodada troca só a camada visual |
| Novos ícones desenhados à mão | O set curado vem do lucide-react; desenhar próprios é outra feature |

---

## Varredura de dimensões implícitas

| Dimensão | Resolução |
| --- | --- |
| Validação de entrada & limites | `variant`, `size`, `as` e `name` do `Icon` são unions fechadas em TS; valor fora da union cai no default em runtime (**ICON-05**, **CARD-04**) |
| Falha / falha parcial | N/A — biblioteca de renderização, sem I/O, rede ou persistência |
| Idempotência / retry / duplicidade | N/A — nenhuma operação com efeito colateral externo |
| Fronteiras de auth & rate limit | N/A — sem servidor, sem chamada autenticada |
| Concorrência / ordenação | Análogo real é ordem de cascata CSS: nenhuma regra nova pode usar `!important` nem depender de vir antes/depois do Tailwind do consumidor (**CLIENT-08**) |
| Ciclo de vida / expiração de dados | N/A — sem estado persistido |
| Observabilidade | `displayName` preservado em todo componente migrado ou novo — é o que o React DevTools mostra (**CLIENT-07**, **ALERT-05**) |
| Falha de dependência externa | `@radix-ui/react-slot` promovido a dep direta não pode introduzir boundary client no entry server-safe (**CARD-05**); `lucide-react` não pode quebrar tree-shaking nem o entry server-safe (**ICON-06**) |
| Integridade de transição de estado | `data-state=open|closed` do Radix dirige o CSS; toda regra de estado cobre os dois estados e respeita `prefers-reduced-motion` (**CLIENT-03**) |

---

## Assumptions & Open Questions

| Assunção / decisão | Default escolhido | Racional | Confirmado? |
| --- | --- | --- | --- |
| Animação de abrir/fechar da família client | Fade mínimo: `opacity` em `[data-state]`, `--sv-duration-fast` + `--sv-ease-hover`, desligado em `prefers-reduced-motion` | Decisão do usuário em 2026-08-24. Abrir/fechar carrega estado — DESIGN.md:192 permite motion nesse caso. Hoje nada anima (plugin ausente), então não há regressão | **y** |
| `lucide-react` entra como **dependência direta** | Dep direta + `Icon` com set curado exportado | Decisão do usuário em 2026-08-24, ciente do custo de 31 MB desempacotado. Objetivo declarado: padronizar o uso de ícones também nas aplicações consumidoras | **y** |
| Forma da API de ícones | Componente `Icon` (`name` + `size`) sobre classe `.sv-icon`, não re-export nomeado por ícone | Decisão do usuário em 2026-08-24. Mantém a superfície pública pequena e força o visual do sistema (currentColor, tamanho em token, stroke fixo) | **y** |
| Formato do `tailwind.css` | Só `@theme` mapeando `--color-sv-*`/fonte/espaçamento/radius para `var(--sv-*)`. Sem `@source`, sem os aliases `--color-background`/`ring`/`destructive` | Decisão do usuário em 2026-08-24. Depois da migração o `dist` não tem classe Tailwind para o `@source` varrer, e os quatro aliases existiam só por causa das classes que esta rodada elimina | **y** |
| `FileInput` fica fora da rodada | Rodada 3, abordagem já fixada em AD-008 | Decisão do usuário em 2026-08-24, resolvendo o conflito de escopo registrado no intake | **y** |
| Botão de fechar do `DialogContent` | Prop `showCloseButton`, **default `true`** | Paridade com o shadcn v4 e fecha a lacuna para quem não souber da prop. **Risco declarado:** adiciona um `<button>` ao DOM de quem já monta o seu — teste de consumidor que conte botões pode quebrar. `showCloseButton={false}` é a saída. Perguntado em 2026-08-24; o usuário respondeu sobre a lib de ícones e não sobre o default | **n** — confirmar |
| Faixa de peer do `tailwindcss` | Alargar de `>=3 <4` para `>=3` | O estreitamento foi feito na rodada 1 porque o preset é v3 e o v4 ignora `corePlugins`, reativando o Preflight. Com `tailwind.css` publicado o v4 passa a ter caminho suportado. Alargar peer não é breaking | **n** — implícito no GAP-02 |
| Indicadores visuais de `SelectItem` / `DropdownMenuCheckboxItem` / `DropdownMenuRadioItem` | Passam a renderizar ícone (check / ponto) | Hoje esses itens reservam `pl-8` para um indicador que **nunca é renderizado** — é defeito de layout, não escolha. A camada `Icon` desta rodada é o que torna a correção possível | **n** — implícito no GAP-06 |

**Open questions:** as três linhas marcadas `n` acima. Nenhuma bloqueia o Design — todas têm default escolhido
e rationale registrado; a confirmação do usuário pode inverter qualquer uma antes da execução.

---

## User Stories

### P1: Camada de ícones do design system ⭐ MVP

**User Story**: Como consumidor da biblioteca, quero um `Icon` padronizado pelo design system, para que
os ícones da minha aplicação sigam o mesmo tamanho, cor e traço dos ícones internos dos componentes.

**Why P1**: `DialogContent` (fechar), `SelectTrigger` (chevron), `SelectItem` (check) e os itens de
`DropdownMenu` (check / ponto) precisam de ícone para fechar GAP-07 e o defeito do `pl-8` órfão. A camada
vem antes por dependência técnica.

**Acceptance Criteria**:

1. WHEN o consumidor renderiza `<Icon name="x" />` THEN o sistema SHALL renderizar um `<svg>` com a classe
   `sv-icon`, `stroke="currentColor"` e `aria-hidden="true"`
2. WHEN o consumidor passa `size="sm" | "md" | "lg"` THEN o sistema SHALL aplicar `sv-icon--sm|--lg`
   (`md` é o default e não emite modificador), e o tamanho SHALL vir de `var(--sv-space-*)` — nunca de pixel literal
3. WHEN o consumidor passa `label="Fechar"` THEN o sistema SHALL trocar `aria-hidden` por `role="img"` +
   `aria-label`, tornando o ícone anunciável
4. WHEN `Icon` é importado de `@still-void/ui/react` THEN o import SHALL funcionar em Server Component —
   nenhum arquivo alcançável a partir dele contém `'use client'` ou hook do React
5. WHEN um `name` fora do set curado é passado em runtime THEN o sistema SHALL renderizar o ícone default
   sem lançar exceção (a union de TS já barra em tempo de compilação)
6. WHEN o bundle do consumidor é montado THEN cada ícone SHALL ser importado individualmente de
   `lucide-react` (import nomeado, nunca `import * as`), preservando tree-shaking

**Independent Test**: renderizar `<Icon name="check" size="lg" label="ok" />` isolado e conferir tag, classes,
`role`/`aria-label`; `tests/server-safety.test.ts` cobre o AC 4.

---

### P1: Família client estilizada por CSS `sv-*` ⭐ MVP

**User Story**: Como consumidor em Tailwind v3 ou v4, quero que `Dialog`, `DropdownMenu`, `Select`, `Tabs` e
`Tooltip` se estilizem sozinhos, para que não renderizem sem cor quando eu não configuro Tailwind contra os
tokens do Still Void.

**Why P1**: é o defeito que quebra o consumidor hoje, silenciosamente. Fecha GAP-06, GAP-07, GAP-08 e a causa do GAP-02.

**Acceptance Criteria**:

1. WHEN qualquer um dos cinco componentes é renderizado THEN o `className` emitido SHALL conter **apenas**
   classes `sv-*` — zero utilitária Tailwind, zero classe de cor inexistente (`bg-background`, `ring-ring`,
   `ring-accent`, `ring-offset-background`)
2. WHEN `style.css` é lido THEN a seção da família client SHALL declarar toda cor, espaçamento, raio e
   z-index por `var(--sv-*)` — nenhum literal hex, `px` ou número de camada solto
3. WHEN `[data-state="open"]` ou `[data-state="closed"]` está no elemento THEN o CSS SHALL definir a opacidade
   correspondente com transição de `--sv-duration-fast` e `--sv-ease-hover`, e dentro de
   `@media (prefers-reduced-motion: reduce)` SHALL zerar essa transição
4. WHEN `style.css` é lido THEN nenhuma regra da família client SHALL conter `box-shadow` com valor diferente
   de `none` — `DialogContent` perde o `shadow-lg`, `SelectContent` o `shadow-md`, `TabsTrigger` o `shadow-sm`
5. WHEN `DialogContent` é aberto THEN o elemento com `role="dialog"` SHALL expor `aria-modal="true"`
6. WHEN `DialogContent` é aberto com o default THEN o sistema SHALL renderizar um botão de fechar com
   `<Icon name="x" />` e texto `Close` em `sv-sr-only`, e clicar nele SHALL fechar o dialog; WHEN
   `showCloseButton={false}` THEN esse botão NÃO SHALL ser renderizado
7. WHEN qualquer componente migrado é inspecionado THEN seu `displayName` SHALL ser idêntico ao de hoje
8. WHEN `style.css` é lido THEN nenhuma regra nova SHALL usar `!important`, e nenhuma SHALL depender de
   `@layer` do Tailwind para vencer a cascata
9. WHEN `SelectItem` está selecionado THEN o sistema SHALL renderizar um `<Icon name="check" />` no espaço
   que hoje é reservado por padding e fica vazio; o mesmo SHALL valer para `DropdownMenuCheckboxItem` (check)
   e `DropdownMenuRadioItem` (ponto)
10. WHEN `SelectTrigger` é renderizado THEN o sistema SHALL renderizar `<Icon name="chevron-down" />`, e os
    botões de scroll SHALL renderizar `chevron-up`/`chevron-down`
11. WHEN qualquer elemento focável dos cinco recebe foco de teclado THEN o foco visível SHALL ser
    `outline: 2px solid var(--sv-accent-ink)` com `outline-offset: 2px` (AD-005) — nunca `ring-*`
12. WHEN os testes existentes (`ui-dialog`, `ui-select`, `ui-tabs`, `ui-tooltip`, `ui-dropdown-menu`) rodam
    THEN eles SHALL passar **sem edição** — teste existente que precise mudar é regressão de API: parar e reportar

**Independent Test**: abrir cada componente em RTL e afirmar as classes emitidas; `style.css` verificado
como texto no estilo de `tests/field-css-contract.test.ts`.

---

### P2: Família `AlertDialog` portada e exportada

**User Story**: Como consumidor, quero uma confirmação destrutiva acessível, para substituir `window.confirm`
em operações irreversíveis.

**Why P2**: 0 call sites hoje, mas a dependência já é paga e a doc já promete (AD-007). Não quebra ninguém.

**Acceptance Criteria**:

1. WHEN o consumidor importa de `@still-void/ui/react/client` THEN `AlertDialog`, `AlertDialogTrigger`,
   `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`,
   `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction` e `AlertDialogCancel` SHALL estar disponíveis
2. WHEN `AlertDialogContent` é aberto THEN o elemento SHALL ter `role="alertdialog"` e `aria-modal="true"`
3. WHEN `AlertDialogContent` é renderizado THEN ele SHALL emitir apenas classes `sv-*`, reutilizando o overlay
   e o frame do `Dialog` — sem duplicar bloco de CSS
4. WHEN `AlertDialogContent` é renderizado THEN NÃO SHALL haver botão de fechar em `X` — confirmação destrutiva
   se resolve por `Action`/`Cancel` explícitos
5. WHEN cada componente da família é inspecionado THEN SHALL ter `displayName` no padrão da família `Dialog`
6. WHEN `docs/design-system.md` é lido THEN a linha que anuncia a família `AlertDialog` SHALL ser verdadeira,
   e um teste SHALL cruzar a lista da doc contra os exports reais do barrel client

**Independent Test**: abrir um `AlertDialog`, confirmar `role="alertdialog"`, acionar `AlertDialogCancel` e ver fechar.

---

### P2: `Button variant="accent"`

**User Story**: Como consumidor, quero um botão preenchido com o accent do tema, para não passar `className`
com uma constante local em ~20 lugares.

**Why P2**: maior volume da lista, custo mínimo — `.sv-btn` já tem modificadores.

**Acceptance Criteria**:

1. WHEN `<Button variant="accent">` é renderizado THEN o `className` SHALL conter `sv-btn sv-btn--accent`
2. WHEN `style.css` é lido THEN `.sv-btn--accent` SHALL declarar `background: var(--sv-accent-ink)` e
   `color: var(--sv-bg)`, e o estado `:hover` SHALL derivar do mesmo token via `color-mix` — nunca um segundo hex
3. WHEN o tema alterna por `[data-theme]` ou `[data-accent]` THEN a cor do botão SHALL acompanhar sem
   configuração do consumidor
4. WHEN nenhuma `variant` é passada THEN o comportamento SHALL permanecer idêntico ao de hoje (`default`)

**Independent Test**: renderizar as 7 variantes e afirmar a classe de cada uma; contraste conferido em `tests/contrast.test.ts`.

---

### P2: `Card` com `as` e `asChild`

**User Story**: Como consumidor, quero renderizar um `Card` como `<section>`, `<li>` ou como o meu próprio
componente, para não perder a semântica do documento ao usar a superfície visual.

**Why P2**: 9 call sites em 6 arquivos; hoje usar `Card` dentro de `<ul>` produz HTML inválido.

**Acceptance Criteria**:

1. WHEN `<Card as="section">` é renderizado THEN a tag emitida SHALL ser `<section>` mantendo a classe `sv-card`
2. WHEN nenhuma prop de elemento é passada THEN a tag emitida SHALL continuar sendo `<div>`
3. WHEN `<Card asChild>` envolve um único filho THEN o sistema SHALL fundir classes, `ref` e props no filho,
   sem renderizar wrapper adicional
4. WHEN `as` e `asChild` são passados juntos THEN `asChild` SHALL vencer e `as` SHALL ser ignorado (AD-006)
5. WHEN `@radix-ui/react-slot` vira dependência direta THEN `@still-void/ui/react` SHALL continuar server-safe —
   `tests/server-safety.test.ts` prova que nada alcançável dali tem `'use client'` ou hook
6. WHEN um valor fora da union de `as` é forçado em runtime THEN o sistema SHALL renderizar `<div>` sem lançar

**Independent Test**: renderizar `Card` nas quatro formas (default, `as`, `asChild`, ambos) e afirmar a tag resultante.

---

### P2: `@still-void/ui/tailwind.css` para consumidores v4

**User Story**: Como consumidor em Tailwind v4, quero um `@import` único que me dê os tokens do Still Void
como utilitárias no meu próprio código, sem escrever o bloco `@theme` à mão.

**Why P2**: depois da migração o pacote não precisa mais de Tailwind para se estilizar — este arquivo passa a
servir o código **do consumidor**, não o do pacote. Por isso vem por último.

**Acceptance Criteria**:

1. WHEN o consumidor faz `@import "@still-void/ui/tailwind.css"` THEN `bg-sv-surface`, `text-sv-text`,
   `border-sv-border` e as demais utilitárias de token SHALL resolver para `var(--sv-*)`
2. WHEN `tailwind.css` é lido THEN ele SHALL conter um bloco `@theme` cujos valores são **todos**
   `var(--sv-*)`, e NÃO SHALL conter `@source` nem os aliases `--color-background`, `--color-ring`,
   `--color-destructive`, `--color-destructive-foreground`
3. WHEN `package.json` é lido THEN `exports["./tailwind.css"]` SHALL apontar para `./dist/tailwind.css` e
   `scripts/copy-css.mjs` SHALL copiá-lo — no padrão já verificado por `tests/package-contract.test.ts`
4. WHEN `package.json` é lido THEN `peerDependencies.tailwindcss` SHALL ser `>=3` e continuar **opcional**
5. WHEN `tailwind.css` é lido THEN cada chave `--color-sv-*` SHALL ter um token correspondente em `theme.css`
   (paridade verificada em teste, no estilo de `tests/tokenParity.test.ts`)
6. WHEN o README é lido THEN a nota sobre Tailwind SHALL declarar que **nenhum** componente exige Tailwind e
   descrever `tailwind.css` (v4) e `tailwind-preset` (v3) como conveniências para o código do consumidor

**Independent Test**: ler `dist/tailwind.css` após o build e cruzar cada `--color-sv-*` com `theme.css`.

---

## Edge Cases

- WHEN `prefers-reduced-motion: reduce` está ativo THEN abrir/fechar SHALL ser instantâneo, sem transição residual
- WHEN dois `Dialog` são abertos em sequência THEN o z-index SHALL vir de `--sv-z-modal`/`--sv-z-backdrop`,
  nunca de `z-50` literal, e o `Tooltip` SHALL ficar acima (`--sv-z-tooltip`)
- WHEN `Icon` recebe `className` THEN a classe do consumidor SHALL somar-se a `sv-icon`, não substituí-la
- WHEN `Card asChild` recebe mais de um filho THEN o comportamento SHALL ser o do `Slot` do Radix (erro explícito),
  não um wrapper silencioso
- WHEN `SelectContent` é renderizado com `position="item-aligned"` THEN o CSS SHALL continuar válido —
  as regras de `popper` são condicionais, não obrigatórias
- WHEN o consumidor não instala Tailwind THEN os 43 exports client SHALL renderizar corretamente estilizados
- WHEN `AlertDialogAction` é acionado THEN o dialog SHALL fechar (comportamento do Radix preservado)
- WHEN `style.css` cresce THEN a seção nova SHALL usar o mesmo marcador `/* ---------- Nome ---------- */`
  que os testes de contrato fatiam

---

## Requirement Traceability

| Requirement ID | Story | Fase | Status |
| --- | --- | --- | --- |
| ICON-01 | P1: Ícones — `<svg class="sv-icon">`, `currentColor`, `aria-hidden` | Design | Pending |
| ICON-02 | P1: Ícones — `size` em tokens, `md` sem modificador | Design | Pending |
| ICON-03 | P1: Ícones — `label` troca para `role="img"` + `aria-label` | Design | Pending |
| ICON-04 | P1: Ícones — server-safe em `@still-void/ui/react` | Design | Pending |
| ICON-05 | P1: Ícones — `name` inválido cai no default sem lançar | Design | Pending |
| ICON-06 | P1: Ícones — imports nomeados do lucide, tree-shaking preservado | Design | Pending |
| CLIENT-01 | P1: Família client — só classes `sv-*` emitidas | Design | Pending |
| CLIENT-02 | P1: Família client — todo valor por `var(--sv-*)` | Design | Pending |
| CLIENT-03 | P1: Família client — `[data-state]` + fade + reduced-motion | Design | Pending |
| CLIENT-04 | P1: Família client — zero `box-shadow` | Design | Pending |
| CLIENT-05 | P1: Família client — `aria-modal="true"` no `DialogContent` | Design | Pending |
| CLIENT-06 | P1: Família client — botão de fechar com `showCloseButton` | Design | Pending |
| CLIENT-07 | P1: Família client — `displayName` preservado | Design | Pending |
| CLIENT-08 | P1: Família client — sem `!important`, sem dependência de `@layer` | Design | Pending |
| CLIENT-09 | P1: Família client — indicadores de item renderizados | Design | Pending |
| CLIENT-10 | P1: Família client — chevrons de `Select` | Design | Pending |
| CLIENT-11 | P1: Família client — foco por `outline` (AD-005) | Design | Pending |
| CLIENT-12 | P1: Família client — testes existentes passam sem edição | Design | Pending |
| ALERT-01 | P2: `AlertDialog` — 11 exports no barrel client | Design | Pending |
| ALERT-02 | P2: `AlertDialog` — `role="alertdialog"` + `aria-modal` | Design | Pending |
| ALERT-03 | P2: `AlertDialog` — reutiliza CSS do `Dialog` | Design | Pending |
| ALERT-04 | P2: `AlertDialog` — sem botão de fechar em `X` | Design | Pending |
| ALERT-05 | P2: `AlertDialog` — `displayName` no padrão da família | Design | Pending |
| ALERT-06 | P2: `AlertDialog` — doc cruzada com os exports reais | Design | Pending |
| BTN-01 | P2: `variant="accent"` — classe emitida | Design | Pending |
| BTN-02 | P2: `variant="accent"` — CSS por token, hover por `color-mix` | Design | Pending |
| BTN-03 | P2: `variant="accent"` — acompanha `[data-theme]`/`[data-accent]` | Design | Pending |
| BTN-04 | P2: `variant="accent"` — default inalterado | Design | Pending |
| CARD-01 | P2: `Card` — `as` troca a tag | Design | Pending |
| CARD-02 | P2: `Card` — default continua `<div>` | Design | Pending |
| CARD-03 | P2: `Card` — `asChild` funde no filho | Design | Pending |
| CARD-04 | P2: `Card` — `asChild` vence `as` (AD-006) | Design | Pending |
| CARD-05 | P2: `Card` — entry server-safe preservado | Design | Pending |
| CARD-06 | P2: `Card` — `as` inválido cai em `<div>` | Design | Pending |
| TW-01 | P2: `tailwind.css` — utilitárias resolvem para `var(--sv-*)` | Design | Pending |
| TW-02 | P2: `tailwind.css` — `@theme` sem `@source` e sem aliases mortos | Design | Pending |
| TW-03 | P2: `tailwind.css` — export + cópia para `dist` | Design | Pending |
| TW-04 | P2: `tailwind.css` — peer `tailwindcss` `>=3`, opcional | Design | Pending |
| TW-05 | P2: `tailwind.css` — paridade de tokens com `theme.css` | Design | Pending |
| TW-06 | P2: `tailwind.css` — README atualizado | Design | Pending |

**ID format:** `[CATEGORIA]-[NÚMERO]`
**Status:** Pending → In Design → In Tasks → Implementing → Verified
**Coverage:** 40 requisitos, 0 mapeados para tasks, 40 não mapeados ⚠️ (normal antes da fase Tasks)

---

## Success Criteria

- [ ] `grep` por utilitária Tailwind em `src/components/ui/` retorna **zero** ocorrência
- [ ] `grep` por `bg-background|ring-ring|ring-accent|ring-offset-background|shadow-(lg|md|sm)` em `src/` retorna zero
- [ ] Os 5 arquivos de teste client existentes passam **sem uma linha editada**
- [ ] Suíte verde e cobertura mantida no patamar da rodada 1 (100% de statements nas linhas tocadas)
- [ ] `npm run lint:package` (publint + attw) verde com o subpath `./tailwind.css` novo
- [ ] `npm run build` produz `dist/tailwind.css`
- [ ] Consumidor sem Tailwind nenhum renderiza os 43 exports client com cor correta nos dois temas
- [ ] Changesets separados: `patch` para os defeitos (família client), `minor` para o catálogo novo
      (`Icon`, `AlertDialog`, `variant="accent"`, `Card as/asChild`, `tailwind.css`)
