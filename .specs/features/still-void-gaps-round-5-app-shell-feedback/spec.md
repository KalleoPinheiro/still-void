# Still Void Gaps — Rodada 5 (App Shell + Feedback) Specification

> **Nome da feature.** As rodadas 2–4 usam `still-void-gaps-round-N`. Esta mantém o prefixo
> e acrescenta um sufixo temático (`-app-shell-feedback`) porque, ao contrário das anteriores,
> as três lacunas desta rodada não são itens avulsos de catálogo: são uma família só —
> a casca de aplicação e o canal de feedback que um app admin precisa e um blog não.
> O sufixo é o que separa "rodada 5" de "rodada 5 de quê".

## Problem Statement

A auditoria de UX do VittaFlow (`docs/AUDITORIA-UX-2026-08.md`, 18 superfícies auditadas)
sobre `@still-void/ui@3.2.0` — com o gate `check:sv` verde, isto é, adoção de 100% do
catálogo — encontrou três capacidades ausentes que **pelo menos 4 telas cada** reimplementam
à mão, cada vez com uma anatomia ligeiramente diferente: navegação lateral responsiva
(11/18 telas), notificação transitória de resultado de operação (9/18) e alerta com
severidade semântica (9/18). Nenhuma das três é um "componente que falta" no sentido das
rodadas 2–4 (`Separator`, `Progress`, `Pagination`): são o mínimo que separa uma biblioteca
de blog de uma biblioteca que serve um app de gestão. Esta rodada fecha as três no lado da
lib, sem quebrar nenhum consumidor existente.

### Isto ainda é "port, don't redesign"?

Sim, e a mesma pergunta já foi respondida três vezes neste repo. `PRODUCT.md` fixa a
regra em **valores de token**: "Every token value (hex, oklch, easing, font family) is
literal from the Still Void spec. Rounding a color 'for elegance' ... is a regression."
A regra proíbe **inventar aparência**, não proíbe **crescer o catálogo** — `Chart*`,
`Pagination` e `Progress` (rodada 4), `AlertDialog` (rodada 3, AD-007) e `Icon` (AD-010/013)
também não existem no protótipo de blog e entraram como extensão deliberada.

O compromisso desta rodada com a regra é literal: **zero token novo**. Todo valor visual
sai de `var(--sv-*)` já publicado — `--sv-z-toast`, `--sv-danger-ink`, `--sv-success-ink`,
`--sv-info-ink`, `--sv-warning-ink`, a escala `--sv-space-*`, `--sv-duration-fast`,
`--sv-ease-hover`. A Flat-By-Default Rule (`DESIGN.md` §4) vale sem exceção: nenhum
`box-shadow` em drawer, viewport de toast ou alerta.

Um ponto de honestidade sobre a premissa do intake: `--sv-z-toast` **não** é um token órfão
"previsto e nunca usado" — `.sv-reading-progress` já o consome (`style.css:537`). O que ele
prova é mais fraco e ainda assim suficiente: a escala de z-index já nomeia a camada de toast,
então o Toast entra na camada que o sistema já reservou, em vez de inventar um número.

## Goals

- [ ] Uma casca de aplicação responsiva: painel lateral colapsável, com trigger client-side,
      foco preso e scroll-lock quando em modo drawer — **sem quebrar** o `Sidebar` de blog
      existente nem forçá-lo a virar client component.
- [ ] Um canal de feedback transitório: `ToastProvider` + `useToast()`, quatro severidades,
      anúncio assistivo correto por severidade, auto-dismiss, empilhamento, pausa em
      hover/foco e ação opcional.
- [ ] `Alert` com severidade semântica: `variant`, ícone padrão por variante, `role` derivado,
      e slot `action` — **com o comportamento atual preservado byte-a-byte** quando `variant`
      é omitido.
- [ ] A rodada inteira é **`minor`**: nenhum export, classe `sv-*` ou variável `--sv-*`
      removido ou renomeado; nenhuma faixa de peer estreitada.
- [ ] Threshold de cobertura de 100% (`vitest.config.ts`) mantido, `npm run lint:package` verde.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Alterar `Sidebar`/`SidebarSection` existentes (`src/react/components/Content.tsx`) | São o rail de TOC de artigo, server-safe, exportados de `@still-void/ui/react` e cobertos por `tests/react-components-2.test.tsx`. Dar-lhes estado os moveria para `/react/client` — remoção de export do entry server-safe, isto é, **major**. A rodada cria uma família nova que coexiste, exatamente o precedente do AD-003 (`NativeSelect` × `Select`) |
| `CalloutKind` ganhar `'danger'` | `Callout` é componente de prosa (`Article.tsx`), e `DESIGN.md` §5 declara suas três variantes como um vocabulário **editorial** fechado com hues nomeados (`note`=Signal Cyan, `warn`=Warm Amber, `aha`=Twilight Violet), deliberadamente desacoplado da paleta semântica de estado. Um quarto valor ou mistura os dois vocabulários ou duplica o que `Alert variant="danger"` passa a fazer nesta mesma rodada. Nenhum call site pediu — a auditoria pediu `Alert`, não `Callout`. Se um caso real de prosa aparecer, é um `minor` trivial depois (ver Assumptions) |
| Tokens `--sv-*-soft` (fundo tingido por severidade) | **Verificado: não existem em `theme.css`.** O sistema tem `--sv-danger/success/info/warning` e seus `-ink`; inventar um passo `-soft` seria escolha estética nova = `major` pelo CONTRIBUTING, e contraria a No-Approximation Rule. As variantes tingem borda/ícone/título sobre `var(--sv-surface)`, que é exatamente o tratamento que `.sv-callout--*` já usa |
| Rotas, `next/link` ou "item ativo" automático na sidebar | Roteamento é do consumidor. O painel expõe estrutura e estado aberto/fechado; `aria-current` continua sendo passado pelo consumidor, como já acontece em `Header`/`TableOfContents` |
| Persistência do estado aberto/fechado da sidebar (cookie/localStorage) | `ThemeProvider` tem `storageKey` porque tema é preferência de longo prazo; "sidebar aberta" é estado de sessão de uma viewport. `open`/`onOpenChange` (controlado) permitem ao consumidor persistir se quiser, sem a lib decidir o mecanismo |
| Toast disparado de fora da árvore React (singleton global tipo `sonner`) | Exige um store module-level, que é estado compartilhado entre árvores e quebra em SSR concorrente. `useToast()` dentro do provider cobre 100% dos call sites da auditoria (handlers de mutação) |
| Fila persistente / reentrega de toast após navegação | Notificação transitória é, por definição, transitória. Nada na auditoria pede replay |
| Primitivos de toast avulsos (`Toast`, `ToastTitle`, `ToastAction`…) exportados | Ver Assumptions — a API pública é imperativa (`useToast`), não composicional. Duas formas de fazer a mesma coisa é o anti-referência "kitchen-sink" do `PRODUCT.md` |

---

## Assumptions & Open Questions

Toda ambiguidade está resolvida ou registrada aqui. As decisões abaixo foram tomadas com
autorização explícita do usuário para escolhas técnicas de implementação; as que têm efeito
visível ao consumidor estão marcadas **[consumidor]** e resumidas ao fim.

| # | Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- | --- |
| A-01 **[consumidor]** | A sidebar de app é uma família **nova** ou uma extensão da existente? | Família nova, nomes distintos: `SidebarProvider`, `SidebarPanel`, `SidebarTrigger`, `SidebarInset`, `useSidebar` — em `@still-void/ui/react/client`. `Sidebar`/`SidebarSection` ficam como estão em `@still-void/ui/react` | Extensão = mover export server-safe para client = `major`. Coexistência é o precedente literal do AD-003. Os nomes escolhidos não colidem com nada exportado hoje (verificado contra a lista pinada em `tests/react-barrel.test.ts`); `SidebarPanel` em vez de `Sidebar` porque **dois componentes com o mesmo nome em subpaths diferentes** é pior que dois nomes parecidos — o consumidor que importa os dois entries não conseguiria distinguir no import | y |
| A-02 | `SidebarSection` (existente) serve de agrupador dentro de `SidebarPanel`? | Sim — nenhum componente de seção novo é criado | `SidebarSection` é `<section>` + `<h4 class="sv-sidebar__section-title">`, puro e server-safe; o rótulo uppercase serve grupo de nav admin tão bem quanto categoria de blog. Composição sobre configuração (`PRODUCT.md`), e menos superfície de API | y |
| A-03 | Estado da sidebar: provider com contexto, ou prop-drilling? | Provider (`SidebarProvider` + `useSidebar`), controlado **e** não-controlado (`open` / `defaultOpen` / `onOpenChange`) | `SidebarTrigger` costuma viver no `Header`, não dentro do painel — prop-drilling atravessaria a árvore inteira do consumidor. É a mesma forma do `ThemeProvider`/`useTheme` que já existe no client entry, então não é padrão novo no repo | y |
| A-04 **[consumidor]** | Como o breakpoint é decidido sem quebrar hidratação? | `SidebarProvider` recebe `breakpoint?: number` (px, default **1024**). A leitura usa `useSyncExternalStore` sobre `matchMedia`, com **server snapshot = desktop** | 1024 é o valor que o próprio sistema já usa para o rail (`@media (min-width: 1024px) .sv-layout--with-sidebar`, `style.css`) — port, não escolha nova. `useSyncExternalStore` é a API sancionada do React 18 para fonte externa com snapshot de servidor, e o peer já é `react >= 18`; escolher desktop como snapshot faz a primeira pintura ser o layout que não abre portal nenhum, então nada "pisca" em SSR | y |
| A-05 **[consumidor]** | Em `collapsible="icon"`, o que acontece abaixo do breakpoint? | Vira drawer off-canvas, como no modo `offcanvas` | Um rail de ícones ainda ocupa largura demais numa viewport de telefone; `icon` é uma decisão sobre o estado **colapsado no desktop**, não sobre o comportamento mobile. Mesma resolução que o shadcn/ui adota, e a única que não produz um layout quebrado | y |
| A-06 | `collapsible="none"` e o `SidebarTrigger` | O painel fica sempre expandido e `SidebarTrigger` renderiza `null` | Um botão que não faz nada é pior que botão nenhum: WCAG não gosta de controle inerte, e a alternativa (`disabled`) sugere "temporariamente indisponível". Renderizar `null` deixa o layout do header do consumidor correto sem `if` do lado dele | y |
| A-07 | Foco preso e scroll-lock no drawer | Vêm do `@radix-ui/react-dialog` **já instalado** (que traz `react-focus-scope`, `react-focus-guards`, `react-remove-scroll` e `aria-hidden` — todos verificados presentes em `node_modules`) | Reimplementar focus trap à mão é a categoria de código que a WCAG pune e que o repo já paga uma dependência para não escrever. Zero dependência nova, e o overlay reusa `.sv-overlay` que já existe | y |
| A-08 **[consumidor]** | Toast: primitivo Radix ou implementação própria? | **`@radix-ui/react-toast@^1.2.23` como dependência direta**, embrulhado por um `ToastProvider` próprio que possui a fila | Verificado por `npm pack` do tarball publicado: (1) **todas as 12 dependências transitivas já estão instaladas na versão exata exigida** (`react-portal@1.1.17`, `react-presence@1.1.10`, `react-collection@1.1.15`, `react-dismissable-layer@1.1.19`, `react-visually-hidden@1.2.11`, …) — o custo marginal de instalação é **um** pacote; (2) `dist/index.mjs` e `dist/index.js` carregam `'use client'`, logo é client-only por construção e **não pode** ser alcançado pelo walker do `server-safety.test.ts`, que é a armadilha que reprovou o `lucide-react` (AD-013) e o `Slot` do Radix (AD-015); (3) entrega a maquinaria de a11y que é cara de acertar — região `role="region"` com hotkey **F8**, ordem de anúncio, pausa em hover/foco/blur da janela, swipe-to-dismiss; (4) emite `data-state="open"|"closed"`, então o fade do AD-009 vale sem uma linha nova de regra. Sob threshold de 100% de cobertura, a versão à mão custaria **mais** teste, não menos | y |
| A-09 **[consumidor]** | Toast: `role="alert"` para severidades altas, como pedia o intake? | **Não é emitido — e não deve ser.** O Radix renderiza sempre `role="status"` no `<li>` e comuta `aria-live` (`assertive` para `type="foreground"`, `polite` para `"background"`). A lib mapeia `variant` → `type`: `danger`/`warning` → `foreground` (assertivo), `info`/`success` → `background` (polido) | **Fato verificado no dist, não suposição**: `index.mjs` contém literalmente `role: "status"` e `"aria-live": type === "foreground" ? "assertive" : "polite"`. A propriedade que a tecnologia assistiva observa — interromper a fala vs. enfileirar — é `aria-live`, e ela é preservada exatamente. Forçar `role="alert"` por cima exigiria lutar contra a arquitetura de região de anúncio do primitivo e produziria anúncio duplicado. As ACs são escritas contra `aria-live`, que é o comportamento real | y |
| A-10 **[consumidor]** | Superfície pública do Toast: imperativa ou composicional? | Imperativa: só `ToastProvider`, `useToast`, e os tipos. Os primitivos (`Toast`, `ToastTitle`, `ToastAction`…) ficam internos | Um toast nasce dentro de um handler de mutação, não de um render — "composição sobre configuração" é regra de **layout**, e forçá-la aqui produziria duas formas de fazer a mesma coisa, que é o anti-referência kitchen-sink do `PRODUCT.md`. Mesmo critério que a rodada 4 usou em `PaginationLink` (uma prop, dois casos reais, nenhuma terceira opção configurável sem call site) | y |
| A-11 | Formato da ação do toast | `action?: { label: ReactNode; altText: string; onClick: () => void }` — `altText` **obrigatório** | Não é escolha nossa: `ToastActionProps.altText` é `string` requerido no `.d.ts` do Radix, justamente para dar ao leitor de tela um caminho alternativo ("Undo (Alt+U)") quando navegar até o botão antes do auto-dismiss é inviável. Tipar como opcional seria esconder um requisito de a11y do consumidor | y |
| A-12 | Default de `duration` e de `max` (toasts simultâneos) | `duration` **5000 ms** (o default do próprio Radix, verificado: `duration = 5e3`), `max` **3** | `duration` herda o default do primitivo em vez de inventar um número — port, não redesign. `max: 3` porque o quarto toast simultâneo já é ilegível numa viewport de telefone; ao estourar, o **mais antigo** sai (FIFO), nunca o novo é descartado — descartar o novo perderia justamente a mensagem que acabou de ser causada por uma ação do usuário | y |
| A-13 **[consumidor]** | `Alert` sem `variant`: o que muda? | **Nada.** Continua neutro, continua com `role="alert"` hardcoded, continua sem ícone default | Hoje **todo** `Alert` sai com `role="alert"`. Derivar `role` da variante também no caso neutro mudaria o comportamento de consumidores que não pediram nada — regressão silenciosa, e defensavelmente `major`. Um `Alert` sem tipo é, por definição, algo que o autor quer que seja anunciado. Zero regressão mantém a rodada `minor` | y |
| A-14 **[consumidor]** | `role` derivado quando `variant` é passado | `danger`/`warning` → `role="alert"`; `info`/`success` → `role="status"`. O valor derivado **vence** um `role` vindo em props | É a prática WAI-ARIA (`alert` interrompe; `status` enfileira) e a única leitura que faz `variant` significar severidade de verdade. A precedência sobre props é a mesma garantia que `aria-modal` tem em `DialogContent` e `aria-label` em `Pagination` — achados de review das rodadas 3–4, agora aplicados por padrão | y |
| A-15 | Ícone default por variante | `info`→`info`, `success`→`check-circle`, `warning`→`alert-triangle`, `danger`→`alert-circle`; suprimível/substituível por `icon?: ReactNode \| null` | Os quatro nomes **já existem** em `IconName` (verificado em `icon-set.ts`) — nenhum ícone novo, nenhum bump de set. `null` (e não `false`) suprime, porque `false` é um `ReactNode` válido e a distinção "não passei" × "passei nada" ficaria ambígua | y |
| A-16 | Classes CSS da rodada | `.sv-app-sidebar*`, `.sv-toast*`, `.sv-alert--{info,success,warning,danger}` e `.sv-alert__action` | Prefixo `sv-app-sidebar` (não `sv-sidebar--app`) porque `.sv-sidebar` é o rail de blog e um modificador sugeriria herança de regras que não existe. Todas são **adições**; nenhuma classe publicada muda de significado, logo `minor` | y |
| A-17 | Recipes (`src/recipes/`) para as famílias novas | Nenhuma | A família client existente (`Dialog`, `Select`, `DropdownMenu`, `Tabs`, `Tooltip`) usa literais em `cn(...)`, não recipes — recipes existem para o que o consumidor compõe no servidor. Seguir o precedente também mantém a lista pinada em `tests/react-barrel.test.ts` intacta | y |
| A-18 | `useMediaQuery` / `createMediaQuery` viram API pública? | Sim — `createMediaQuery` em `src/behaviors/`, `useMediaQuery` em `src/react/client/hooks.ts` | É exatamente a forma que `scrollSpy`/`useScrollSpy` e `readingProgress`/`useReadingProgress` já têm neste repo (behavior puro + hook fino). Deixá-lo privado significaria que o consumidor que precisa do mesmo breakpoint no código dele reimplementa o `useSyncExternalStore` à mão — o problema que a rodada existe para resolver | y |
| A-19 | `CalloutKind` + `'danger'` — decisão registrada | **Fora desta rodada.** Se aparecer um call site real de prosa, é `minor` isolado depois | Ver Out of Scope. Registrado aqui para que a decisão seja rastreável em vez de "esquecida" | y |

**Open questions:** nenhuma — toda decisão acima tem default definido e justificado. As
marcadas **[consumidor]** (A-01, A-04, A-05, A-08, A-09, A-10, A-13, A-14) são as que o
usuário pode querer vetar **antes** da fase Execute; nenhuma delas é irreversível a ponto de
justificar parar o planejamento, porque todas são adições `minor` — a única com custo externo
real é **A-08 (dependência nova)**, e mesmo ela é reversível trocando o wrapper por
implementação própria sem mudar a API pública `ToastProvider`/`useToast`.

---

## User Stories

### Grupo A — App shell: sidebar responsiva

---

### P1: `useMediaQuery` — leitura de breakpoint segura em SSR ⭐ MVP

**User Story**: Como consumidor que renderiza em Server Components, quero ler um media query
no cliente sem provocar mismatch de hidratação, para que a casca do app decida "mobile ou
desktop" sem piscar nem emitir warning do React.

**Why P1**: Toda a família de sidebar depende disso. É a peça que faz um componente
responsivo com **uma única marcação** (regra do `DESIGN.md` §5: "there is exactly one Header
markup for both widths, never a duplicated mobile/desktop nav") ser possível sem duplicar
árvore.

**Acceptance Criteria**:

1. WHEN `createMediaQuery('(min-width: 1024px)')` é criado THEN SHALL expor `getSnapshot()`,
   `subscribe(listener)` e `destroy()`, e `subscribe` SHALL retornar uma função de unsubscribe.
2. WHEN o media query passa a casar THEN todo listener inscrito SHALL ser notificado exatamente
   uma vez por transição — nunca em toda mudança de viewport que não cruze o limiar.
3. WHEN `destroy()` é chamado THEN nenhum listener SHALL continuar inscrito no `MediaQueryList`
   (sem vazamento de listener após unmount).
4. WHEN `useMediaQuery(query)` é renderizado no servidor (sem `window`) THEN SHALL retornar
   `false` sem lançar.
5. WHEN `useMediaQuery(query)` hidrata no cliente THEN SHALL passar a refletir o valor real do
   `matchMedia` sem que o React emita aviso de mismatch de hidratação.
6. WHEN `window.matchMedia` é indefinido no ambiente THEN `createMediaQuery` SHALL retornar um
   controlador inerte (`getSnapshot() === false`, `subscribe` no-op) em vez de lançar.

**Independent Test**: Stub de `window.matchMedia` em `tests/setup.ts`; assert de snapshot,
notificação em transição, unsubscribe e caminho sem `matchMedia`.

---

### P1: Sidebar de aplicação — provider, painel e trigger ⭐ MVP

**User Story**: Como consumidor construindo a nav de um app admin, quero um painel lateral
que vira drawer off-canvas abaixo de um breakpoint — com foco preso, scroll travado e
fechamento por `Esc` — e um botão de menu que vive fora do painel, para não reimplementar
casca de aplicação em 11 telas.

**Why P1**: Maior alcance dos três gaps (11/18 telas) e o único que não tem workaround
aceitável: o que existe hoje no consumidor é um `<aside>` estático que simplesmente some
em telas pequenas.

**Acceptance Criteria**:

1. WHEN `<SidebarProvider>` envolve a árvore THEN `useSidebar()` SHALL expor
   `{ open, setOpen, toggle, isMobile, collapsible }`; WHEN `useSidebar()` é chamado fora do
   provider THEN SHALL lançar um erro nomeado (mesmo contrato de `useTheme`).
2. WHEN `<SidebarProvider defaultOpen={false}>` é renderizado THEN o estado inicial SHALL ser
   fechado; WHEN `open` e `onOpenChange` são passados THEN o componente SHALL ser controlado —
   nenhuma mudança interna de estado SHALL ocorrer sem que `onOpenChange` seja chamado.
3. WHEN a viewport está **acima** do breakpoint THEN `<SidebarPanel>` SHALL renderizar um
   `<aside class="sv-app-sidebar">` **no fluxo do documento** — sem portal, sem overlay, sem
   trapping de foco.
4. WHEN a viewport está **abaixo** do breakpoint e `open` é `true` THEN `<SidebarPanel>` SHALL
   renderizar em um portal como drawer, com `role="dialog"`, `aria-modal="true"`, foco movido
   para dentro do painel, foco preso enquanto aberto e scroll do `body` travado.
5. WHEN o drawer está aberto e `Escape` é pressionado THEN SHALL fechar e o foco SHALL voltar
   ao elemento que o abriu.
6. WHEN o drawer está aberto e o overlay é clicado THEN SHALL fechar.
7. WHEN `<SidebarTrigger>` é clicado THEN SHALL alternar `open` e SHALL expor
   `aria-expanded` refletindo o estado e `aria-controls` apontando para o id do painel.
8. WHEN `<SidebarTrigger>` é renderizado sem `children` THEN SHALL renderizar
   `<Icon name="menu" />` mais um nome acessível default (`"Toggle sidebar"`), sobrescrevível
   por prop.
9. WHEN `<SidebarPanel>` é renderizado THEN um `<SidebarSection title="...">` (o componente
   server-safe já existente) SHALL poder ser usado como filho sem alteração alguma nele.
10. WHEN a viewport cruza o breakpoint **enquanto o drawer está aberto** THEN o painel SHALL
    passar a modo estático sem deixar `body` com scroll travado nem foco preso órfão.
11. WHEN a regra CSS `.sv-app-sidebar` é inspecionada THEN SHALL usar `var(--sv-surface)`,
    `var(--sv-border)` e a escala `--sv-space-*`, e SHALL **não** conter `box-shadow`
    (Flat-By-Default Rule).
12. WHEN `data-state`/`data-collapsible` do painel são inspecionados THEN SHALL refletir
    `open`/`collapsible`, e a animação de abertura SHALL ser apenas fade (`opacity`) com
    `var(--sv-duration-fast)`/`var(--sv-ease-hover)`, zerada sob `prefers-reduced-motion`
    **no mesmo arquivo e depois da regra base** (AD-009 + contrato de `reduced-motion`).

**Independent Test**: Com `matchMedia` stubado em desktop e em mobile, renderizar
provider+painel+trigger; assert de elemento no fluxo × portal, `role`/`aria-modal`, `Escape`,
clique no overlay, `aria-expanded`/`aria-controls`, retorno de foco, e contrato textual da
seção CSS.

---

### P2: `collapsible="icon"` — rail colapsado no desktop

**User Story**: Como consumidor com uma nav de 12 itens, quero colapsar a sidebar para um rail
de ícones em vez de escondê-la por completo, para manter a navegação alcançável sem gastar
280px de largura.

**Why P2**: O modo `offcanvas` (P1) já desbloqueia as 11 telas; o rail é ganho de densidade,
não de viabilidade.

**Acceptance Criteria**:

1. WHEN `<SidebarProvider collapsible="icon">` e `open` é `false` **acima** do breakpoint
   THEN o painel SHALL permanecer no fluxo com `data-collapsible="icon"`, largura reduzida
   à escala de ícone, e SHALL **não** ser removido da árvore de acessibilidade.
2. WHEN o painel está no estado colapsado por ícone THEN os rótulos de texto SHALL ficar
   visualmente ocultos por CSS, e o nome acessível de cada item SHALL permanecer disponível.
3. WHEN `collapsible="icon"` e a viewport está **abaixo** do breakpoint THEN SHALL comportar-se
   como `offcanvas` (A-05), incluindo portal, foco preso e scroll-lock.
4. WHEN `<SidebarProvider collapsible="none">` é usado THEN o painel SHALL estar sempre
   expandido, `toggle()` SHALL ser um no-op e `<SidebarTrigger>` SHALL renderizar `null` (A-06).
5. WHEN `collapsible` é omitido THEN SHALL assumir `'offcanvas'`.

**Independent Test**: Renderizar os três modos nos dois lados do breakpoint e conferir
`data-collapsible`, presença no fluxo × portal, e ausência do trigger em `none`.

---

### P2: `SidebarInset` — a área de conteúdo que acompanha o painel

**User Story**: Como consumidor, quero um contêiner para o conteúdo principal que se ajuste
sozinho ao estado da sidebar, para não escrever a matemática de largura de grid em cada layout.

**Why P2**: O consumidor consegue fazer isso com CSS próprio; o componente remove repetição.

**Acceptance Criteria**:

1. WHEN `<SidebarInset>` é renderizado dentro do provider THEN SHALL emitir um `<main>` com
   classe `sv-app-sidebar-inset`.
2. WHEN o painel está colapsado ou aberto THEN o inset SHALL ler o estado por atributo de dado
   no contêiner do provider (`data-state`/`data-collapsible`) — **não** por prop nem por
   cálculo em JavaScript, para que o ajuste de largura seja puramente CSS.
3. WHEN o layout é inspecionado abaixo do breakpoint THEN o inset SHALL ocupar a largura total
   (o painel é drawer, não ocupa coluna).
4. WHEN um `className` de consumidor é passado THEN SHALL ser mesclado, nunca substituir
   `sv-app-sidebar-inset`.

**Independent Test**: Renderizar provider + painel + inset nos dois lados do breakpoint e
inspecionar tag, classes e atributos de dado herdados.

---

### Grupo B — Feedback transitório: Toast

---

### P1: `ToastProvider` + `useToast()` — notificação de resultado de operação ⭐ MVP

**User Story**: Como consumidor que acabou de salvar um prontuário, quero disparar
`toast({ variant: 'success', title: 'Salvo' })` de dentro do handler, para confirmar o
resultado sem ocupar espaço permanente na tela nem escrever meu próprio portal.

**Why P1**: Segundo maior alcance (9/18 telas) e capacidade **inexistente** hoje — não há
workaround, há ausência.

**Acceptance Criteria**:

1. WHEN `<ToastProvider>` envolve a árvore THEN `useToast()` SHALL expor
   `{ toast, dismiss, dismissAll, toasts }`; WHEN `useToast()` é chamado fora do provider
   THEN SHALL lançar um erro nomeado.
2. WHEN `toast({ title, description })` é chamado THEN um toast SHALL aparecer contendo o
   título e a descrição, dentro de uma região com `role="region"` e nome acessível.
3. WHEN `variant` é `'danger'` ou `'warning'` THEN o toast SHALL ser anunciado **assertivamente**
   (`aria-live="assertive"`); WHEN é `'info'` ou `'success'` (ou omitido) THEN SHALL ser
   anunciado **polidamente** (`aria-live="polite"`) — ver A-09 quanto a `role`.
4. WHEN `variant` é omitido THEN SHALL assumir `'info'`.
5. WHEN um toast é criado THEN SHALL carregar a classe `sv-toast` mais
   `sv-toast--{variant}`, e SHALL exibir o ícone correspondente à severidade
   (`info`/`check-circle`/`alert-triangle`/`alert-circle`) marcado `aria-hidden`.
6. WHEN `duration` não é informado THEN SHALL usar 5000 ms; WHEN `duration` é informado por
   toast THEN o valor por toast SHALL vencer o default do provider.
7. WHEN o tempo de `duration` expira THEN o toast SHALL ser removido da lista retornada por
   `useToast().toasts` — não apenas escondido visualmente.
8. WHEN o ponteiro entra no toast, ou o foco entra nele THEN a contagem de auto-dismiss SHALL
   pausar; WHEN sai THEN SHALL retomar.
9. WHEN cada toast é renderizado THEN SHALL ter um botão de fechar com nome acessível
   (`"Close"` por default, sobrescrevível via prop do provider — mesmo padrão de
   `DialogContent.closeLabel`, R4-02).
10. WHEN a regra CSS `.sv-toast` é inspecionada THEN SHALL usar `var(--sv-z-toast)` como
    `z-index`, `var(--sv-surface)`/`var(--sv-border)` como superfície, e SHALL **não** conter
    `box-shadow`; a cor por severidade SHALL vir de `var(--sv-{danger,success,info,warning}-ink)`.
11. WHEN a animação de entrada/saída é inspecionada THEN SHALL ser fade dirigido por
    `[data-state='open'|'closed']` com `var(--sv-duration-fast)`, zerada sob
    `prefers-reduced-motion` no mesmo arquivo e depois da regra base (AD-009).

**Independent Test**: Renderizar provider + um botão que chama `toast(...)`, com timers falsos;
assert de aparecimento, `aria-live` por variante, ícone, remoção após `duration`, pausa em
hover, e contrato textual da seção CSS.

---

### P1: Empilhamento e limite de toasts simultâneos ⭐ MVP

**User Story**: Como consumidor executando uma operação em lote, quero que múltiplos toasts
se empilhem de forma legível e limitada, para que a tela não vire uma parede de notificações.

**Why P1**: Sem isso, o primeiro uso em lote da lib produz um bug visual — é parte do MVP,
não refinamento.

**Acceptance Criteria**:

1. WHEN três `toast()` são disparados em sequência THEN os três SHALL estar presentes
   simultaneamente, empilhados na viewport, e `useToast().toasts` SHALL ter comprimento 3.
2. WHEN um quarto `toast()` é disparado com `max` em 3 THEN o **mais antigo** SHALL ser
   removido e o novo SHALL aparecer — `toasts` SHALL manter comprimento 3 (A-12).
3. WHEN `max` é informado no provider THEN SHALL vencer o default de 3.
4. WHEN dois `toast()` com conteúdo idêntico são disparados THEN SHALL produzir **duas**
   entradas distintas com ids distintos — a lib **não** deduplica (uma segunda falha idêntica
   é informação, não ruído; deduplicar esconderia repetição real de erro).
5. WHEN `toast()` retorna THEN SHALL entregar `{ id, dismiss, update }` — um handle para o
   toast recém-criado.

**Independent Test**: Disparar N toasts com `max` conhecido, inspecionar comprimento e ordem
de `toasts` e o DOM da viewport.

---

### P2: Ação dentro do toast (ex.: "Desfazer")

**User Story**: Como consumidor que acabou de arquivar um registro, quero oferecer "Desfazer"
dentro do próprio toast, para que a recuperação de um erro fique a um clique de distância.

**Why P2**: Nenhuma das 9 telas está bloqueada por isso hoje; é o que transforma um aviso
em uma saída.

**Acceptance Criteria**:

1. WHEN `toast({ action: { label, altText, onClick } })` é chamado THEN o toast SHALL renderizar
   um botão com o `label` e `altText` propagado ao primitivo (A-11).
2. WHEN o botão de ação é clicado THEN `onClick` SHALL ser chamado exatamente uma vez e o toast
   SHALL ser dispensado logo em seguida.
3. WHEN `action` é omitido THEN nenhum botão de ação SHALL renderizar (só o de fechar).
4. WHEN `altText` está ausente em tempo de tipos THEN SHALL ser erro de compilação — o campo é
   obrigatório, não opcional.

**Independent Test**: Renderizar com e sem `action`, clicar e conferir chamada única + dismiss;
`tsc --noEmit` cobre o caso 4.

---

### P2: Handles de controle — `dismiss`, `dismissAll`, `update`

**User Story**: Como consumidor com uma operação longa, quero atualizar um toast existente
("Enviando…" → "Enviado") em vez de empilhar dois, e quero limpar todos ao trocar de rota.

**Why P2**: Refinamento; o P1 já cobre o ciclo básico.

**Acceptance Criteria**:

1. WHEN `dismiss(id)` é chamado THEN só o toast daquele id SHALL sair.
2. WHEN `dismissAll()` é chamado THEN `toasts` SHALL ficar vazio.
3. WHEN `update(partial)` é chamado no handle retornado por `toast()` THEN o toast SHALL refletir
   os campos alterados **sem** remontar (o id SHALL permanecer o mesmo) e o timer de
   auto-dismiss SHALL reiniciar.
4. WHEN `dismiss(id)` recebe um id inexistente (ou já dispensado) THEN SHALL ser no-op silencioso,
   nunca lançar.

**Independent Test**: Criar, atualizar, dispensar e dispensar em massa; conferir ids e conteúdo.

---

### Grupo C — `Alert` com severidade semântica

---

### P1: `Alert variant` — severidade, `role` derivado e ícone default ⭐ MVP

**User Story**: Como consumidor exibindo o erro de validação de um formulário, quero
`<Alert variant="danger">` e receber a cor, o ícone e a semântica ARIA corretos do catálogo,
para parar de pintar cor à mão via `className` com uma anatomia diferente em cada tela.

**Why P1**: Terceiro maior alcance (9/18), o menor custo de implementação dos três, e o único
que é essencialmente CSS + props — inteiramente server-safe.

**Acceptance Criteria**:

1. WHEN `<Alert>` é renderizado **sem** `variant` THEN SHALL manter exatamente o comportamento
   atual: classe `sv-alert`, `role="alert"`, nenhuma classe de variante, nenhum ícone default
   (A-13, zero regressão).
2. WHEN `<Alert variant="danger">` é renderizado THEN SHALL carregar `sv-alert` **e**
   `sv-alert--danger`; idem para `info`/`success`/`warning`.
3. WHEN `variant` é `danger` ou `warning` THEN `role` SHALL ser `"alert"`; WHEN é `info` ou
   `success` THEN `role` SHALL ser `"status"` (A-14).
4. WHEN um `role` de consumidor é passado via props junto com `variant` THEN o valor derivado
   SHALL vencer — mesma garantia que `aria-modal` tem em `DialogContent` e `aria-label` em
   `Pagination`.
5. WHEN `variant` é passado e `icon` **não** é THEN SHALL renderizar o `Icon` correspondente
   (`info`/`check-circle`/`alert-triangle`/`alert-circle`), marcado `aria-hidden` — a severidade
   já está no `role`, o ícone é reforço visual, não informação exclusiva.
6. WHEN `icon={<X/>}` é passado THEN SHALL renderizar o nó fornecido no lugar do default;
   WHEN `icon={null}` é passado THEN nenhum ícone SHALL renderizar (A-15).
7. WHEN as regras `.sv-alert--{info,success,warning,danger}` são inspecionadas THEN a cor SHALL
   vir de `var(--sv-{info,success,warning,danger}-ink)` via uma custom property local
   (mesmo padrão de `--sv-callout-color` em `.sv-callout--*`), o fundo SHALL permanecer
   `var(--sv-surface)` e SHALL **não** haver `box-shadow` nem token `-soft` inventado.
8. WHEN `AlertTitle`/`AlertDescription` são usados dentro de um `Alert` com variante THEN SHALL
   continuar funcionando sem alteração de API.

**Independent Test**: Renderizar as cinco formas (sem variante + quatro variantes), assert de
`role`, classes, presença/ausência de ícone e precedência sobre `role` em props; contrato
textual da seção CSS.

---

### P2: `Alert action` — um controle dentro do alerta

**User Story**: Como consumidor exibindo "Falha ao carregar", quero um botão "Tentar novamente"
dentro do próprio alerta, para que a recuperação esteja onde o problema é anunciado.

**Why P2**: O consumidor consegue hoje colocando um `<Button>` em `children`; o slot padroniza
a posição e o espaçamento.

**Acceptance Criteria**:

1. WHEN `<Alert action={<Button/>}>` é renderizado THEN o nó SHALL aparecer dentro de um
   elemento com classe `sv-alert__action`.
2. WHEN `action` é omitido THEN nenhum elemento `sv-alert__action` SHALL existir no DOM.
3. WHEN a regra `.sv-alert__action` é inspecionada THEN SHALL usar a escala `--sv-space-*` para
   espaçamento e não conter `box-shadow`.
4. WHEN `action` e `icon` coexistem THEN o layout SHALL acomodar os dois sem sobreposição
   (ícone à esquerda, ação após o corpo).

**Independent Test**: Renderizar com e sem `action`, com e sem `icon`, e inspecionar a estrutura.

---

## Edge Cases

**Sidebar**

- WHEN `SidebarPanel` é renderizado **sem** `SidebarProvider` THEN SHALL lançar o mesmo erro
  nomeado de `useSidebar` — falha alta e clara, nunca render silenciosamente errado.
- WHEN `breakpoint` recebe `0`, negativo, `NaN` ou `Infinity` THEN SHALL cair no default
  (1024) em vez de montar um media query inválido — mesmo tratamento que `Progress` deu a
  `max` inválido (R4-04 AC-7).
- WHEN dois `SidebarProvider` são aninhados THEN o `useSidebar` de dentro SHALL ler o provider
  mais próximo (comportamento normal de contexto), documentado como não suportado mas não
  quebrado.
- WHEN `SidebarTrigger` é renderizado sem que exista nenhum `SidebarPanel` THEN SHALL alternar
  o estado sem lançar; `aria-controls` SHALL apontar para um id que ainda não existe no DOM,
  que é o comportamento correto para um painel montado condicionalmente.

**Toast**

- WHEN `toast()` é chamado durante o unmount do provider THEN SHALL ser no-op, nunca um
  `setState` em componente desmontado.
- WHEN `duration` é `Infinity` THEN o toast SHALL persistir até dispensa explícita (caso de
  uso real: erro que exige ação); WHEN `duration` é `0` ou negativo THEN SHALL cair no default
  em vez de sumir no mesmo frame.
- WHEN `title` e `description` são ambos omitidos THEN SHALL renderizar um toast vazio mas
  válido em vez de lançar — o defeito é do call site e deve ser visível, não fatal.
- WHEN o mesmo handle tem `dismiss()` chamado duas vezes THEN a segunda SHALL ser no-op.
- WHEN `max` recebe `0` ou valor inválido THEN SHALL cair no default de 3.

**Alert**

- WHEN `variant` recebe um valor fora da união em runtime (JS sem tipos) THEN SHALL comportar-se
  como se `variant` fosse omitido — nenhuma classe `sv-alert--undefined`, `role="alert"`
  preservado.
- WHEN `className` do consumidor é passado junto com `variant` THEN SHALL ser mesclado, nunca
  substituir `sv-alert` nem a classe de variante.

**Transversal**

- WHEN qualquer componente novo é alcançado pelo grafo de `src/react/index.ts` THEN
  `tests/server-safety.test.ts` SHALL falhar — as famílias novas de sidebar e toast pertencem
  **exclusivamente** a `src/react/client/`.
- WHEN `prefers-reduced-motion: reduce` está ativo THEN nenhuma das animações novas SHALL rodar,
  e a regra de override SHALL viver no mesmo arquivo, **depois** da regra base (contrato de
  `tests/reduced-motion-contract.test.ts`).

---

## Requirement Traceability

| Requirement ID | Story | Grupo | Phase | Status |
| --- | --- | --- | --- | --- |
| R5-01 | P1: `useMediaQuery` / `createMediaQuery` | A | Tasks | Pending |
| R5-02 | P1: Sidebar provider/painel/trigger (offcanvas) | A | Tasks | Pending |
| R5-03 | P2: `collapsible="icon"` / `"none"` | A | Tasks | Pending |
| R5-04 | P2: `SidebarInset` | A | Tasks | Pending |
| R5-05 | P1: `ToastProvider` + `useToast` | B | Tasks | Pending |
| R5-06 | P1: Empilhamento e limite | B | Tasks | Pending |
| R5-07 | P2: Ação no toast | B | Tasks | Pending |
| R5-08 | P2: `dismiss`/`dismissAll`/`update` | B | Tasks | Pending |
| R5-09 | P1: `Alert variant` + `role` + ícone | C | Tasks | Pending |
| R5-10 | P2: `Alert action` | C | Tasks | Pending |

**ID format:** `R5-NN`, seguindo `R4-NN` das rodadas anteriores.

**Coverage:** 10 requisitos, 10 mapeados para tasks (ver `tasks.md`), 0 sem mapeamento.

---

## Success Criteria

- [ ] `npm run test` verde com threshold de **100%** de lines/branches/functions/statements
      mantido (`vitest.config.ts`).
- [ ] `npm run typecheck`, `npm run build` e `npm run lint:package` (publint + attw) verdes.
- [ ] `tests/server-safety.test.ts` passa **sem edição** — prova mecânica de que nada da
      rodada vazou para o entry server-safe.
- [ ] `tests/react-barrel.test.ts` passa **sem edição** — prova de que `@still-void/ui/react`
      não ganhou nem perdeu export em runtime (A-17).
- [ ] `tests/reduced-motion-contract.test.ts` passa cobrindo as classes animadas novas.
- [ ] Changesets presentes e todos `minor`; nenhum arquivo `version`/`CHANGELOG.md` editado à mão.
- [ ] Uma story de Storybook por família nova, com a11y addon sem violação nova.
- [ ] O consumidor consegue trocar, em uma tela do VittaFlow, o `<aside>` manual por
      `SidebarProvider`+`SidebarPanel`+`SidebarTrigger`, o `window.alert`/estado local de
      feedback por `useToast()`, e o `<Alert className="border-red-500">` por
      `<Alert variant="danger">` — sem `className` de cor em nenhum dos três.
