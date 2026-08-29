# Rodada 5 (App Shell + Feedback) — Tasks

## Execution Protocol (MANDATORY — do not skip)

Implemente estas tasks com a skill `tlc-spec-driven`: **ative-a pelo nome e siga o fluxo
Execute e as Critical Rules dela.** Não procure os arquivos da skill por caminho de
filesystem. A skill é a fonte da verdade do fluxo completo (ciclo por task, delegação a
sub-agentes, revisão de adequação, Verifier, sensor de discriminação).

**Se a skill não puder ser ativada, PARE e avise o usuário — não prossiga sem ela.**

> **>3 fases** (são 5): no início de Execute, a skill exige **oferecer** um worker por fase
> (sequencial) e aguardar confirmação. Não auto-despachar.

---

**Spec**: [spec.md](spec.md)
**Design**: [design.md](design.md)
**Status**: Draft — aguardando aprovação.

**Pré-condição de Execute** (bloqueante, não é uma task):
confirmar com o usuário a decisão **AD-016** (adicionar `@radix-ui/react-toast` como
dependência direta) e **AD-017** (família nova de app shell), e só então anexá-las a
`.specs/STATE.md` `## Decisions`. Se AD-016 for vetada, a Fase 4 inteira muda de forma
(implementação própria com a mesma API pública `ToastProvider`/`useToast`) — as Fases 1–3
não são afetadas.

---

## Test Coverage Matrix

> Gerada a partir do codebase, das guidelines do projeto e da spec — confirmar antes de Execute.
> Guidelines encontradas: `CLAUDE.md` (changeset obrigatório por mudança em `src/`; `exports`,
> classes `sv-*` e variáveis `--sv-*` são API pública), `CONTRIBUTING.md` (níveis de bump),
> `vitest.config.ts` (**threshold 100%** lines/branches/functions/statements, `include: src/**`,
> `exclude: src/react/stories/**`, `src/css/**`), `.github/workflows` + `package.json` scripts
> (`test`, `typecheck`, `lint:package`), `DESIGN.md` §4 (Flat-By-Default), `.specs/STATE.md`
> AD-005/AD-009/AD-015.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Behavior puro (`src/behaviors/mediaQuery.ts`) | unit | Todos os branches (inclusive `matchMedia` ausente); 1:1 com as ACs de R5-01 | `tests/mediaQuery.test.ts` | `npm run test` |
| Hook client (`src/react/client/hooks.ts`) | unit (RTL `renderHook`) | Todos os branches, inclusive o snapshot de servidor; 1:1 com ACs | `tests/hooks-media-query.test.tsx` | `npm run test` |
| Componente client novo (`SidebarProvider.tsx`, `ToastProvider.tsx`) | unit (RTL + `user-event`) | Todos os branches; 1:1 com ACs; **todo edge case listado na spec** tem teste | `tests/app-sidebar*.test.tsx`, `tests/toast*.test.tsx` | `npm run test` |
| Componente server-safe tocado (`alert.tsx`) | unit (RTL) | Zero regressão no comportamento atual (caso sem `variant`) + todo comportamento novo; 1:1 com ACs | `tests/ui-alert.test.tsx` (estendido) | `npm run test` |
| CSS novo/estendido (`src/css/style.css`) | unit (contrato textual) | Toda regra prometida existe; cor vem de `var(--sv-*)`; **nenhum `box-shadow`**; bloco `prefers-reduced-motion` no mesmo arquivo e depois da regra base | `tests/*-css-contract.test.ts` | `npm run test` |
| Entry server-safe (`src/react/index.ts`) | unit | Grafo continua sem hook/`'use client'`/Radix | `tests/server-safety.test.ts` (**existente, sem edição**) | `npm run test` |
| Entry client (`src/react/client/index.ts`) | unit | Todo export novo resolve (pinado no teste da própria família) | `tests/app-sidebar*.test.tsx`, `tests/toast*.test.tsx` | `npm run test` |
| Manifesto (`package.json`) | unit (contrato) | Dependência nova declarada com faixa caret; `exports` inalterado | `tests/package-contract.test.ts` (estendido) | `npm run test` |
| Stories (`src/react/stories/**`) | none | Excluído do coverage por config; verificação é o build do Storybook + addon-a11y | — | `npm run build-storybook` |
| Build / tipos / empacotamento | none | Threshold 100% + publint + attw verdes | — | `npm run build`, `npm run typecheck`, `npm run lint:package`, `npm run test:coverage` |

**Threshold é gate de CI, não meta:** 100% em lines/branches/functions/statements. Uma linha
não coberta **reprova o build** — por isso todo `Done when` abaixo cita explicitamente os
branches de borda (default inválido, `matchMedia` ausente, no-op de dismiss repetido).

## Parallelism Assessment

> Gerada a partir do codebase — confirmar antes de Execute.

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
| --- | --- | --- | --- |
| unit (RTL, jsdom) | **Sim** | Vitest dá um ambiente jsdom por **arquivo** de teste; `tests/setup.ts` roda por arquivo, então o stub de `matchMedia` é local ao arquivo. `cleanup()` do RTL desmonta entre casos. Sem store compartilhado, sem banco, sem I/O | `vitest.config.ts` (`environment: 'jsdom'`, `setupFiles`), `tests/client-class-contract.tsx` usa `afterEach(cleanup)` |
| unit (contrato textual de CSS/manifesto) | **Sim** | Lê arquivo do disco e faz assert de string; nenhum estado mutável | `tests/client-css-contract.test.ts`, `tests/package-contract.test.ts` |

**Consequência para os flags `[P]`:** o tipo de teste nunca é o gargalo aqui. O que impede
`[P]` neste plano é **arquivo compartilhado**: tasks da mesma fase que editam o mesmo
`SidebarProvider.tsx`/`ToastProvider.tsx`/`style.css` **não** são order-free e por isso não
levam `[P]`, mesmo com testes paralelizáveis.

## Gate Check Commands

> Gerada a partir do codebase — confirmar antes de Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Task que só altera implementação já coberta | `npm run test` |
| Full | Task que cria arquivo de teste novo ou muda tipo público | `npm run test && npm run typecheck` |
| Build | Fim de fase, ou task que toca CSS publicado, manifesto ou dependências | `npm run build && npm run lint:package && npm run test:coverage` |

---

## Execution Plan

```
Fase 1 (Alert — server-safe, independente)
  T1 ──→ T2

Fase 2 (Fundação da casca)
  T3 ──→ T4

Fase 3 (Sidebar de app)          Fase 4 (Toast)
  T4 ──→ T5 ──→ T6 ──→ T7          T9 ──→ T10 ──→ T11 ──→ T12
                  └──→ T8

Fase 5 (Stories, docs, gate final)
  T2, T8, T12 ──┬──→ T13 [P] ──┐
                ├──→ T14 [P] ──┼──→ T16 ──→ T17
                └──→ T15 [P] ──┘
```

**Fase 1** é deliberadamente a primeira: `Alert` é a lacuna de menor risco (CSS + props,
server-safe, sem dependência) e a de maior alcance por unidade de esforço — mesma ordenação
que a rodada 4 usou ao começar por `IconName`/`closeLabel`.

**Fase 4 (Toast) não depende da Fase 3 (Sidebar)** — as duas dependem apenas da Fase 1 estar
verde. Se a fase 3 travar, a 4 segue.

---

## Task Breakdown

### Fase 1 — `Alert` com severidade semântica

#### T1: `Alert` ganha `variant`, `role` derivado e ícone default

**What**: Adicionar `variant`/`icon` a `Alert`, derivar `role`, renderizar o ícone da
severidade, e criar as quatro classes CSS de variante.
**Where**: `src/components/ui/alert.tsx` (modificar), `src/css/style.css` (estender a seção
`Alert`), `tests/ui-alert.test.tsx` (estender), `tests/component-css-contract.test.ts`
(estender) ou `tests/ui-alert-css-contract.test.ts` (novo, se a seção crescer o suficiente).
**Depends on**: nenhuma
**Reuses**: `Icon`/`IconName` (`menu`,`info`,`check-circle`,`alert-triangle`,`alert-circle`
já existem, AD-013); regra `.sv-alert > svg` já publicada (posicionamento do ícone); padrão
de custom property local `--sv-callout-color` de `.sv-callout--*`; `cn()`.
**Requirement**: R5-09

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] `<Alert>` **sem** `variant` produz DOM idêntico ao atual: `class="sv-alert"`,
      `role="alert"`, sem ícone (AC-1, zero regressão — os casos existentes de
      `tests/ui-alert.test.tsx` passam **sem edição**)
- [ ] As quatro variantes emitem `sv-alert sv-alert--{variant}` (AC-2)
- [ ] `role` derivado: `danger`/`warning` → `alert`; `info`/`success` → `status` (AC-3)
- [ ] `role` passado em props **perde** para o derivado quando `variant` existe (AC-4)
- [ ] Ícone default por variante, `aria-hidden` (AC-5); `icon={<X/>}` substitui e
      `icon={null}` suprime (AC-6)
- [ ] `variant` fora da união em runtime cai no caminho neutro — nenhuma classe
      `sv-alert--undefined` (Edge Case)
- [ ] `className` do consumidor é mesclado, nunca substitui (Edge Case)
- [ ] Contrato CSS: cada `.sv-alert--*` seta `--sv-alert-color` a partir do
      `var(--sv-{…}-ink)` correspondente; fundo permanece `var(--sv-surface)`; **nenhum
      `box-shadow`**; nenhum token `-soft` introduzido (AC-7)
- [ ] `npm run test && npm run typecheck` verdes; coverage 100% mantido
- [ ] Changeset **minor** criado descrevendo a prop para o consumidor

**Tests**: unit (RTL + contrato textual de CSS) · **Gate**: Full
**Commit**: `feat(alert): add semantic variant with derived role and default icon`

---

#### T2: `Alert` ganha o slot `action`

**What**: Adicionar `action?: ReactNode` e a região `.sv-alert__action`.
**Where**: `src/components/ui/alert.tsx`, `src/css/style.css`, `tests/ui-alert.test.tsx`,
teste de contrato CSS de `Alert`.
**Depends on**: T1
**Reuses**: escala `--sv-space-*`; layout de ícone já resolvido em T1.
**Requirement**: R5-10

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] `action` renderiza dentro de `.sv-alert__action` (AC-1); omitido → elemento ausente do
      DOM (AC-2)
- [ ] Contrato CSS: `.sv-alert__action` usa `--sv-space-*`, sem `box-shadow` (AC-3)
- [ ] `action` + `icon` juntos não se sobrepõem — estrutura conferida no DOM (AC-4)
- [ ] `npm run test && npm run typecheck` verdes; coverage 100%
- [ ] Changeset **minor**

**Tests**: unit · **Gate**: Full
**Commit**: `feat(alert): add action slot`

---

### Fase 2 — Fundação da casca: leitura de breakpoint

#### T3: `createMediaQuery` behavior + stub de `matchMedia` no setup

**What**: Criar o controlador puro sobre `window.matchMedia` e o stub de ambiente que o
jsdom não fornece.
**Where**: `src/behaviors/mediaQuery.ts` (novo), `tests/setup.ts` (estender),
`tests/mediaQuery.test.ts` (novo).
**Depends on**: nenhuma
**Reuses**: forma de `src/behaviors/scrollSpy.ts` (`subscribe`/`destroy`); degradação
graciosa de `themeManager` quando a API do browser falta.
**Requirement**: R5-01

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] `getSnapshot()`/`subscribe()`/`destroy()` conforme AC-1; `subscribe` devolve unsubscribe
- [ ] Listener notificado **uma vez por transição** do limiar (AC-2)
- [ ] `destroy()` remove todos os listeners do `MediaQueryList` — verificado por espião no
      stub, não por ausência de erro (AC-3)
- [ ] `window.matchMedia` indefinido → controlador inerte (`getSnapshot() === false`,
      `subscribe` no-op), sem lançar (AC-6)
- [ ] Stub em `tests/setup.ts` responde `matches: false` por default (desktop) e é
      sobrescrevível por arquivo de teste; **a suíte inteira existente continua verde sem
      edição** — prova de que o stub não mudou nenhum resultado prévio
- [ ] Coverage 100% do arquivo novo, incluindo o branch sem `matchMedia`
- [ ] `npm run test && npm run typecheck` verdes
- [ ] Changeset **minor**

**Tests**: unit · **Gate**: Full
**Commit**: `feat(behaviors): add createMediaQuery`

---

#### T4: `useMediaQuery` hook + export no client entry

**What**: Hook fino sobre `createMediaQuery` via `useSyncExternalStore`, exportado de
`@still-void/ui/react/client`.
**Where**: `src/react/client/hooks.ts` (estender), `src/react/client/index.ts` (adicionar
`createMediaQuery` à lista de behaviors exportados), `tests/hooks-media-query.test.tsx` (novo).
**Depends on**: T3
**Reuses**: `useScrollSpy`/`useReadingProgress` como forma; `createMediaQuery` de T3.
**Requirement**: R5-01

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] Render sem `window` (server snapshot) devolve `false` sem lançar (AC-4) — testado
      chamando o `getServerSnapshot` diretamente, porque jsdom sempre tem `window`
- [ ] Após hidratação, reflete o valor real do `matchMedia` sem aviso de mismatch (AC-5) —
      assert de que o console do React não recebeu warning durante o render
- [ ] Re-render ao cruzar o limiar; unsubscribe no unmount (sem listener órfão)
- [ ] `createMediaQuery` e `useMediaQuery` resolvem a partir de `src/react/client/index.ts`
      (pin do export no próprio arquivo de teste)
- [ ] Coverage 100%; `npm run test && npm run typecheck` verdes
- [ ] Changeset **minor**

**Tests**: unit · **Gate**: Full
**Commit**: `feat(client): add useMediaQuery hook`

---

### Fase 3 — Sidebar de aplicação

#### T5: `SidebarProvider` + `useSidebar` + wrapper `.sv-app-shell`

**What**: O provider de estado (controlado/não-controlado), a leitura de breakpoint, o
contexto, e o wrapper que publica `data-state`/`data-collapsible`/`data-mobile`.
**Where**: `src/react/client/SidebarProvider.tsx` (novo), `src/css/style.css` (seção
`App Sidebar`, parte do wrapper), `tests/app-sidebar-provider.test.tsx` (novo).
**Depends on**: T4
**Reuses**: `ThemeProvider`/`useTheme` como forma; `useMediaQuery` de T4.
**Requirement**: R5-02, R5-03 (AC-5 default `offcanvas`)

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] `useSidebar()` expõe `{ open, setOpen, toggle, isMobile, collapsible, panelId }` (AC-1)
- [ ] `useSidebar()` fora do provider lança erro nomeado (AC-1, mesmo contrato de `useTheme`)
- [ ] Não-controlado respeita `defaultOpen`; controlado (`open` + `onOpenChange`) **não** muda
      estado interno sem chamar `onOpenChange` (AC-2)
- [ ] `breakpoint` inválido (`0`, negativo, `NaN`, `Infinity`) cai no default **1024**
      (Edge Case) — os quatro casos têm teste, porque cada um é um branch sob threshold 100%
- [ ] `collapsible` omitido → `'offcanvas'` (R5-03 AC-5)
- [ ] Wrapper emite `data-state`, `data-collapsible` e `data-mobile` coerentes com o estado
- [ ] `npm run test && npm run typecheck` verdes; coverage 100%
- [ ] Changeset **minor**

**Tests**: unit · **Gate**: Full
**Commit**: `feat(client): add SidebarProvider and useSidebar`

---

#### T6: `SidebarPanel` + `SidebarTrigger` (modo `offcanvas`)

**What**: O painel nos dois modos (estático no fluxo × drawer em portal via Radix Dialog) e o
botão de menu. Exportar a família do client entry.
**Where**: `src/react/client/SidebarProvider.tsx` (estender), `src/react/client/index.ts`
(`export * from './SidebarProvider'`), `src/css/style.css` (`.sv-app-sidebar*`,
`.sv-app-sidebar-trigger` + bloco `prefers-reduced-motion`),
`tests/app-sidebar-panel.test.tsx` (novo), `tests/app-sidebar-css-contract.test.ts` (novo).
**Depends on**: T5
**Reuses**: `@radix-ui/react-dialog` (**já em `dependencies`** — traz focus trap, scroll-lock,
`Escape`, overlay); `.sv-overlay` publicada; `Icon name="menu"`; `sv-sr-only`; parser
`section()` de `tests/client-css-contract.test.ts`.
**Requirement**: R5-02

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] Acima do breakpoint: `<aside class="sv-app-sidebar">` **no fluxo**, sem portal, sem
      overlay, sem foco preso (AC-3)
- [ ] Abaixo do breakpoint com `open`: portal, `role="dialog"`, `aria-modal="true"`, foco
      movido para dentro, foco preso, `body` com scroll travado (AC-4)
- [ ] `Escape` fecha e devolve o foco ao gatilho (AC-5); clique no overlay fecha (AC-6)
- [ ] `SidebarTrigger` alterna `open`, expõe `aria-expanded` e `aria-controls` **derivados**
      (vencem props do consumidor) (AC-7)
- [ ] Sem `children`, o trigger renderiza `<Icon name="menu" />` + nome acessível default
      `"Toggle sidebar"`, sobrescrevível por `label` (AC-8)
- [ ] `SidebarSection` (server-safe existente) funciona como filho **sem nenhuma alteração
      nele** (AC-9)
- [ ] Cruzar o breakpoint com o drawer aberto não deixa `body` travado nem foco órfão (AC-10)
- [ ] `SidebarPanel` fora do provider lança o erro nomeado (Edge Case)
- [ ] `SidebarTrigger` sem painel montado alterna sem lançar (Edge Case)
- [ ] Contrato CSS: `.sv-app-sidebar` usa `--sv-surface`/`--sv-border`/`--sv-space-*`,
      **sem `box-shadow`** (AC-11); foco é `outline` (AD-005); fade dirigido por `[data-state]`
      com `--sv-duration-fast`/`--sv-ease-hover` (AC-12, AD-009)
- [ ] `tests/reduced-motion-contract.test.ts` passa cobrindo as classes animadas novas — o
      bloco `reduce` está **em `style.css`, depois da regra base**
- [ ] `tests/server-safety.test.ts` passa **sem edição** (nada vazou para `/react`)
- [ ] `tests/react-barrel.test.ts` passa **sem edição** (o entry server-safe não mudou)
- [ ] `npm run build && npm run lint:package && npm run test:coverage` verdes
- [ ] Changeset **minor**

**Tests**: unit · **Gate**: Build
**Commit**: `feat(client): add SidebarPanel and SidebarTrigger with off-canvas drawer`

---

#### T7: `collapsible="icon"` e `collapsible="none"`

**What**: O rail colapsado de ícones acima do breakpoint e o modo sempre-expandido.
**Where**: `src/react/client/SidebarProvider.tsx`, `src/css/style.css`,
`tests/app-sidebar-collapsible.test.tsx` (novo), contrato CSS de `App Sidebar` (estender).
**Depends on**: T6 *(mesmo arquivo e mesma seção CSS de T8 — **não** é `[P]`)*
**Reuses**: `data-collapsible` publicado em T5; `sv-sr-only`.
**Requirement**: R5-03

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] `icon` + fechado + desktop → permanece no fluxo, `data-collapsible="icon"`, largura de
      rail, **presente na árvore de acessibilidade** (AC-1)
- [ ] Rótulos visualmente ocultos por CSS, nome acessível de cada item preservado (AC-2)
- [ ] `icon` abaixo do breakpoint comporta-se como `offcanvas` (portal, foco preso,
      scroll-lock) (AC-3, A-05)
- [ ] `none` → sempre expandido, `toggle()` no-op, `SidebarTrigger` renderiza `null` (AC-4)
- [ ] Contrato CSS das regras novas: sem `box-shadow`, largura da escala `--sv-space-*`
- [ ] `npm run test && npm run typecheck` verdes; coverage 100%
- [ ] Changeset **minor**

**Tests**: unit · **Gate**: Full
**Commit**: `feat(client): add icon and none collapsible modes to the app sidebar`

---

#### T8: `SidebarInset`

**What**: O `<main>` que acompanha o painel, ajustado por CSS puro a partir do `data-state`
do wrapper.
**Where**: `src/react/client/SidebarProvider.tsx`, `src/css/style.css`,
`tests/app-sidebar-inset.test.tsx` (novo), contrato CSS de `App Sidebar` (estender).
**Depends on**: T7 *(mesmo arquivo e mesma seção CSS — sequencial por conflito de arquivo,
não por dependência lógica)*
**Reuses**: `data-state`/`data-collapsible` do wrapper (T5); `cn()`.
**Requirement**: R5-04

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] Emite `<main class="sv-app-sidebar-inset">` (AC-1)
- [ ] Reage ao estado **por seletor CSS descendente**, sem ler contexto nem calcular em JS —
      verificado por contrato textual do seletor, não só pelo DOM (AC-2)
- [ ] Abaixo do breakpoint ocupa largura total (AC-3)
- [ ] `className` do consumidor é mesclado (AC-4)
- [ ] Contrato CSS sem `box-shadow`
- [ ] `npm run test && npm run typecheck` verdes; coverage 100%
- [ ] Changeset **minor**

**Tests**: unit · **Gate**: Full
**Commit**: `feat(client): add SidebarInset`

---

### Fase 4 — Toast

#### T9: `@radix-ui/react-toast` como dependência direta

**What**: Instalar o pacote e pinar o fato em contrato de manifesto.
**Where**: `package.json`, `package-lock.json` (gerado), `tests/package-contract.test.ts`
(estender).
**Depends on**: nenhuma *(independente das fases 1–3)*
**Reuses**: forma do bloco de contrato de `@heroicons/react` já em
`tests/package-contract.test.ts:126`.
**Requirement**: R5-05

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] **AD-016 confirmada pelo usuário e anexada a `.specs/STATE.md`** antes de instalar
- [ ] `dependencies["@radix-ui/react-toast"]` é uma faixa caret e **não** está em
      `devDependencies` (mesmo par de asserções do heroicons)
- [ ] `exports` do `package.json` **inalterado** (nenhum subpath novo) — asserção explícita
- [ ] `npm run build && npm run lint:package && npm run test:coverage` verdes; publint e attw
      sem novo achado
- [ ] `tests/server-safety.test.ts` verde **sem edição** — prova de que o pacote `'use client'`
      não é alcançável a partir do entry server-safe
- [ ] Changeset **minor** (dependência de runtime nova é mudança visível ao consumidor)

**Tests**: unit (contrato de manifesto) · **Gate**: Build
**Commit**: `feat(deps): add @radix-ui/react-toast`

---

#### T10: `ToastProvider` + `useToast` — fila, variantes, auto-dismiss, empilhamento

**What**: O provider que possui a fila, o hook, o mapeamento de severidade e a viewport;
mais o CSS da seção `Toast`.
**Where**: `src/react/client/ToastProvider.tsx` (novo), `src/react/client/index.ts`
(`export * from './ToastProvider'`), `src/css/style.css` (seção `Toast` + bloco
`prefers-reduced-motion`), `tests/toast.test.tsx` (novo),
`tests/toast-css-contract.test.ts` (novo).
**Depends on**: T9
**Reuses**: `@radix-ui/react-toast` (região/anúncio/pausa/swipe/hotkey F8); `Icon`
(`info`/`check-circle`/`alert-triangle`/`alert-circle`, todos existentes); `sv-sr-only`;
padrão `closeLabel` de `DialogContent` (R4-02); parser `section()` de contrato CSS.
**Requirement**: R5-05, R5-06

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] `useToast()` expõe `{ toast, dismiss, dismissAll, toasts }`; fora do provider lança erro
      nomeado (AC-1)
- [ ] `toast({title, description})` aparece dentro de uma região `role="region"` com nome
      acessível (AC-2)
- [ ] `aria-live` **assertivo** em `danger`/`warning` e **polido** em `info`/`success`
      (AC-3) — asserção contra `aria-live`, não contra `role`, conforme A-09
- [ ] `variant` omitido → `'info'` (AC-4)
- [ ] Classes `sv-toast sv-toast--{variant}` + ícone `aria-hidden` por severidade (AC-5)
- [ ] `duration` default 5000; `duration` por toast vence o do provider (AC-6)
- [ ] Ao expirar, a entrada **sai de `toasts`**, não só do visual (AC-7)
- [ ] Pausa em hover e em foco; retoma ao sair (AC-8)
- [ ] Botão de fechar com nome acessível default `"Close"`, sobrescrevível por
      `closeLabel` do provider (AC-9)
- [ ] Empilhamento: 3 toasts simultâneos, `toasts.length === 3` (R5-06 AC-1); o 4º remove o
      **mais antigo** (FIFO) mantendo comprimento 3 (AC-2); `max` do provider vence o default
      (AC-3); conteúdo idêntico produz **duas** entradas com ids distintos (AC-4);
      `toast()` devolve `{ id, dismiss, update }` (AC-5)
- [ ] Edge cases cobertos: `duration` ≤ 0/`NaN` → default; `duration: Infinity` → persistente;
      `title`+`description` ambos omitidos → toast vazio válido, sem lançar; `toast()` após
      unmount → no-op; `max` inválido → default 3
- [ ] Contrato CSS: `.sv-toast` usa `var(--sv-z-toast)`, `--sv-surface`/`--sv-border`,
      cor por severidade de `var(--sv-{…}-ink)`, **sem `box-shadow`** (AC-10); fade por
      `[data-state]` com `--sv-duration-fast` (AC-11, AD-009)
- [ ] `tests/reduced-motion-contract.test.ts` cobre as classes animadas novas (bloco `reduce`
      em `style.css`, depois da regra base)
- [ ] Timers falsos configurados com `userEvent.setup({ advanceTimers })` — ver Risks do design
- [ ] `npm run build && npm run lint:package && npm run test:coverage` verdes; coverage 100%
- [ ] Changeset **minor**

**Tests**: unit · **Gate**: Build
**Commit**: `feat(client): add ToastProvider and useToast`

---

#### T11: Ação dentro do toast

**What**: A opção `action` (`label` + `altText` obrigatório + `onClick`) e a classe
`.sv-toast__action`.
**Where**: `src/react/client/ToastProvider.tsx`, `src/css/style.css`, `tests/toast.test.tsx`,
`tests/toast-css-contract.test.ts`.
**Depends on**: T10 *(mesmo arquivo de T12 — **não** é `[P]`)*
**Reuses**: `ToastAction` do primitivo (que **exige** `altText`); tokens de foco AD-005.
**Requirement**: R5-07

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] `action` renderiza botão com o `label` e propaga `altText` ao primitivo (AC-1)
- [ ] Clique chama `onClick` exatamente uma vez e dispensa o toast em seguida (AC-2)
- [ ] `action` omitido → só o botão de fechar (AC-3)
- [ ] `altText` é **obrigatório em tipos** — verificado por `npm run typecheck` sobre um caso
      de teste de tipo (AC-4)
- [ ] Contrato CSS de `.sv-toast__action`: sem `box-shadow`, foco por `outline`
- [ ] `npm run test && npm run typecheck` verdes; coverage 100%
- [ ] Changeset **minor**

**Tests**: unit · **Gate**: Full
**Commit**: `feat(client): add action support to toasts`

---

#### T12: `dismiss`, `dismissAll` e `update`

**What**: Os handles de controle do ciclo de vida de um toast.
**Where**: `src/react/client/ToastProvider.tsx`, `tests/toast.test.tsx`.
**Depends on**: T11 *(mesmo arquivo — sequencial por conflito, não por dependência lógica)*
**Reuses**: reducer da fila criado em T10.
**Requirement**: R5-08

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] `dismiss(id)` remove só aquele toast (AC-1); `dismissAll()` esvazia `toasts` (AC-2)
- [ ] `update(patch)` altera o conteúdo **mantendo o mesmo id** (sem remontar) e **reinicia**
      o timer de auto-dismiss (AC-3)
- [ ] `dismiss` de id inexistente, e `dismiss()` chamado duas vezes no mesmo handle, são
      no-op silencioso (AC-4 + Edge Case)
- [ ] `npm run test && npm run typecheck` verdes; coverage 100%
- [ ] Changeset **minor**

**Tests**: unit · **Gate**: Full
**Commit**: `feat(client): add dismiss, dismissAll and update handles to useToast`

---

### Fase 5 — Storybook, documentação e gate final

#### T13: Story do `Alert` com variantes e ação `[P]`

**What**: Estender a story existente com as quatro variantes, o caso neutro e o slot `action`.
**Where**: `src/react/stories/Alert.stories.tsx` (modificar)
**Depends on**: T2
**Reuses**: padrão das stories existentes (dark/light, accent).
**Requirement**: R5-09, R5-10

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] Uma story por variante + a neutra + uma com `action` + uma com `icon={null}`
- [ ] `npm run build-storybook` verde; `addon-a11y` sem violação nova
- [ ] Sem changeset (`src/react/stories/**` é excluído do coverage, mas **é** `src/` — criar
      changeset **patch** se o CI de changeset exigir; confirmar com `npm run changeset` no
      momento da execução)

**Tests**: none *(camada `stories` = `none` na matriz)* · **Gate**: Build
**Commit**: `docs(storybook): cover Alert variants and action slot`

---

#### T14: Story da sidebar de aplicação `[P]`

**What**: Story nova cobrindo `offcanvas`/`icon`/`none` e os dois lados do breakpoint.
**Where**: `src/react/stories/AppSidebar.stories.tsx` (novo)
**Depends on**: T8
**Reuses**: `SidebarSection` para os grupos; padrão das stories existentes.
**Requirement**: R5-02, R5-03, R5-04

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] Stories: `Offcanvas`, `IconRail`, `None`, e uma com `SidebarInset` + `SidebarTrigger`
      montado num `Header`
- [ ] `npm run build-storybook` verde; `addon-a11y` sem violação nova
- [ ] Changeset conforme a regra confirmada em T13

**Tests**: none · **Gate**: Build
**Commit**: `docs(storybook): add app sidebar stories`

---

#### T15: Story do Toast `[P]`

**What**: Story nova com um botão por severidade, um com ação e um com múltiplos toasts.
**Where**: `src/react/stories/Toast.stories.tsx` (novo)
**Depends on**: T12
**Reuses**: padrão das stories existentes.
**Requirement**: R5-05, R5-06, R5-07, R5-08

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] Stories: `Severities`, `WithAction`, `Stacking` (dispara 4 com `max=3`), `Persistent`
      (`duration: Infinity`)
- [ ] `npm run build-storybook` verde; `addon-a11y` sem violação nova
- [ ] Changeset conforme a regra confirmada em T13

**Tests**: none · **Gate**: Build
**Commit**: `docs(storybook): add toast stories`

---

#### T16: Documentação do catálogo

**What**: Registrar as três capacidades na documentação pública, incluindo as duas divergências
que precisam ser explícitas para não parecerem omissão.
**Where**: `docs/design-system.md` (§ "Component catalog" — server-safe e client-only),
`README.md` (§ "shadcn/ui Components" / catálogo).
**Depends on**: T13, T14, T15
**Reuses**: seção `NativeSelect` vs. `Select` de `docs/design-system.md` como modelo do bloco
"dois componentes parecidos, propósitos declarados".
**Requirement**: R5-01 … R5-10

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] Bloco **`Sidebar` (rail de conteúdo) vs. `SidebarPanel` (casca de app)** escrito no
      mesmo formato do bloco `NativeSelect` vs. `Select` — o consumidor precisa saber qual
      importar de qual entry
- [ ] Documentado que o Toast emite `role="status"` + `aria-live` comutado, e **por que**
      `role="alert"` não aparece (A-09) — omitir isso faria parecer defeito
- [ ] Documentado que `Alert` sem `variant` é inalterado (A-13), e a tabela
      `variant → cor/ícone/role` compartilhada por `Alert` e `Toast`
- [ ] `useMediaQuery`/`createMediaQuery` listados junto aos demais behaviors/hooks
- [ ] Nenhum link quebrado; nenhuma menção a token `-soft` inexistente
- [ ] Sem changeset (só `docs/` e `README.md`, fora de `src/`)

**Tests**: none · **Gate**: Quick
**Commit**: `docs: document the app sidebar, toast and alert variants`

---

#### T17: Gate final da rodada

**What**: Verificação completa do repo, sem mudança de código.
**Where**: repo inteiro
**Depends on**: T16
**Reuses**: —
**Requirement**: todos

**Tools**: MCP: NONE · Skill: `tlc-spec-driven`

**Done when**:
- [ ] `npm run build && npm run lint:package && npm run test:coverage && npm run typecheck`
      todos verdes
- [ ] Coverage **100%** em lines/branches/functions/statements
- [ ] `tests/server-safety.test.ts` e `tests/react-barrel.test.ts` verdes **sem nenhuma edição
      no histórico da rodada** (conferir por `git log -p -- tests/server-safety.test.ts tests/react-barrel.test.ts`)
- [ ] Todos os changesets da rodada são `minor`; `package.json` `version` e `CHANGELOG.md`
      **não** foram editados à mão
- [ ] `AD-016` e `AD-017` presentes em `.specs/STATE.md` `## Decisions`
- [ ] Nenhum commit sem changeset entre os que tocam `src/`

**Tests**: none · **Gate**: Build
**Commit**: nenhum (verificação). Qualquer correção necessária vira commit próprio.

---

## Task Granularity Check

| Task | Escopo | Status |
| --- | --- | --- |
| T1: `Alert` variant | 1 componente + 1 seção CSS | ✅ Granular |
| T2: `Alert` action | 1 prop + 1 classe | ✅ Granular |
| T3: `createMediaQuery` | 1 behavior + stub de setup | ✅ Granular |
| T4: `useMediaQuery` | 1 hook + 1 export | ✅ Granular |
| T5: `SidebarProvider` | 1 provider + 1 hook (par indissociável) | ✅ Granular |
| T6: `SidebarPanel` + `SidebarTrigger` | 2 componentes acoplados pelo mesmo contexto e mesma seção CSS | ⚠️ Coeso — aceito: o trigger sem painel não é testável e vice-versa (regra de "compilation dependency": absorver para trás em vez de adiar teste) |
| T7: modos de colapso | 2 valores de 1 prop existente | ✅ Granular |
| T8: `SidebarInset` | 1 componente | ✅ Granular |
| T9: dependência | 1 entrada de manifesto | ✅ Granular |
| T10: `ToastProvider` + `useToast` | 1 provider + 1 hook + 1 seção CSS | ⚠️ Coeso — aceito: a fila, a viewport e o hook são um contrato só; separá-los produziria uma task cujo código não pode ser testado |
| T11: ação do toast | 1 opção + 1 classe | ✅ Granular |
| T12: handles | 3 métodos do mesmo hook | ✅ Granular |
| T13/T14/T15: stories | 1 arquivo cada | ✅ Granular |
| T16: docs | 2 arquivos, 1 entregável coeso | ⚠️ Coeso — aceito |
| T17: gate | verificação | ✅ Granular |

Nenhuma task ❌ — as três ⚠️ são o caso "2–3 coisas relacionadas no mesmo arquivo/entregável",
explicitamente permitido, e cada uma seria pior se dividida (produziria código sem teste na
task que o cria, que é o anti-padrão que a validação de co-location existe para impedir).

---

## Diagram-Definition Cross-Check

| Task | Depends On (corpo) | Diagrama mostra | Status |
| --- | --- | --- | --- |
| T1 | nenhuma | raiz da Fase 1 | ✅ Match |
| T2 | T1 | `T1 → T2` | ✅ Match |
| T3 | nenhuma | raiz da Fase 2 | ✅ Match |
| T4 | T3 | `T3 → T4` | ✅ Match |
| T5 | T4 | `T4 → T5` | ✅ Match |
| T6 | T5 | `T5 → T6` | ✅ Match |
| T7 | T6 | `T6 → T7` | ✅ Match |
| T8 | T7 | `T6 → … → T8` (ramo sob T6, encadeado após T7 por conflito de arquivo) | ✅ Match |
| T9 | nenhuma | raiz da Fase 4 | ✅ Match |
| T10 | T9 | `T9 → T10` | ✅ Match |
| T11 | T10 | `T10 → T11` | ✅ Match |
| T12 | T11 | `T11 → T12` | ✅ Match |
| T13 | T2 | `T2 → T13` | ✅ Match |
| T14 | T8 | `T8 → T14` | ✅ Match |
| T15 | T12 | `T12 → T15` | ✅ Match |
| T16 | T13, T14, T15 | `T13/T14/T15 → T16` | ✅ Match |
| T17 | T16 | `T16 → T17` | ✅ Match |

**Regra de `[P]` verificada:** apenas T13, T14 e T15 são `[P]` — arquivos disjuntos, sem
dependência entre si. T7/T8 e T11/T12 **não** levam `[P]` porque editam o mesmo arquivo de
componente e a mesma seção de `style.css`, mesmo com testes paralelizáveis.

---

## Test Co-location Validation

| Task | Camada criada/modificada | Matriz exige | Task diz | Status |
| --- | --- | --- | --- | --- |
| T1 | componente server-safe + CSS | unit + contrato CSS | unit | ✅ OK |
| T2 | componente server-safe + CSS | unit + contrato CSS | unit | ✅ OK |
| T3 | behavior puro | unit | unit | ✅ OK |
| T4 | hook client + entry client | unit | unit | ✅ OK |
| T5 | componente client | unit | unit | ✅ OK |
| T6 | componente client + CSS + entry client | unit + contrato CSS | unit | ✅ OK |
| T7 | componente client + CSS | unit + contrato CSS | unit | ✅ OK |
| T8 | componente client + CSS | unit + contrato CSS | unit | ✅ OK |
| T9 | manifesto | unit (contrato) | unit | ✅ OK |
| T10 | componente client + CSS + entry client | unit + contrato CSS | unit | ✅ OK |
| T11 | componente client + CSS | unit + contrato CSS | unit | ✅ OK |
| T12 | componente client | unit | unit | ✅ OK |
| T13/T14/T15 | stories | none (excluída do coverage) | none | ✅ OK |
| T16 | docs (fora de `src/`) | none | none | ✅ OK |
| T17 | nenhuma | none (gate) | none | ✅ OK |

Nenhuma ❌ VIOLATION. Nenhuma task adia teste para outra — o único caso que tentaria adiar
(`SidebarTrigger` sem `SidebarPanel`) foi resolvido por **absorção** dentro de T6, conforme a
regra de dependência de compilação.

---

## MCPs e Skills por task

- **MCP**: nenhum necessário. Todo o trabalho é edição de arquivo local, `npm` e `git`.
  Context7 **não** é necessário para Radix: a API foi verificada por inspeção do artefato
  publicado (`npm pack` de `@radix-ui/react-toast@1.2.23`), que é evidência mais forte que
  documentação.
- **Skill**: `tlc-spec-driven` em todas as tasks (obrigatória pelo Execution Protocol acima).
- **Sub-agentes**: 5 fases > 3 → a skill exige **oferecer** um worker por fase e aguardar
  confirmação do usuário antes de despachar. O Verifier no fim é automático e não é opcional.

---

## Requirement Traceability

| Requirement ID | Tasks | Status |
| --- | --- | --- |
| R5-01 | T3, T4 | Pending |
| R5-02 | T5, T6 | Pending |
| R5-03 | T5 (default), T7 | Pending |
| R5-04 | T8 | Pending |
| R5-05 | T9, T10 | Pending |
| R5-06 | T10 | Pending |
| R5-07 | T11 | Pending |
| R5-08 | T12 | Pending |
| R5-09 | T1 | Pending |
| R5-10 | T2 | Pending |

**Cobertura:** 10 requisitos, 10 mapeados, 0 sem task. Stories (T13–T15) e docs (T16) cobrem
transversalmente; T17 é o gate.
