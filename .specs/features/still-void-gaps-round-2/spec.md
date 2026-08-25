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
- [ ] Superfície Tailwind do pacote é **v4-only**: peer `>=4`, preset v3 removido, sem config em formato v3
      sobrando no repo

## Out of Scope

| Item | Motivo |
| --- | --- |
| `Separator`, `Progress` genérico, `Pagination` (GAP-09/10/11) | Catálogo P3; escopo P0+P1 travado com o usuário em 2026-08-23 |
| Variante `label` + input escondido do `FileInput` (GAP-01) | Abordagem decidida em **AD-008**; execução confirmada para a rodada 3 (2026-08-24) |
| `data-chart` (GAP-12) | Declarado permanentemente fora — primitivo de gráfico é feature própria |
| Migrar `ThemeToggle` / `CopyButton` para usar `Icon` | Hoje são texto puro e funcionam; troca é estética, não defeito. Rodada futura |
| Suporte a Tailwind v3 no consumidor | Decisão do usuário em 2026-08-24 (**AD-012**): a lib e os consumidores ficam em v4+. O preset v3 sai junto |
| Compatibilidade retroativa da faixa de peer | Estreitar peer é **major** por definição; esta rodada assume o `v3.0.0` em vez de tentar servir as duas versões |
| Trocar o motor de portal/foco do Radix | Radix continua sendo o comportamento; esta rodada troca só a camada visual |
| Novos ícones desenhados à mão | O set curado vem do `@heroicons/react`; desenhar próprios é outra feature |
| Trocar de grade óptica por tamanho (20/solid, 16/solid) | O `Icon` usa `24/outline` como família única e escala por CSS; grade por tamanho é refinamento visual de outra rodada |

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
| Falha de dependência externa | O mecanismo de `asChild` do `Card` não pode introduzir boundary client no entry server-safe (**CARD-05** — resolvido com `Slot` vendorizado, ver AD-015); `@heroicons/react` não pode quebrar tree-shaking nem o entry server-safe (**ICON-06**), e o próprio teste de server-safety passa a cobrir terceiros (**ICON-07**) |
| Integridade de transição de estado | O atributo `data-state` do Radix (`open` ou `closed`) dirige o CSS; toda regra de estado cobre os dois valores e respeita `prefers-reduced-motion` (**CLIENT-03**) |

---

## Assumptions & Open Questions

| Assunção / decisão | Default escolhido | Racional | Confirmado? |
| --- | --- | --- | --- |
| Animação de abrir/fechar da família client | Fade mínimo: `opacity` em `[data-state]`, `--sv-duration-fast` + `--sv-ease-hover`, desligado em `prefers-reduced-motion` | Decisão do usuário em 2026-08-24. Abrir/fechar carrega estado — DESIGN.md:192 permite motion nesse caso. Hoje nada anima (plugin ausente), então não há regressão | **y** |
| Biblioteca de ícones | **`@heroicons/react`** como dependência direta (3,7 MB), com `Icon` expondo um set curado | Decisão do usuário em 2026-08-24, depois de o research reprovar o `lucide-react` (**AD-013** supersede o AD-010): a v1.34 marca `Icon.mjs`/`context.mjs` com `'use client'` e usa `useContext`, o que criaria boundary client no entry server-safe. Heroicons foi verificada por inspeção do tarball: zero `'use client'`, zero hook, `stroke="currentColor"`, `aria-hidden="true"` por padrão e **sem prop `size`** — tamanho obrigatoriamente por CSS, que é exatamente o ICON-02 | **y** |
| Forma da API de ícones | Componente `Icon` (`name` + `size`) sobre classe `.sv-icon`, não re-export nomeado por ícone | Decisão do usuário em 2026-08-24. Mantém a superfície pública pequena e força o visual do sistema (currentColor, tamanho em token, stroke fixo) | **y** |
| Formato do `tailwind.css` | Só `@theme` mapeando `--color-sv-*`/fonte/espaçamento/radius para `var(--sv-*)`. Sem `@source`, sem os aliases `--color-background`/`ring`/`destructive` | Decisão do usuário em 2026-08-24. Depois da migração o `dist` não tem classe Tailwind para o `@source` varrer, e os quatro aliases existiam só por causa das classes que esta rodada elimina | **y** |
| `FileInput` fica fora da rodada | Rodada 3, abordagem já fixada em AD-008 | Decisão do usuário em 2026-08-24, resolvendo o conflito de escopo registrado no intake | **y** |
| Botão de fechar do `DialogContent` | Prop `showCloseButton`, **default `true`** | Confirmado pelo usuário em 2026-08-24. Paridade com o shadcn v4 e fecha a lacuna para quem não souber da prop. O `<button>` extra no DOM é mudança de comportamento, mas a rodada já é `major` por AD-012, então entra avisada por semver. `showCloseButton={false}` é a saída | **y** |
| Faixa de peer do `tailwindcss` | **`>=4`**, seguindo opcional; `tailwind-preset` e `tailwind.config.ts` removidos | Decisão do usuário em 2026-08-24 (**AD-012**): lib e consumidores em v4+. Estreitar peer é `major`; o preset é formato v3 e o v4 ignora seu `corePlugins.preflight`, então mantê-lo sob peer v4 seria publicar uma armadilha | **y** |
| Indicadores de `SelectItem` / `DropdownMenuCheckboxItem` / `DropdownMenuRadioItem` | Ícone default renderizado, **substituível por prop `icon`** | Decisão do usuário em 2026-08-24: manter o espaço vazio não é aceitável, e o ícone default não pode ser camisa de força. Hoje esses itens reservam `pl-8` para um indicador que **nunca é renderizado** | **y** |

**Open questions:** nenhuma — todas resolvidas com o usuário em 2026-08-24 e registradas acima.

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
5. WHEN um `name` fora do set curado é passado em runtime THEN o sistema SHALL renderizar
   **`alert-circle`** (exportado como `ICON_FALLBACK_NAME`) sem lançar exceção — nome desconhecido é defeito
   de quem chama e deve parecer um. A union de TS já barra o caso em tempo de compilação
6. WHEN o bundle do consumidor é montado THEN cada ícone SHALL vir de import nomeado em
   `@heroicons/react/24/outline` (nunca `import * as`, nunca o barrel raiz), preservando tree-shaking
7. WHEN `tests/server-safety.test.ts` roda THEN ele SHALL cobrir também os **pacotes de terceiros**
   alcançáveis a partir do entry server-safe — hoje o walker só segue especificadores relativos, então uma
   dependência com `'use client'` passaria despercebida. É o buraco que quase deixou o `lucide-react` entrar

**Independent Test**: renderizar `<Icon name="check" size="lg" label="ok" />` isolado e conferir tag, classes,
`role`/`aria-label`; `tests/server-safety.test.ts` cobre o AC 4.

---

### P1: Família client estilizada por CSS `sv-*` ⭐ MVP

**User Story**: Como consumidor, quero que `Dialog`, `DropdownMenu`, `Select`, `Tabs` e
`Tooltip` se estilizem sozinhos, para que não renderizem sem cor quando eu não configuro Tailwind contra os
tokens do Still Void — independentemente de eu ter Tailwind instalado ou não (AD-012 fecha o suporte a v3
depois desta história; a migração em si não depende de versão de Tailwind nenhuma).

**Why P1**: é o defeito que quebra o consumidor hoje, silenciosamente. Fecha GAP-06, GAP-07, GAP-08 e a causa do GAP-02.

**Acceptance Criteria**:

1. WHEN qualquer um dos cinco componentes é renderizado THEN o `className` emitido SHALL conter **apenas**
   classes `sv-*` — zero utilitária Tailwind, zero classe de cor inexistente (`bg-background`, `ring-ring`,
   `ring-accent`, `ring-offset-background`)
2. WHEN `style.css` é lido THEN a seção da família client SHALL declarar toda cor, espaçamento, raio e
   z-index por `var(--sv-*)` — nenhum literal hex, `px` ou número de camada solto
3. WHEN `[data-state="open"]` ou `[data-state="closed"]` está no elemento THEN o CSS SHALL definir a opacidade
   correspondente com transição de `--sv-duration-fast` e `--sv-ease-hover`, e dentro de
   `@media (prefers-reduced-motion: reduce)` SHALL zerar essa transição — e a regra de `reduce` SHALL estar
   na **mesma folha** em que a classe é declarada, depois dela. `@media` não soma especificidade e
   `style.css` carrega depois de `theme.css`, então uma regra de `reduce` escrita na folha errada perde a
   cascata e nunca se aplica (defeito real: 5 classes shipparam assim na v2)
4. WHEN `style.css` é lido THEN nenhuma regra da família client SHALL conter `box-shadow` com valor diferente
   de `none` — `DialogContent` perde o `shadow-lg`, `SelectContent` o `shadow-md`, `TabsTrigger` o `shadow-sm`
5. WHEN `DialogContent` é aberto THEN o elemento com `role="dialog"` SHALL expor `aria-modal="true"`
6. WHEN `DialogContent` é aberto com o default THEN o sistema SHALL renderizar um botão de fechar com
   `<Icon name="x" />` e o texto **`Close dialog`** em `sv-sr-only`, e clicar nele SHALL fechar o dialog; WHEN
   `showCloseButton={false}` THEN esse botão NÃO SHALL ser renderizado.
   **Nota de precisão (2026-08-24):** a spec dizia `Close`, e isso colidiu com o próprio fixture de
   `tests/ui-dialog.test.tsx`, que renderiza `<DialogClose>Close</DialogClose>` e consulta por
   `getByText('Close')` — dois nós com o mesmo texto. A colisão **é** o risco declarado de ligar
   `showCloseButton` por padrão, e confirma que o bump `major` é o aviso certo. Resolvida alargando o rótulo,
   que de quebra dá um nome acessível mais descritivo quando o dialog tem mais de um controle de dispensa
7. WHEN qualquer componente migrado é inspecionado THEN seu `displayName` SHALL ser idêntico ao de hoje.
   **Achado (2026-08-24):** hoje esse valor é `undefined` para todo membro derivado do Radix — `react-tabs`,
   `react-tooltip` e `react-dialog` não declaram `displayName` em lugar nenhum do `dist`, então
   `TabsList.displayName = TabsPrimitive.List.displayName` atribui `undefined`. O AC fica vacuoso nesses
   componentes; dar nome de verdade é **T25**, fora do "idêntico ao de hoje" e por isso tratado à parte
8. WHEN `style.css` é lido THEN nenhuma regra nova SHALL usar `!important`, e nenhuma SHALL depender de
   `@layer` do Tailwind para vencer a cascata
9. WHEN `SelectItem` está selecionado THEN o sistema SHALL renderizar um `<Icon name="check" />` no espaço
   que hoje é reservado por padding e fica vazio; o mesmo SHALL valer para `DropdownMenuCheckboxItem` (check)
   e `DropdownMenuCheckboxItem` (check). O indicador do `DropdownMenuRadioItem` é um **círculo em CSS**
   (`.sv-menu__dot`), não um ícone — o set do heroicons não tem um ponto na grade certa
10. WHEN `SelectTrigger` é renderizado THEN o sistema SHALL renderizar `<Icon name="chevron-down" />`, e os
    botões de scroll SHALL renderizar `chevron-up`/`chevron-down`
11. WHEN qualquer elemento focável dos cinco recebe foco de teclado THEN o foco visível SHALL ser
    `outline: 2px solid var(--sv-accent-ink)` com `outline-offset: 2px` (AD-005) — nunca `ring-*`
12. WHEN os testes existentes (`ui-dialog`, `ui-select`, `ui-tabs`, `ui-tooltip`, `ui-dropdown-menu`) rodam
    THEN eles SHALL passar **sem edição** — teste existente que precise mudar é regressão de API: parar e reportar
13. WHEN `SelectItem` é renderizado THEN seus children SHALL ser envolvidos por `SelectPrimitive.ItemText`.
    **Defeito verificado na fonte do Radix:** `ItemText` faz `createPortal(children, context.valueNode)` e
    `SelectValue` sem `children` renderiza vazio quando há valor — hoje o trigger fica **em branco** depois
    que o usuário escolhe uma opção
14. WHEN o consumidor passa a prop `icon` em `SelectItem`, `SelectTrigger`, `DropdownMenuCheckboxItem`,
    `DropdownMenuRadioItem` ou `DropdownMenuSubTrigger` THEN o nó passado SHALL substituir o ícone default
    mantendo o mesmo slot de layout; WHEN `icon={null}` THEN nenhum indicador SHALL ser renderizado e o
    espaço reservado SHALL colapsar — o `pl-8` órfão não volta por outro caminho

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
4. WHEN `package.json` é lido THEN `peerDependencies.tailwindcss` SHALL ser `>=4` e continuar **opcional**,
   e `devDependencies.tailwindcss` SHALL permanecer em `^4`
5. WHEN `tailwind.css` é lido THEN cada chave `--color-sv-*` SHALL ter um token correspondente em `theme.css`
   (paridade verificada em teste, no estilo de `tests/tokenParity.test.ts`)
6. WHEN o README é lido THEN a nota sobre Tailwind SHALL declarar que **nenhum** componente exige Tailwind,
   descrever `tailwind.css` como conveniência para o código do consumidor e afirmar o requisito de v4+
7. WHEN o pacote publicado é inspecionado THEN `exports["./tailwind-preset"]`, o `typesVersions` do preset,
   `src/tailwind-preset.ts`, a entrada correspondente em `tsup.config.ts` e a raiz `tailwind.config.ts`
   SHALL ter sido removidos — nenhum artefato em formato v3 SHALL sobreviver no repo ou no `dist`
8. WHEN a documentação de migração é lida THEN `docs/migration-v2-to-v3.md` SHALL existir e documentar as duas
   quebras desta rodada: peer `tailwindcss` `>=4` e remoção do `./tailwind-preset`

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
- WHEN o consumidor passa `icon` E o item está desmarcado THEN o ícone customizado SHALL seguir a mesma regra
  de visibilidade do default (só aparece no estado marcado), não vazar para o estado neutro
- WHEN `tests/tailwind-config-contract.test.ts` e os blocos de preset em `tests/package-contract.test.ts`
  forem removidos THEN isso SHALL ser tratado como remoção **intencional** de API (AD-012), declarada no
  changeset `major` — é a única exceção à regra de que editar teste existente é regressão

---

## Requirement Traceability

| Requirement ID | Story | Fase | Status |
| --- | --- | --- | --- |
| ICON-01 | P1: Ícones — `<svg class="sv-icon">`, `currentColor`, `aria-hidden` | Execute | ✅ Verified |
| ICON-02 | P1: Ícones — `size` em tokens, `md` sem modificador | Execute | ✅ Verified |
| ICON-03 | P1: Ícones — `label` troca para `role="img"` + `aria-label` | Execute | ✅ Verified |
| ICON-04 | P1: Ícones — server-safe em `@still-void/ui/react` | Execute | ✅ Verified |
| ICON-05 | P1: Ícones — `name` inválido cai no default sem lançar | Execute | ✅ Verified |
| ICON-06 | P1: Ícones — imports nomeados de `@heroicons/react/24/outline`, tree-shaking preservado | Execute | ✅ Verified |
| ICON-07 | P1: Ícones — `server-safety` passa a cobrir dependências de terceiros | Execute | ✅ Verified |
| CLIENT-01 | P1: Família client — só classes `sv-*` emitidas | Execute | ✅ Verified |
| CLIENT-02 | P1: Família client — todo valor por `var(--sv-*)` | Execute | ✅ Verified |
| CLIENT-03 | P1: Família client — `[data-state]` + fade + reduced-motion | Execute | ✅ Verified |
| CLIENT-04 | P1: Família client — zero `box-shadow` | Execute | ✅ Verified |
| CLIENT-05 | P1: Família client — `aria-modal="true"` no `DialogContent` | Execute | ✅ Verified |
| CLIENT-06 | P1: Família client — botão de fechar com `showCloseButton` | Execute | ✅ Verified |
| CLIENT-07 | P1: Família client — `displayName` preservado | Execute | ✅ Verified |
| CLIENT-08 | P1: Família client — sem `!important`, sem dependência de `@layer` | Execute | ✅ Verified |
| CLIENT-09 | P1: Família client — indicadores de item renderizados | Execute | ✅ Verified |
| CLIENT-10 | P1: Família client — chevrons de `Select` | Execute | ✅ Verified |
| CLIENT-11 | P1: Família client — foco por `outline` (AD-005) | Execute | ✅ Verified |
| CLIENT-12 | P1: Família client — testes existentes passam sem edição | Execute | ✅ Verified |
| CLIENT-13 | P1: Família client — `SelectItem` envolve children em `ItemText` (trigger em branco) | Execute | ✅ Verified |
| CLIENT-14 | P1: Família client — prop `icon` substitui o indicador default | Execute | ✅ Verified |
| ALERT-01 | P2: `AlertDialog` — 11 exports no barrel client | Execute | ✅ Verified |
| ALERT-02 | P2: `AlertDialog` — `role="alertdialog"` + `aria-modal` | Execute | ✅ Verified |
| ALERT-03 | P2: `AlertDialog` — reutiliza CSS do `Dialog` | Execute | ✅ Verified |
| ALERT-04 | P2: `AlertDialog` — sem botão de fechar em `X` | Execute | ✅ Verified |
| ALERT-05 | P2: `AlertDialog` — `displayName` no padrão da família | Execute | ✅ Verified |
| ALERT-06 | P2: `AlertDialog` — doc cruzada com os exports reais | Execute | ✅ Verified |
| BTN-01 | P2: `variant="accent"` — classe emitida | Execute | ✅ Verified |
| BTN-02 | P2: `variant="accent"` — CSS por token, hover por `color-mix` | Execute | ✅ Verified |
| BTN-03 | P2: `variant="accent"` — acompanha `[data-theme]`/`[data-accent]` | Execute | ✅ Verified |
| BTN-04 | P2: `variant="accent"` — default inalterado | Execute | ✅ Verified |
| CARD-01 | P2: `Card` — `as` troca a tag | Execute | ✅ Verified |
| CARD-02 | P2: `Card` — default continua `<div>` | Execute | ✅ Verified |
| CARD-03 | P2: `Card` — `asChild` funde no filho | Execute | ✅ Verified |
| CARD-04 | P2: `Card` — `asChild` vence `as` (AD-006) | Execute | ✅ Verified |
| CARD-05 | P2: `Card` — entry server-safe preservado | Execute | ✅ Verified |
| CARD-06 | P2: `Card` — `as` inválido cai em `<div>` | Execute | ✅ Verified |
| TW-01 | P2: `tailwind.css` — utilitárias resolvem para `var(--sv-*)` | Execute | ✅ Verified |
| TW-02 | P2: `tailwind.css` — `@theme` sem `@source` e sem aliases mortos | Execute | ✅ Verified |
| TW-03 | P2: `tailwind.css` — export + cópia para `dist` | Execute | ✅ Verified |
| TW-04 | P2: `tailwind.css` — peer `tailwindcss` `>=4`, opcional (AD-012) | Execute | ✅ Verified |
| TW-05 | P2: `tailwind.css` — paridade de tokens com `theme.css` | Execute | ✅ Verified |
| TW-06 | P2: `tailwind.css` — README atualizado, v4+ declarado | Execute | ✅ Verified |
| TW-07 | P2: `tailwind.css` — preset v3, entry do tsup e `tailwind.config.ts` removidos | Execute | ✅ Verified |
| TW-08 | P2: `tailwind.css` — `docs/migration-v2-to-v3.md` com as duas quebras | Execute | ✅ Verified |

**ID format:** `[CATEGORIA]-[NÚMERO]`
**Status:** Pending → In Design → In Tasks → Implementing → Verified
**Coverage:** 45 requisitos, 45 mapeados para as tasks T1–T23, 0 não mapeados

**Verificado**: Verifier independente PASS para os 45/45 (evidência `file:line` por requisito em `.specs/features/still-void-gaps-round-2/validation.md`, "Overall: ✅ Ready"). Mergeado em `main` via PR #12 (`c367631`, 2026-08-25). Esta tabela ficou marcada `Pending` desde o merge apesar do PASS já registrado — corrigido a pedido do usuário depois de achado durante o fechamento da PR #15.

---

## Success Criteria

- [ ] `grep` por utilitária Tailwind em `src/components/ui/` retorna **zero** ocorrência
- [ ] `grep` por `bg-background|ring-ring|ring-accent|ring-offset-background|shadow-(lg|md|sm)` em `src/` retorna zero
- [ ] Os 5 arquivos de teste client existentes passam **sem uma linha editada**
- [ ] Suíte verde e cobertura mantida no patamar da rodada 1 (100% de statements nas linhas tocadas)
- [ ] `npm run lint:package` (publint + attw) verde com o subpath `./tailwind.css` novo
- [ ] `npm run build` produz `dist/tailwind.css`
- [ ] Consumidor sem Tailwind nenhum renderiza os 43 exports client com cor correta nos dois temas
- [ ] `grep` por `tailwind-preset` no repo (fora de `node_modules` e do `CHANGELOG`) retorna zero
- [ ] Changesets separados: `patch` para os defeitos (família client), `minor` para o catálogo novo
      (`Icon`, `AlertDialog`, `variant="accent"`, `Card as/asChild`, `tailwind.css`) e **`major`** para as
      quebras do AD-012 (peer `tailwindcss` `>=4`, remoção do `./tailwind-preset`) — a rodada publica `v3.0.0`
