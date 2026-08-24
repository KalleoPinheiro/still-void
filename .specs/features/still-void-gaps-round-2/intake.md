# Lacunas `@still-void/ui` — Rodada 2 (intake verificado)

- **Status:** Pronto para Specify
- **Data:** 2026-08-23
- **Origem:** documento completo "Lacunas do `@still-void/ui`" (VittaFlow, 2026-08-22, verificado contra `@still-void/ui@2.0.1`)
- **Antecedente:** `.specs/features/form-and-data-primitives/` — rodada 1, concluída e verificada (Verifier PASS, 871 testes)

## Por que existe este documento

A rodada 1 foi executada a partir de uma **versão truncada** do relatório: o texto cortava no meio da seção `file-input` e não trouxe nem os 7 itens de catálogo seguintes nem a seção inteira "Defeitos no que a `2.0.1` já exporta". Os defeitos D1–D5 que a rodada 1 corrigiu foram levantados por auditoria independente do repo, não por aquela seção.

Recebido o documento completo, cada item abaixo foi **conferido contra o código-fonte atual** desta branch (`claude/tlc-spec-still-void-gaps-ee7589`, pós-rodada 1). Nada aqui é reprodução da alegação do relatório — o que está marcado como confirmado, eu confirmei.

---

## Placar: o que a rodada 1 já fechou

| Item do relatório | Situação |
| --- | --- |
| `native-select` | ✅ entregue — `NativeSelect`, server-safe, `@still-void/ui/react` |
| `textarea` | ✅ entregue |
| `table` | ✅ entregue — família de 8 |
| `checkbox` | ✅ entregue — **nativo**, não Radix (AD-002, decisão deliberada e aprovada) |
| `radio-group` | ✅ entregue — **nativo**, não Radix (AD-002) |
| `file-input` | ⚠️ entregue com **API diferente da sugerida** — ver GAP-01 |
| `badge-hardcoded-red` | ✅ corrigido na T20 — `bg-red-500` → `var(--sv-danger)` |
| `tailwind-setup-v3-only` | ⚠️ **meio corrigido** — ver GAP-02, é o item mais urgente da lista |

Os demais 11 itens do relatório não foram tocados. Detalhados abaixo.

---

## Prioridade 0 — quebram o consumidor hoje

### GAP-02 · `tailwind-setup-v3-only` (o item mais urgente)

- **Confirmado.** A rodada 1 publicou `@still-void/ui/tailwind-preset` — um preset em **formato v3**. O relatório aponta que o consumidor está em **Tailwind v4**, que é CSS-first (`@theme`) e **não varre `node_modules` por padrão**. Um preset v3 não resolve isso.
- **Consequência prática, citando o relatório:** *"todo componente shadcn da lib renderiza sem cor — silenciosamente, sem erro de build"*.
- **Ressalva importante:** após a rodada 1, a família **server-safe** (`Button`, `Card`, `Alert`, `Badge`, `Input`, `Textarea`, `NativeSelect`, `FileInput`, `Checkbox`, `RadioGroup`, `Table`) já **não depende mais de Tailwind** — estiliza por CSS real `sv-*`. Então o dano restante está confinado à família **client** (`Dialog`, `DropdownMenu`, `Select`, `Tabs`, `Tooltip`), que ainda emite utilitárias.
- **Ação pedida pelo relatório:** publicar `@still-void/ui/tailwind.css` contendo `@source` + `@theme`, para o consumidor fazer só `@import "@still-void/ui/tailwind.css"`. Atualizar o README com instruções v4 além das v3.
- **Bloco exato que o relatório pede** (note que `--color-background`, `--color-ring`, `--color-destructive` e `--color-destructive-foreground` existem só por causa das classes mortas que **ainda restam na família client** — GAP-06 as elimina e encolhe este bloco):

```css
@source "../../node_modules/@still-void/ui/dist";

@theme {
  --color-sv-bg: var(--sv-bg);
  --color-sv-surface: var(--sv-surface);
  --color-sv-surface-2: var(--sv-surface-2);
  --color-sv-text: var(--sv-text);
  --color-sv-text-2: var(--sv-text-2);
  --color-sv-border: var(--sv-border);
  --color-sv-signal-cyan: var(--sv-accent-cyan);
  --color-background: var(--sv-bg);
  --color-ring: var(--sv-accent);
  --color-destructive: var(--sv-danger);
  --color-destructive-foreground: var(--sv-bg);
}
```

- **Decisão necessária antes de especificar:** a spec da rodada 1 declarou "suporte a Tailwind v4 CSS-first" explicitamente **fora de escopo**. Esta rodada precisa reverter isso, e há uma escolha real de sequenciamento — publicar o `tailwind.css` v4 agora, ou fazer GAP-06 primeiro (migrar a família client para CSS `sv-*`), o que torna o bloco `@theme` quase desnecessário. **Recomendo GAP-06 primeiro**: resolve a causa em vez do sintoma, e é a mesma jogada que funcionou na rodada 1.

### GAP-03 · `alert-dialog` — dependência fantasma

- **Confirmado, e é pior do que "doc desatualizada".** Verificado agora:
  - `@radix-ui/react-alert-dialog@^1.1.23` está em **`dependencies`** — dependência de runtime enviada a todo consumidor
  - **zero** ocorrências de `AlertDialog` em todo o `src/` (varredura completa, 84 arquivos)
  - `docs/design-system.md:134` anuncia `` `AlertDialog` family `` como exportada
- **Ou seja:** o pacote carrega peso morto no bundle de todo mundo, e a doc promete um componente que não existe.
- **Anotação honesta:** a linha 134 foi **reescrita pela T23 da rodada 1** e a alegação falsa passou. O cross-check de documentação do Verifier conferiu a lista client contra `src/react/client/shadcn.ts` e não pegou o `AlertDialog` a mais. Falha de verificação minha, não do relatório.
- **Decisão necessária:** exportar a família `AlertDialog` (o Radix já está pago), **ou** remover a dependência e a linha da doc. O relatório não opina. Volume no VittaFlow: 0 call sites hoje — confirmações destrutivas usam `window.confirm`.

---

## Prioridade 1 — volume alto no consumidor

### GAP-04 · `button-accent-variant`

- **~20 call sites** — o maior número da lista inteira.
- **Confirmado:** `src/components/ui/button.tsx:6` declara exatamente 6 variantes (`default | destructive | outline | secondary | ghost | link`) e nenhuma é preenchida com o accent. `default` é superfície neutra (`var(--sv-surface)`).
- **Workaround no VittaFlow:** constante `accentButton` em `src/lib/ui.ts`, passada via `className`.
- **API sugerida:** `variant="accent"` → `background: var(--sv-accent-ink)`, `color: var(--sv-bg)`, hover a 90%.
- **Nota de execução:** trivial agora. A T17 já converteu `Button` para `.sv-btn` + modificadores; é somar `.sv-btn--accent` ao CSS e um valor à union. `minor`.

### GAP-05 · `card-as-element`

- **9 call sites, em 6 arquivos.**
- **Confirmado:** `src/components/ui/card.tsx:8` renderiza `<div>` fixo, sem `asChild` nem `Slot`. Onde a superfície precisa ser `<section>` (landmark) ou `<li>` (obrigatório dentro de `<ul>`), usar `Card` apaga a semântica.
- **API sugerida:** `asChild` via `@radix-ui/react-slot`, ou prop `as`.
- **Decisão necessária:** `@radix-ui/react-slot` **não** está em `dependencies` diretas (o relatório supõe que sim, como transitiva). Adicionar dep de runtime a um componente **server-safe** merece cuidado — `Slot` é server-safe, mas uma prop `as="section" | "li"` fecha os 9 call sites com **zero** dependência nova e sem `cloneElement`. **Recomendo `as`**, coerente com AD-002.

---

## Prioridade 2 — defeitos da família client

### GAP-06 · Migrar `Dialog`, `DropdownMenu`, `Select`, `Tabs`, `Tooltip` para CSS `sv-*`

Já registrado como backlog na rodada 1; o documento completo confirma e detalha. Um único trabalho fecha quatro itens do relatório:

| Sub-item | Confirmado em |
| --- | --- |
| `dialog-shadow` — `shadow-lg` viola a Flat-By-Default Rule, que o próprio README do pacote declara | `src/components/ui/dialog.tsx:37` |
| classes de cor inexistentes (`bg-background`, `ring-ring`, `ring-accent`, `ring-offset-background`) | `dialog.tsx:20`, `select.tsx:16`, `tabs.tsx:29,44` |
| `shadow-md` / `shadow-sm` | `select.tsx:63`, `tabs.tsx:29` |
| encolhe o `@theme` do GAP-02 | consequência |

### GAP-07 · `dialog-close-button`

- **Confirmado:** `DialogClose` é re-exportado como primitivo (`dialog.tsx:11`) mas **não é renderizado dentro de `DialogContent`**. O shadcn upstream empacota um `X` com `sr-only "Close"`. Cada consumidor monta o seu.

### GAP-08 · `dialog-aria-modal`

- **Confirmado:** `DialogContent` não define `aria-modal="true"`. O relatório reconhece que a Radix marca irmãos com `aria-hidden` (equivalente para leitor de tela), mas consumidores com contrato de acessibilidade escrito sobre o atributo precisam passá-lo à mão. Relatório verificou em jsdom: `getAttribute("aria-modal")` → `null`.

---

## Prioridade 3 — catálogo faltante, volume baixo

### GAP-09 · `separator`
- ~6 call sites. Workaround: `<span className="h-px flex-1 bg-border" />`, **sem `role="separator"`** — é lacuna de a11y, não só de estilo. Server-safe, trivial.

### GAP-10 · `progress`
- 0 call sites diretos, necessidade real. O pacote exporta `ReadingProgress` (barra de leitura de artigo), **não** um `Progress` genérico com `value`/`max`. Escores PUSH (0–17), DET (0–15) e escala de dor (0–10) são barras conceituais. Server-safe via `<progress>` nativo ou `div[role=progressbar]`.

### GAP-11 · `pagination`
- 1 padrão replicado. Hoje só existe "Carregar mais" (`Button variant="outline"`). Listas de auditoria e faturamento pedem paginação numerada conforme crescem.

### GAP-01 · `file-input` — API divergente da sugerida
- **Entregue na rodada 1**, mas com desenho diferente. O relatório pede: *"`FileInput` que encapsule exatamente esse padrão (`label` + `input` escondido) e exponha `accept`, `disabled`, `onChange` e o rótulo como children"* — porque o workaround do VittaFlow é `<input type="file" className="hidden">` dentro de `<label>` estilizado como botão.
- **O que foi entregue:** `<input type="file">` visível, com o botão nativo estilizado via `::file-selector-button`.
- **Avaliação honesta:** as duas abordagens são defensáveis. A entregue é mais simples e mantém o controle nativo acessível por padrão; a pedida dá controle visual total e um alvo de clique maior. **Só 2 call sites.** Vale confirmar com o consumidor antes de mexer — pode ser que a entregue já sirva.

### GAP-12 · `data-chart`
- O próprio relatório marca como baixa prioridade: *"é o item mais específico do domínio clínico desta lista e o que menos se generaliza"*. 1 componente de 250 linhas que já usa os tokens certos nas séries. **Recomendo não fazer** — um primitivo de gráfico genérico é feature própria, com escopo próprio, e não é o que este pacote é.

---

## Sequência recomendada

1. **GAP-06** (migrar família client para CSS `sv-*`) — resolve `dialog-shadow`, as classes mortas restantes, e encolhe o problema do GAP-02 na causa
2. **GAP-07 + GAP-08** — na mesma passada pelo `Dialog`
3. **GAP-02** (`tailwind.css` v4 CSS-first) — depois do 1, quando o `@theme` for mínimo
4. **GAP-03** (`alert-dialog`) — decisão binária, execução curta
5. **GAP-04** (`variant="accent"`) e **GAP-05** (`as` no `Card`) — maior volume no consumidor, custo baixo
6. **GAP-09/10/11** (`Separator`, `Progress`, `Pagination`) — catálogo, server-safe, baratos
7. **GAP-01** — só se o consumidor confirmar que precisa
8. **GAP-12** — recomendo declarar fora de escopo

## Decisões pendentes do usuário (bloqueiam a Specify)

| # | Decisão | Recomendação |
| --- | --- | --- |
| 1 | `AlertDialog`: exportar ou remover a dependência? | Sem opinião forte — 0 call sites hoje. Remover é mais honesto; exportar é barato já que o Radix está pago |
| 2 | `Card`: `asChild` via `@radix-ui/react-slot`, ou prop `as`? | **`as`** — fecha os 9 call sites sem dependência nova, coerente com AD-002 |
| 3 | Ordem: migrar família client antes ou publicar `tailwind.css` v4 antes? | **Família client antes** — causa, não sintoma |
| 4 | `FileInput`: refazer no padrão `label` + input escondido? | Confirmar com o consumidor primeiro — 2 call sites |
| 5 | `data-chart` entra? | **Não** — declarar fora de escopo |
| 6 | Um único ciclo de spec, ou dividir defeitos (`patch`) e catálogo (`minor`)? | Uma spec, fases separadas e changesets separados — foi o que funcionou na rodada 1 |
