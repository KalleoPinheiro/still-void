# Still Void Gaps — Rodada 5 (App Shell + Feedback) Validation

> **ITERAÇÃO 3 — FINAL.** Última das 3 iterações do ciclo fix→re-verify da skill
> `tlc-spec-driven`. Este arquivo **sobrescreve** o relatório da iteração 2; o histórico
> está resumido em "Progresso das três iterações". Toda AC foi re-derivada do `spec.md`
> do zero — nenhum veredito das rodadas anteriores foi herdado. Como o loop se esgota
> aqui, a seção "Gaps remanescentes" é escrita para **escalar ao usuário**, não para
> alimentar uma quarta iteração.

**Date**: 2026-08-29
**Spec**: `.specs/features/still-void-gaps-round-5-app-shell-feedback/spec.md`
**Diff range**: `3165256..9a386a0` (37 commits) · branch `claude/still-void-gaps-round-5-app-shell-feedback`
**Verifier**: sub-agente independente, fresh eyes (author ≠ verifier), read-only
**Veredito**: ❌ **FAIL — estreito.** Gate 100% verde, 63/63 ACs com evidência citável,
os 4 blockers das iterações 1–2 provadamente fechados. O FAIL vem de **5 gaps
remanescentes, todos severidade Minor**, provados empiricamente por mutantes
sobreviventes. Nenhum é bug de produção: em todos os cinco o **código está correto** e
o que falta é a asserção que impediria uma regressão futura.

---

## Progresso das três iterações

| Iteração | Violações | Gaps | Gaps de precisão | Mutantes sobreviventes | ACs com evidência |
| --- | --- | --- | --- | --- | --- |
| 1 | 4 | 13 | 8 | 3 | 38/63 |
| 2 | 1 | 6 | 12 | 6 | 44/63 |
| **3 (final)** | **0** | **1** | **4** | **6 genuínos** (de 54 válidas) | **63/63** |

### O que fechou de verdade nesta rodada de fixes (verificado por mutação, não por leitura)

| Item da iteração 2 | Commit | Prova empírica |
| --- | --- | --- |
| `aria-live` derivado de `type` sem teste discriminante | `348b004` + `d0028aa` | **M1** (remover `type={config.type}`) → 2 testes falham. **M51** (fixar `type="foreground"`) → 2 testes falham. O `test.each` em `tests/toast.test.tsx:1376-1409` inspeciona o anunciador real do Radix (`[role="status"][aria-live]`), não a chamada |
| `max` sem piso de 3, sem teste discriminante | `d0028aa` | **M2** (reintroduzir `Math.max(3, …)`) → `tests/toast.test.tsx:244` (`max={1}`) falha |
| Foco não retornava ao trigger ao fechar o drawer (bug real novo) | `7d4d84a` | **M3** (remover `onCloseAutoFocus`) → `tests/app-sidebar-panel.test.tsx:441` falha. Fix real: `SidebarContextValue.triggerRef` + `composeRefs` no trigger + restauração explícita no `Dialog.Content` |
| CSS de icon-rail colapsava mesmo com `open=true` | `f03cd9a` | **M4** e **M5** (remover `[data-state='closed']` de cada uma das duas regras) → `tests/app-sidebar-css-contract.test.ts:146` e `:157` falham. A regex do teste agora ancora o **seletor completo**, não um prefixo |
| `.sv-app-shell` não era container flex | `7fdf0d3` | **M7** (`display: flex` → `block`) → falha em CSS contract **e** em `tests/app-sidebar-inset.test.tsx:85` |
| Teste zerado em `ui-alert.test.tsx`; ícone por variante | `9a386a0`, `4945c8b` | **M50** (trocar ícone de `success`) e **M10** (trocar `role` de `warning`) → mortos |
| `AlertTitle`/`AlertDescription` com variant | `9a386a0` | `tests/ui-alert.test.tsx:207-222` |
| `--sv-space` na action do alert | `9a386a0` | `tests/ui-alert.test.tsx:314` |
| `aria-hidden` no ícone do toast | `9a386a0` | `tests/toast.test.tsx:1526` |
| Nome acessível da região do toast | `9a386a0` | **M22** (`label = ''`) → morto |
| `altText` propagado | `9a386a0` | **M9** (`altText="mutant"`) → morto; `tests/toast.test.tsx:503` |
| `icon` mode abaixo do breakpoint = offcanvas | `61ff2db` | `tests/app-sidebar-collapsible.test.tsx:47` — **parcial**, ver gap #2 |
| Inset como único filho flex abaixo do breakpoint | `9a386a0` | **M34** morto; `tests/app-sidebar-inset.test.tsx:95` — `toEqual([inset])`, não "contém" |
| Providers aninhados | `9a386a0` | `tests/app-sidebar-provider.test.tsx:341` |
| Travessia de breakpoint liberando scroll-lock | `9a386a0` | **M46** (tornar `isMobile` "grudento") → `tests/app-sidebar-provider.test.tsx:363` falha. O mock devolve a **mesma referência** de objeto com getter — evita o bug clássico do spread |

---

## Gate Check

| Comando | Resultado |
| --- | --- |
| `npm run build` | ✅ exit 0 — ESM+CJS+DTS para os dois entries, CSS copiado |
| `npm run lint:package` | ✅ exit 0 — publint "All good!", attw 🟢 em `react`, `react/client`, `package.json` |
| `npx vitest run --coverage` | ✅ exit 0 — **317 suítes, 1498 testes, 1498 passed, 0 failed, 0 skipped**. Thresholds de 100% (lines/branches/functions/statements) de `vitest.config.ts:13-18` satisfeitos |
| `npm run typecheck` | ✅ exit 0 (`tsc --noEmit`) |
| `npm run build-storybook` | ✅ exit 0 — "Storybook build completed successfully". `storybook-static/` removido depois |
| `git log 3165256..HEAD -- tests/server-safety.test.ts tests/react-barrel.test.ts` | ✅ **vazio** — nenhum dos dois testes-prova foi editado |

**Skipped**: 0. **Test count delta**: ~+330 testes nesta rodada (10 arquivos novos +
`ui-alert.test.tsx` estendido de ~40 para 257 linhas). Nenhum teste perdido: os dois
"removidos" na iteração 2 (`287dd38`, `61ff2db`) foram **substituídos** por versões
discriminantes — asserções fortalecidas, não enfraquecidas.

### Success Criteria da spec (`spec.md:500-515`)

- [x] `npm run test` verde com threshold 100% mantido
- [x] `typecheck` / `build` / `lint:package` verdes
- [x] `tests/server-safety.test.ts` passa **sem edição** (git log vazio)
- [x] `tests/react-barrel.test.ts` passa **sem edição** (git log vazio)
- [x] `tests/reduced-motion-contract.test.ts` cobre as classes novas — `.sv-app-sidebar` e
      `.sv-toast` no bloco `animation: none` (`style.css:1956-1965`), `.sv-app-sidebar-trigger`
      em `transition: none`
- [x] 12 changesets, **todos `minor`**; nenhum `CHANGELOG.md`/`version` editado à mão
- [x] Uma story por família nova: `AppSidebar.stories.tsx`, `Toast.stories.tsx`,
      `Alert.stories.tsx` estendida. Build do Storybook (com addon a11y/axe) verde

---

## Spec-Anchored Acceptance Criteria — 63 ACs

Legenda: ✅ PASS (asserção alveja o valor definido pela spec) · ⚠️ precisão (asserção existe
mas não fixa o valor exato) · ❌ GAP (sem evidência discriminante).

### R5-01 — P1 `useMediaQuery` / `createMediaQuery` (6 ACs)

| AC | Outcome da spec | `file:line` + asserção | Result |
| --- | --- | --- | --- |
| 1. expõe `getSnapshot`/`subscribe`/`destroy`; `subscribe` devolve unsubscribe | 3 métodos + retorno função | `tests/mediaQuery.test.ts:41,49` — `expect(typeof unsub).toBe('function')` | ✅ |
| 2. notifica **exatamente uma vez por transição**, nunca sem cruzar o limiar | 1 chamada por transição | `tests/mediaQuery.test.ts:66` · **M37** (`if (newMatches !== currentMatches)` → `if (true)`) **morto** | ✅ |
| 3. `destroy()` desinscreve do `MediaQueryList` | nenhum listener remanescente | `tests/mediaQuery.test.ts:95,114` · **M36** (destroy sem `detachListener`) **morto** | ✅ |
| 4. no servidor (sem `window`) devolve `false` sem lançar | `false` | `tests/hooks-media-query.test.tsx:159` (SSR) + `tests/mediaQuery.test.ts:135` · **M32** (`getSnapshot: () => true` no inerte) **morto** | ✅ |
| 5. hidrata sem warning de mismatch | zero warning do React | `tests/hooks-media-query.test.tsx:99` — spy em `console.error`, assert de ausência | ✅ |
| 6. sem `matchMedia` → controlador inerte, `subscribe` no-op | `getSnapshot()===false` | `tests/mediaQuery.test.ts:135,160` | ✅ |

### R5-02 — P1 Sidebar provider/painel/trigger (12 ACs)

| AC | Outcome da spec | `file:line` + asserção | Result |
| --- | --- | --- | --- |
| 1. `useSidebar()` expõe `{open,setOpen,toggle,isMobile,collapsible}`; fora do provider lança erro nomeado | 5 chaves + `throw` nomeado | `tests/app-sidebar-provider.test.tsx:34-39`, `:43` · **M42** (não lançar) **morto** | ✅ |
| 2. `defaultOpen={false}` fecha; controlado não muda estado sem `onOpenChange` | `open===false`; zero mudança interna | `:57`, `:86-97` · **M45** (toggle controlado mexe no estado interno sem notificar) **morto** | ✅ |
| 3. acima do breakpoint → `<aside class="sv-app-sidebar">` no fluxo, sem portal/overlay/trap | tag `ASIDE`, sem `.sv-overlay` | `tests/app-sidebar-panel.test.tsx:535-566` · **M16** (`aside`→`div`) **morto** | ✅ |
| 4. abaixo + `open` → portal, `role="dialog"`, `aria-modal="true"`, foco dentro, preso, `body` travado | os 5 estados | `:321-322` · `:411-430` (foco entra) · `:393-405` (`data-scroll-locked` presente→ausente) · **M30** **morto** | ✅ |
| 5. `Escape` fecha **e** o foco volta ao elemento que abriu | `activeElement===trigger` | `:367-390` e `:441-466` — `expect(document.activeElement).toBe(trigger)` · **M3** e **M48** **mortos** | ✅ |
| 6. clique no overlay fecha | `aria-expanded=false` | `:343-365` · **M49** (`onInteractOutside` preventDefault) **morto** | ✅ |
| 7. trigger alterna `open`, expõe `aria-expanded` e `aria-controls` = id do painel | `aria-controls === panelId` | `:94-111`, `:113-124`, `:285-305` — `toHaveAttribute('aria-controls', panelId)` · **M54** (literal falso) **morto** | ⚠️ gap #5 |
| 8. sem `children` → `<Icon name="menu"/>` + nome default `"Toggle sidebar"`, sobrescrevível | ícone `menu` + label | `:158-170` (`data-icon-name="menu"`), `:172-186`, `:188-199` · **M24** **morto** | ✅ |
| 9. `SidebarSection` existente compõe sem alteração | render inalterado | `:469-483` | ✅ |
| 10. cruzar o breakpoint com o drawer aberto → estático, sem scroll-lock nem foco órfão | `body` sem `data-scroll-locked` | `tests/app-sidebar-provider.test.tsx:363-407` · **M46** **morto** | ✅ |
| 11. `.sv-app-sidebar` usa `--sv-surface`/`--sv-border`/`--sv-space-*`, sem `box-shadow` | 3 tokens, zero shadow | `tests/app-sidebar-css-contract.test.ts:24,31,37` | ⚠️ gap #2 |
| 12. `data-state`/`data-collapsible` refletem estado; fade só `opacity` com `--sv-duration-fast`/`--sv-ease-hover`, zerado sob reduced-motion no mesmo arquivo e depois | atributos + keyframes + ordem | `provider:238-296` · `css-contract:52,62,67,73,99` · **M35** (remover `data-mobile`) **morto** | ✅ |

### R5-03 — P2 `collapsible="icon"` / `"none"` (5 ACs)

| AC | Outcome da spec | `file:line` + asserção | Result |
| --- | --- | --- | --- |
| 1. `icon` + `open=false` **acima** do breakpoint → painel no fluxo, largura de ícone, não removido da a11y | painel em fluxo | `collapsible:18-28` (só o wrapper, sem stub desktop) + `css-contract:146` (só o seletor) · **M59 SOBREVIVEU** | ❌ **GAP #1** |
| 2. rótulos visualmente ocultos, nome acessível preservado | padrão sr-only | `css-contract:157-171` · **M5** **morto** | ✅ |
| 3. `icon` **abaixo** do breakpoint = offcanvas (portal, foco preso, scroll-lock) | drawer completo | `collapsible:47-59` (role/aria-modal/overlay) · **M38/M55 SOBREVIVERAM** | ⚠️ **GAP #2** |
| 4. `none` → sempre expandido, `toggle()` no-op, `SidebarTrigger` → `null` | `null` + estado imóvel | `collapsible:73-83`, `:85-121`, `:123-146` · **M14** e **M15** **mortos** | ✅ |
| 5. `collapsible` omitido → `'offcanvas'` | string `'offcanvas'` | `collapsible:149-163`, `provider:312-321` | ✅ |

### R5-04 — P2 `SidebarInset` (4 ACs)

| AC | Outcome da spec | `file:line` + asserção | Result |
| --- | --- | --- | --- |
| 1. emite `<main class="sv-app-sidebar-inset">` | tag `MAIN` + classe | `tests/app-sidebar-inset.test.tsx:11-23` — `expect(inset?.tagName).toBe('MAIN')` · **M17** **morto** | ✅ |
| 2. lê o estado por `data-*` do wrapper, **não** por prop nem JS | zero leitura de contexto | `SidebarProvider.tsx:281-288` não chama `useSidebar` (estrutural) + `css-contract:118,146,157` | ✅ |
| 3. abaixo do breakpoint o inset ocupa a largura total | único filho flex | `inset:85-96` — `expect(Array.from(shell!.children)).toEqual([inset])` · **M7** **morto** | ✅ |
| 4. `className` do consumidor é mesclado, nunca substitui | ambas as classes | `inset:37-48` · **M34** **morto** | ✅ |

### R5-05 — P1 `ToastProvider` + `useToast` (11 ACs)

| AC | Outcome da spec | `file:line` + asserção | Result |
| --- | --- | --- | --- |
| 1. expõe `{toast,dismiss,dismissAll,toasts}`; fora do provider lança erro nomeado | 4 chaves + `throw` | `tests/toast.test.tsx:13-30` | ✅ |
| 2. toast com título+descrição dentro de `role="region"` com nome acessível | região nomeada | `:32-68`, `:421` (`getByRole('region')`) · **M22** (label vazio) **morto** | ✅ |
| 3. `danger`/`warning` → `aria-live="assertive"`; `info`/`success`/omitido → `"polite"` | valor exato de `aria-live` | `:1376-1409` — `test.each` 4×, `expect(announceEl).toHaveAttribute('aria-live', expectedAriaLive)` · **M1** e **M51** **mortos** | ✅ |
| 4. `variant` omitido → `'info'` | `data-variant="info"` | `:70-97` · **M12** (`?? 'success'`) **morto** | ✅ |
| 5. classes `sv-toast` + `sv-toast--{variant}` e ícone da severidade `aria-hidden` | 2 classes + `data-name` + `aria-hidden` | `:99-133`, `:1486-1531` · **M41** **morto** | ✅ |
| 6. `duration` default 5000 ms; valor por toast vence o do provider | 5000 exato; override | `:1244-1273` (vivo a 4999 ms, ausente a 5000 ms), `:1274-1293` · **M19** **morto** | ✅ |
| 7. ao expirar, sai de `useToast().toasts` (não só escondido) | `toasts.length` cai a 0 | `:1244-1273` | ✅ |
| 8. ponteiro **ou foco** entrando pausa; sair retoma | pausa/retoma reais | `:1295-1326` — orçamento 1000 ms, pausa em 800, avança 2000 sem dismiss, retoma e dismissa em exatos +200 ms. **Só a metade ponteiro** | ⚠️ metade "foco" (item adicional) |
| 9. botão de fechar com nome acessível `"Close"` por default, sobrescrevível | literal `"Close"` no default | `:135-161` — só com `closeLabel="Close Toast"` explícito · **M23 SOBREVIVEU** | ⚠️ **GAP #4** |
| 10. `.sv-toast` usa `--sv-z-toast`, `--sv-surface`/`--sv-border`, sem `box-shadow`; cor por `--sv-{…}-ink` | tokens exatos | `tests/toast-css-contract.test.ts:58,77,90,140` | ✅ |
| 11. fade por `[data-state]` com `--sv-duration-fast`, zerado sob reduced-motion no mesmo arquivo e depois | keyframes opacity-only + ordem | `toast-css-contract.test.ts:68,115,147` | ✅ |

### R5-06 — P1 Empilhamento e limite (5 ACs)

| AC | Outcome da spec | `file:line` + asserção | Result |
| --- | --- | --- | --- |
| 1. 3 toasts simultâneos, `toasts.length === 3` | `'3'` | `:164-198` (`:193`) | ✅ |
| 2. 4º com `max=3` remove o **mais antigo**, comprimento fica 3 | mais antigo sai, novo entra | `:200-242` (`:231`) e `:1414-1484` (M3: o antigo é **dispensado**, não truncado) | ✅ |
| 3. `max` do provider vence o default de 3 | valor do provider | `:244-275` (`max={1}`→`'1'`) e `:277-306` (`max={5}`→`'5'`) · **M2** **morto** | ✅ |
| 4. dois toasts idênticos → 2 entradas com ids distintos, sem dedupe | `length === 2` | `:355-388` · **M44** (dedupe por título) **morto** | ✅ |
| 5. `toast()` devolve `{id, dismiss, update}` | 3 campos | `:308-353` (`:350-351`) | ✅ |

### R5-07 — P2 Ação no toast (4 ACs)

| AC | Outcome da spec | `file:line` + asserção | Result |
| --- | --- | --- | --- |
| 1. botão com `label` e `altText` propagado ao primitivo | botão + `altText` real | `:461-501`, `:503-540` · **M9** **morto** | ✅ |
| 2. clique chama `onClick` **exatamente uma vez** e o toast é dispensado | `toHaveBeenCalledTimes(1)` + `length 0` | `:542-588` (`:586` → `'0'`) | ✅ |
| 3. sem `action`, nenhum botão de ação (só o de fechar) | ausência no DOM | `:590-627` | ✅ |
| 4. `altText` ausente = erro de compilação | `tsc` falha | `:629-662` + `npm run typecheck` verde com `altText: string` obrigatório (`ToastProvider.tsx:14`) | ✅ |

### R5-08 — P2 `dismiss` / `dismissAll` / `update` (4 ACs)

| AC | Outcome da spec | `file:line` + asserção | Result |
| --- | --- | --- | --- |
| 1. `dismiss(id)` remove só aquele toast | 2 → 1, o certo sai | `:707-757` (`:747`,`:753`) | ✅ |
| 2. `dismissAll()` esvazia `toasts` | `length 0` | `:759-799` (`:797`) · **M43** **morto** | ✅ |
| 3. `update(partial)` reflete campos **sem remontar** (mesmo id) e reinicia o timer | id preservado + timer reiniciado | `:801-858` (conteúdo/id) e `:1328-1374` (timer, fake timers) · **M27** (não incrementar `version`) **morto** | ✅ |
| 4. `dismiss(id)` inexistente/já dispensado = no-op silencioso | sem throw, estado igual | `:860-904` e `:906-967` | ✅ |

### R5-09 — P1 `Alert variant` (8 ACs)

| AC | Outcome da spec | `file:line` + asserção | Result |
| --- | --- | --- | --- |
| 1. **sem** `variant`: `sv-alert`, `role="alert"`, sem classe de variante, sem ícone | zero regressão | `tests/ui-alert.test.tsx:86-107` — 4 asserções, incl. `querySelector('svg')` nulo · **M33** **morto** | ✅ |
| 2. `variant="danger"` → `sv-alert` **e** `sv-alert--danger` (idem os 4) | 2 classes | `:99-107`, `:198-205` · **M33** **morto** | ✅ |
| 3. `danger`/`warning`→`role="alert"`; `info`/`success`→`role="status"` | valor exato de `role` | `:109-124` · **M10** **morto** | ✅ |
| 4. `role` derivado **vence** o `role` de props | derivado | `:126-137` e `:28-36` (caso neutro) · **M11** **morto** | ✅ |
| 5. `variant` sem `icon` → `Icon` da severidade, `aria-hidden` | `data-icon-name` exato + `aria-hidden` | `:139-167` — 4 casos · **M50** e **M58** **mortos** | ✅ |
| 6. `icon={<X/>}` substitui; `icon={null}` suprime | nó fornecido / nenhum svg | `:169-189` · **M21** **morto** | ✅ |
| 7. `.sv-alert--*` tira a cor de `--sv-{…}-ink` via custom property local; fundo `--sv-surface`; sem `box-shadow` nem token `-soft` | `--sv-alert-color` + tokens | `:297-327` (4 testes de contrato textual) | ✅ |
| 8. `AlertTitle`/`AlertDescription` seguem funcionando com variante | classes preservadas | `:207-222` | ✅ |

### R5-10 — P2 `Alert action` (4 ACs)

| AC | Outcome da spec | `file:line` + asserção | Result |
| --- | --- | --- | --- |
| 1. nó dentro de elemento `.sv-alert__action` | classe exata | `:226-237` · **M25** **morto** | ✅ |
| 2. sem `action`, nenhum `.sv-alert__action` no DOM | ausência | `:239-245` | ✅ |
| 3. `.sv-alert__action` usa `--sv-space-*`, sem `box-shadow` | escala de espaço | `:314-318` (`margin-top: var(--sv-space-3)`) e `:308-312` | ✅ |
| 4. `action` + `icon` coexistem sem sobreposição | ordem no DOM | `:247-263` | ✅ |

**Status**: 63/63 ACs com evidência `file:line` citável. **58 ✅ PASS · 4 ⚠️ precisão · 1 ❌ GAP.**

---

## Edge Cases da spec (`spec.md:432-475`)

| Edge case | Evidência | Result |
| --- | --- | --- |
| `SidebarPanel` sem provider → mesmo erro nomeado | `app-sidebar-panel.test.tsx:36-45` | ✅ |
| `breakpoint` `0`/negativo/`NaN`/`Infinity` → default 1024 | `provider:139-195` (4 testes) | ✅ |
| Dois `SidebarProvider` aninhados → o mais próximo vence | `provider:339-357` | ✅ |
| `SidebarTrigger` sem painel → alterna sem lançar | `panel:213-229` | ✅ |
| `toast()` durante unmount → no-op | `toast:1533-1553` | ✅ |
| `duration: Infinity` → persiste até dispensa explícita | usado em ~25 testes; `:1244-1273` prova o contraste com timer finito | ✅ |
| **`duration` `0` ou negativo → cai no default** | **nenhum teste** (`grep 'duration: 0\|duration: -'` → 0 hits) · **M56 SOBREVIVEU** | ❌ **GAP #3** |
| `title` e `description` ambos omitidos → toast vazio mas válido | `:390-423` | ✅ |
| `dismiss()` duas vezes no mesmo handle → 2ª é no-op | `:906-967` | ✅ |
| `max` `0`/inválido → default 3 | `:425-457` (`max={0}` → `'3'`) | ✅ |
| `variant` fora da união em runtime → neutro, sem `sv-alert--undefined`, `role="alert"` | `ui-alert:190-196` | ✅ |
| `className` + `variant` → mesclado | `ui-alert:198-205`, `:265-274` | ✅ |
| Nada novo alcançado pelo grafo de `src/react/index.ts` | `server-safety.test.ts` passa **sem edição** | ✅ |
| `prefers-reduced-motion` zera as animações novas, no mesmo arquivo e depois da base | `css-contract:73,99`; `toast-css-contract:115`; `style.css:1946-1965` | ✅ |

**12/13 edge cases cobertos.**

---

## Discrimination Sensor

**Método**: 59 mutações comportamentais injetadas em estado descartável — escrita direta
no arquivo, `npx vitest run` dos testes de escopo, `git checkout -- <arquivo>` no `finally`.
Working tree verificado limpo ao fim (`git status --short` só com os 3 untracked de `.specs/`).
**5 mutações foram descartadas como inválidas** (o mutante era semanticamente idêntico ao
original), restando **54 válidas**.

### Resultado: 54 válidas · 40 mortas · 14 sobreviveram · **6 são gaps genuínos**

#### As 4 mutações centrais desta rodada de fix — todas MORTAS

| # | File:line | Mutação | Killed? |
| --- | --- | --- | --- |
| M1 | `src/react/client/ToastProvider.tsx:247` | Remover `type={config.type}` de `Toast.Root` | ✅ Morta (2 testes) |
| M2 | `src/react/client/ToastProvider.tsx:125` | Reintroduzir `Math.max(3, Math.floor(max))` em `validatedMax` | ✅ Morta (`max={1}`) |
| M3 | `src/react/client/SidebarProvider.tsx:205-208` | Remover `onCloseAutoFocus` de `Dialog.Content` | ✅ Morta (retorno de foco) |
| M4 / M5 | `src/css/style.css:1735,1745` | Remover `[data-state='closed']` das duas regras de icon-mode | ✅ Mortas (ambas) |

#### Demais mutações mortas (36)

`M7` flex→block em `.sv-app-shell` · `M9` `altText` fixo · `M10` role de `warning` ·
`M11` role neutro cede a props · `M12` variante default `success` · `M14` trigger renderiza
em `none` · `M15` `toggle` deixa de ser no-op em `none` · `M16` `<aside>`→`<div>` ·
`M17` `<main>`→`<div>` · `M19` `duration` por toast ignorado · `M21` guarda de ícone ·
`M22` label da região vazio · `M24` label default do trigger · `M25` classe da action do
alert · `M27` `version` sem incremento · `M30` `aria-modal` removido · `M32` inerte devolve
`true` · `M33` classe de variante sempre · `M34` `className` substitui · `M35` `data-mobile`
removido · `M36` `destroy` sem detach · `M37` notifica sem transição · `M41` classe de
variante do toast · `M42` `useSidebar` não lança · `M43` `dismissAll` no-op · `M44` dedupe
por título · `M45` toggle controlado silencioso · `M46` `isMobile` grudento · `M48` `Escape`
bloqueado · `M49` clique fora bloqueado · `M50` ícone de `success` · `M51` `type` constante ·
`M52` snapshot obsoleto · `M54` `aria-controls` literal falso · `M58` ícone do alert anunciado.

#### Sobreviventes — 8 equivalentes / mutações inválidas (não são gaps)

| # | Mutação | Por que não é gap |
| --- | --- | --- |
| M6 | `slice(-validatedMax)` → `slice(0, validatedMax)` | O `useEffect` de eviction (`ToastProvider.tsx:171-178`) converge para o **mesmo estado assentado** em todo caminho; a diferença só existe no frame anterior ao efeito, que nenhum `act()` deixa observável. **Equivalente** — mas revela redundância: dois mecanismos para o mesmo requisito FIFO |
| M8 | Remover `aria-hidden="true"` do ícone do toast | `Icon` (`icon.tsx:51`) emite `aria-hidden` **depois** do spread de props, por design; o atributo é asserido em `toast.test.tsx:1526` e permanece. **Equivalente** — a prop explícita é redundante |
| M13 | Remover `Number.isNaN(breakpointProp)` da guarda | `!Number.isFinite(NaN)` já é `true`. **Equivalente** — revela condição morta em `SidebarProvider.tsx:100` |
| M39 | `setOpen` ignora controlado/não-controlado | O mutante ainda chama `onOpenChange` e o `open` da prop vence; a AC não é violada. A versão afiada (**M45**, que muda estado interno **sem** notificar) foi **morta** |
| M40 | Remover `dismiss(id)` de `handleActionClick` | `Toast.Action` do Radix já fecha o toast via `onOpenChange`; a AC R5-07.2 continua asserida e verdadeira. **Equivalente** — revela linha redundante em `ToastProvider.tsx:234` |
| M20, M47, M57 | — | **Mutações inválidas** (não alteravam comportamento); excluídas da contagem de 54 |

#### Sobreviventes — 6 mutantes = 5 gaps genuínos

| # | File:line | Mutação que passou despercebida | Gap |
| --- | --- | --- | --- |
| **M59** | `SidebarProvider.tsx:188` | `if (isMobile)` → `if (isMobile \|\| (collapsible === 'icon' && !open))` — o painel vai para o portal no desktop em icon mode | **#1** |
| **M38** | `SidebarProvider.tsx:195` | Remover `sv-app-sidebar__drawer` da classe do `Dialog.Content` | **#2** |
| **M55** | `SidebarProvider.tsx:195` | Remover `sv-app-sidebar` da classe do `Dialog.Content` | **#2** |
| **M56** | `ToastProvider.tsx:137` | `options.duration > 0` → `>= 0` (`duration: 0` passa direto, sem cair no default) | **#3** |
| **M23** | `ToastProvider.tsx:112` | `closeLabel = 'Close'` → `'Dismiss'` | **#4** |
| **M53** | `SidebarProvider.tsx:229` | Remover `id={panelId}` do `<aside>` em fluxo | **#5** |

**Sensor depth**: P0-full (54 mutações válidas, ≫ o mínimo de 5 da regra).
**Result**: 40 mortas + 8 equivalentes = **48/54 justificadas** · **6 mutantes / 5 gaps** — ❌ FAIL.

---

## `v8 ignore` Audit

Auditoria empírica: cada pragma removido individualmente, suíte com `--coverage` re-rodada
para ver se o threshold de 100% quebrava.

| `file:line` | Justificativa | Load-bearing? | Veredito |
| --- | --- | --- | --- |
| `ToastProvider.tsx:91` | `default:` de um `switch` exaustivo sobre união de tipos — inalcançável por construção do TS | ✅ Sim | **Legítimo** |
| `ToastProvider.tsx:132` | Guarda de unmount `if (!isMountedRef.current)` | ❌ **Não** — sem ele o threshold continua em 100% | ⚠️ **Redundante.** O caminho já é coberto pelo teste F9 (`toast.test.tsx:1535`). Deve sair: pragma inútil mascara cobertura real |
| `ToastProvider.tsx:174` | `if (toRemove)` dentro de `allToasts.length > validatedMax` — `allToasts[0]` é sempre definido ali | ✅ Sim | **Legítimo, mas defensivo demais.** O `if` inteiro é código morto; remover a guarda seria melhor que ignorá-la |
| `ToastProvider.tsx:228` | `entry.duration ?? duration` — `toast()` sempre resolve `duration` antes do dispatch; documentado com 6 linhas de racional | ✅ Sim | **Legítimo** (mesma família dos fallbacks `addListener`/`removeListener` de `mediaQuery.ts`) |
| `ToastProvider.tsx:242` | `if (!open)` em `onOpenChange` — `open={true}` é literal, o ramo verdadeiro nunca ocorre | ✅ Sim | **Legítimo** |
| `readingProgress.ts:11,15` | Pré-existentes, fora do diff desta rodada | — | Fora de escopo |

**Resultado**: **nenhum pragma ilegítimo novo introduzido nesta rodada de fix.** O commit
`6f9a6f7` da iteração 2 de fato aposentou os pragmas redundantes de `mediaQuery.ts` e
`hooks.ts` — verificado, nenhum resta nesses arquivos. Resta **1 pragma redundante**
(`ToastProvider.tsx:132`), Minor.

---

## Code Quality

| Princípio | Status | Nota |
| --- | --- | --- |
| Minimum code | ✅ | |
| Surgical changes | ✅ | Só `alert.tsx`, `icon.tsx` (1 linha), `hooks.ts`, `index.ts`, `style.css` + arquivos novos |
| No scope creep | ✅ | Nenhum export removido/renomeado; 12 changesets todos `minor` |
| Matches patterns | ✅ | `ThemeProvider`/`useTheme` para provider+hook; `scrollSpy`/`useScrollSpy` para behavior+hook; literais em `cn()` (A-17), sem recipes |
| Spec-anchored outcome check | ⚠️ | 4 ⚠️ + 1 ❌ (ver gaps) |
| Per-layer Coverage Expectation | ✅ | Domínio 1:1 com ACs; 100% de cobertura mantida |
| Todo teste mapeia para AC/edge case/Done-when | ⚠️ | `toast.test.tsx:1194` (`falls back to the provider duration when the toast omits one`) tem **nome enganoso**: não exercita o fallback `?? duration` do renderer (ignorado por pragma), e sim a resolução dentro de `toast()`. Renomear |
| Guidelines documentadas seguidas | ✅ | `PRODUCT.md` (No-Approximation, anti-kitchen-sink), `DESIGN.md` §4 Flat-By-Default, AD-005 (foco por outline), AD-009 (fade por `data-state`), `CONTRIBUTING.md` (changeset por mudança em `src/`) — todas verificadas por contrato textual |

Observações menores de qualidade (não são gaps de spec, não bloqueiam):

- `ToastProvider.tsx:134` usa `String.prototype.substr`, deprecado. `slice(2, 11)` é equivalente.
- `ToastProvider.tsx:127-128` + `:171-178`: dois mecanismos para o mesmo requisito FIFO (ver M6).
- `alert.tsx:48` renderiza `{props.children}` sem desestruturar `children`, então `{...props}`
  também injeta `children` no `<div>`. Funciona (o JSX explícito vence), mas é frágil o
  suficiente para merecer desestruturar.
- `SidebarProvider.tsx:100`: `Number.isNaN(breakpointProp) ||` é condição morta (ver M13).

---

## Gaps remanescentes — ranqueados (o loop de 3 iterações está esgotado)

Todos **Minor**. Em nenhum deles o produto está errado — o que falta é a asserção que
travaria uma regressão futura.

### Gap #1 — `collapsible="icon"` acima do breakpoint não tem teste de comportamento (Minor, o mais substantivo)

- **AC**: R5-03 AC-1 — *"o painel SHALL permanecer no fluxo com `data-collapsible="icon"`,
  largura reduzida à escala de ícone, e SHALL não ser removido da árvore de acessibilidade"*.
- **Causa raiz**: os dois testes que tocam icon mode acima do breakpoint checam metades
  desconexas — `tests/app-sidebar-collapsible.test.tsx:18-28` afirma `data-collapsible="icon"`
  **no wrapper** (não no painel, e sem stub de desktop), e `tests/app-sidebar-css-contract.test.ts:146`
  afirma que o **seletor CSS existe**. Nada renderiza
  `<SidebarProvider collapsible="icon" defaultOpen={false}>` com `matchMedia` em desktop e
  verifica que o painel continua um `<aside>` em fluxo.
- **Prova**: **M59** — mandar o painel para o portal quando `collapsible === 'icon' && !open`
  passou por 68 testes sem uma falha.
- **Fix sugerido**: teste em `tests/app-sidebar-collapsible.test.tsx` no molde de
  `tests/app-sidebar-panel.test.tsx:535` (stub `matches: true`), com
  `collapsible="icon" defaultOpen={false}`, assertando `container.querySelector('aside.sv-app-sidebar')`
  presente, `.sv-overlay` ausente e `role` ≠ `dialog`.

### Gap #2 — as classes do drawer nunca são asseridas no elemento renderizado (Minor)

- **AC**: R5-02 AC-11/12 e R5-03 AC-3.
- **Causa raiz**: os testes de contrato de CSS fixam os **seletores** em `style.css`
  (`.sv-app-sidebar`, `.sv-app-sidebar__drawer`, `:not(.sv-app-sidebar__drawer)`) e os testes de
  componente fixam `role="dialog"`/`aria-modal`/overlay — **nenhum junta os dois**. A junta é
  `SidebarProvider.tsx:195`: `cn('sv-app-sidebar sv-app-sidebar__drawer', className)`. Sem ela o
  drawer perderia superfície/borda, o `position: fixed` e o `animation: none` de reduced-motion —
  e o rail de icon mode passaria a se aplicar ao drawer.
- **Prova**: **M38** (remover `sv-app-sidebar__drawer`) e **M55** (remover `sv-app-sidebar`) —
  ambos sobreviveram a 37 testes.
- **Fix sugerido**: em `tests/app-sidebar-panel.test.tsx:310` (ou `collapsible:47`), acrescentar
  `expect(panel).toHaveClass('sv-app-sidebar', 'sv-app-sidebar__drawer')`.

### Gap #3 — edge case `duration` `0`/negativo → default, sem teste (Minor)

- **Edge case**: `spec.md:453-454` — *"WHEN `duration` é `0` ou negativo THEN SHALL cair no
  default em vez de sumir no mesmo frame"*.
- **Causa raiz**: nenhum teste passa `duration: 0` ou negativo. O threshold de 100% de branches
  não pega isso porque o ramo `else` do ternário em `ToastProvider.tsx:136-139` já é exercitado
  pelo caminho `typeof options.duration !== 'number'` (duration omitido).
- **Prova**: **M56** (`> 0` → `>= 0`) sobreviveu aos 41 testes de toast.
- **Fix sugerido**: junto do bloco F7 de fake timers, `toast({ title: 'Zero', duration: 0 })`
  sob `<ToastProvider duration={Infinity}>`, assertando que o toast **continua presente** após
  `advanceTimersByTimeAsync(10000)`. Um segundo caso com `duration: -1`.

### Gap #4 — default `"Close"` do `closeLabel` não é asserido (Minor)

- **AC**: R5-05 AC-9 — *"botão de fechar com nome acessível (`"Close"` por default,
  sobrescrevível via prop do provider)"*.
- **Causa raiz**: `tests/toast.test.tsx:135-161`, o único teste do botão de fechar, passa
  `closeLabel="Close Toast"` explicitamente. A metade "sobrescrevível" está coberta; a metade
  "default é `Close`" não.
- **Prova**: **M23** (`closeLabel = 'Close'` → `'Dismiss'`) sobreviveu aos 41 testes.
- **Fix sugerido**: um `<ToastProvider>` sem `closeLabel` +
  `expect(screen.getByLabelText('Close')).toBeInTheDocument()`.

### Gap #5 — `aria-controls` não é verificado como resolvível no painel em fluxo (Minor)

- **AC**: R5-02 AC-7 — *"`aria-controls` apontando para o **id do painel**"*.
- **Causa raiz**: `tests/app-sidebar-panel.test.tsx:126-139` assere apenas que o atributo é uma
  string não-vazia (`toBeTruthy()` + `/^\S+$/`), e `:285-305` compara com o `panelId` do hook —
  mas nada assere que `document.getElementById(panelId)` resolve para o painel. No caminho
  desktop em fluxo (`SidebarProvider.tsx:229`) o `id` pode sumir sem quebrar teste algum.
- **Prova**: **M53** (remover `id={panelId}` do `<aside>`) sobreviveu aos 29 testes de painel.
  *(O caminho drawer está coberto indiretamente: **M54**, com literal falso no `aria-controls`,
  foi morta por `:303`.)*
- **Fix sugerido**: no teste de desktop (`:535`), acrescentar
  `expect(document.getElementById(trigger.getAttribute('aria-controls')!)).toBe(aside)`.

### Itens adicionais (higiene, não são gaps de AC) — Minor

- **`v8 ignore` redundante** em `src/react/client/ToastProvider.tsx:132`: removível sem quebrar
  o threshold de 100%. Deve sair.
- **Teste com nome enganoso** em `tests/toast.test.tsx:1194`: renomear para refletir que valida
  a resolução de `duration` dentro de `toast()`, não o fallback `?? duration` do renderer.
- **Metade "foco" da AC R5-05.8**: `tests/toast.test.tsx:1295` cobre só `pointermove`/`pointerleave`.
  O Radix implementa a pausa também por `focusin`/`focusout` na região; um segundo teste no mesmo
  molde (`fireEvent.focusIn(region)`) fecharia a AC inteira. **Nota de justiça**: o teste de
  ponteiro que existe é dos mais discriminantes do repo — orçamento de 1000 ms, pausa em 800,
  avanço de 2000 ms sem dismiss, retomada e dismiss em exatos +200 ms.

---

## Requirement Traceability Update

| Requirement | Previous | New |
| --- | --- | --- |
| R5-01 `useMediaQuery` / `createMediaQuery` | Implementing | ✅ Verified |
| R5-02 Sidebar provider/painel/trigger | Implementing | ⚠️ Verified com ressalva (gaps #2, #5) |
| R5-03 `collapsible="icon"` / `"none"` | Implementing | ❌ Needs Fix (gaps #1, #2) |
| R5-04 `SidebarInset` | Implementing | ✅ Verified |
| R5-05 `ToastProvider` + `useToast` | Implementing | ⚠️ Verified com ressalva (gaps #3, #4, foco) |
| R5-06 Empilhamento e limite | Implementing | ✅ Verified |
| R5-07 Ação no toast | Implementing | ✅ Verified |
| R5-08 `dismiss`/`dismissAll`/`update` | Implementing | ✅ Verified |
| R5-09 `Alert variant` + `role` + ícone | Implementing | ✅ Verified |
| R5-10 `Alert action` | Implementing | ✅ Verified |

---

## Summary

**Overall**: ⚠️ **Issues — prontos para decisão humana, não para mais uma iteração automática.**

**Spec-anchored check**: 63/63 ACs com evidência · 58 PASS · 4 precisão · 1 GAP
**Sensor**: 54 mutações válidas · 40 mortas · 8 equivalentes · **6 sobreviventes = 5 gaps**
**Gate**: 1498/1498 testes · build / lint:package / typecheck / build-storybook todos exit 0
**v8-ignore**: 0 ilegítimos novos · 1 redundante (`ToastProvider.tsx:132`)

**O que funciona** (e é sólido): as três famílias fazem o que a spec pede. `aria-live` por
severidade, `max` sem piso, retorno de foco ao trigger e escopo `[data-state='closed']` do
icon-rail — os quatro blockers das duas rodadas anteriores estão fechados **com testes que
matam a mutação correspondente**, que é exatamente o padrão de prova que faltava na iteração 2.
Os testes de timer do toast (F7) e o de travessia de breakpoint estão acima da média do repo.
Zero token novo, zero `box-shadow`, zero export removido, 12 changesets `minor`,
`server-safety` e `react-barrel` intactos.

**O que falta**: cinco asserções. Nenhuma corrige comportamento — todas fecham a porta para
uma regressão futura em código que hoje está certo.

**Próximo passo**: o ciclo de 3 iterações da skill está esgotado. Os 5 gaps são todos Minor e
independentes entre si; a decisão de fechá-los agora (≈6 testes novos, 1 pragma removido, 1
teste renomeado) ou de aceitar a rodada e abrir um follow-up é **do usuário**. A branch
permanece local, sem push e sem PR.
