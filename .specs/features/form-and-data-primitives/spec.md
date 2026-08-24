# Form & Data Primitives — Specification

- **Origem:** relatório "Lacunas do `@still-void/ui`" (VittaFlow, 2026-08-22, verificado contra `@still-void/ui@2.0.1`)
- **Branch:** `claude/tlc-spec-still-void-gaps-ee7589`
- **Escopo:** Large

## Problem Statement

O VittaFlow migrou para `@still-void/ui@2.0` e descobriu duas coisas ao mesmo tempo. Primeira: o catálogo é orientado a blog — não existe `Textarea`, `Table`, `Checkbox`, `RadioGroup`, `FileInput`, nem um `<select>` nativo — então 50 call sites em ~30 arquivos reimplementam controles de formulário e tabela à mão, com uma receita local (`nativeField`) que copia a aparência do `<Input>` do pacote. Segunda, e mais grave: os componentes que a lib **exporta** também não atendiam, porque a camada shadcn é estilizada por classes Tailwind cujos tokens estão fixados em hex do tema **dark** — em `[data-theme='light']` um `<Input>` do pacote continua preto sobre página branca —, e o Tailwind config que define esses tokens nem sequer é publicado no tarball.

Ou seja: a lacuna de catálogo é só metade do problema. A outra metade é que a camada shadcn viola a lei escrita do próprio sistema (DESIGN.md §7: *"Don't require Tailwind or a specific CSS-in-JS runtime to use a component — the core is CSS variables and class-returning recipes"*) e, por isso, chega ao consumidor sem tema e sem estilo garantido. Pior: o anel de foco do `Input` e do `SelectTrigger` referencia uma cor Tailwind (`ring-accent`) que **não existe** no config do pacote — o campo fica sem indicação de foco visível, o que é falha de WCAG 2.4.7, não questão estética.

Esta spec é também, deliberadamente, o *"Button/Input pass"* que a própria `DESIGN.md:194` registra como trabalho em aberto: *"No `Button` or text `Input` primitive ships in v1 … a Button/Input pass is open work, not an oversight to paper over here."* Ou seja, não existe valor de spec canônico para campo de formulário — o que existe hoje são defaults do shadcn/Tailwind que vazaram. Definir a moldura de campo a partir das escalas de token do sistema é fechar essa lacuna, não redesenhar.

## Goals

- [ ] Fechar as 6 lacunas de catálogo com componentes **server-safe** (`@still-void/ui/react`), sem novas dependências de runtime
- [ ] Estabelecer uma **fonte única de verdade visual para campos de formulário** (receita `field()` + CSS real `.sv-field`), consumida por `Input`, `Textarea`, `NativeSelect` e `FileInput` — o que torna a receita `nativeField` local do VittaFlow deletável
- [ ] Corrigir D1: componentes da lib respondem a `[data-theme]` e `[data-accent]` em vez de ficarem travados na paleta dark
- [ ] Corrigir D2/D3/D4: distribuição da camada Tailwind (preset publicado, peer dep declarada, `shadcn-overrides.css` no tarball)
- [ ] Zero mudança de valor de token — nenhum hex, oklch, radius, easing ou passo de spacing muda (`port, don't redesign`)
- [ ] Manter os gates verdes: `vitest` com thresholds de cobertura em **100%**, `tsc --noEmit`, `publint --strict`, `attw`

## Out of Scope

| Feature | Reason |
| --- | --- |
| `Checkbox`/`RadioGroup` baseados em Radix | AD-002 — decidido nativo/server-safe. Radix reintroduziria a boundary client que o próprio relatório usou para rejeitar `Select` como substituto de `<select>` |
| Substituir ou depreciar o `Select` (Radix) existente | `NativeSelect` **coexiste**: um é campo de formulário, o outro é combobox. Nenhum export atual é removido ou renomeado |
| `DataTable` (sorting, paginação, seleção de linha, virtualização) | `Table` é apresentação. Comportamento de tabela de dados é outra feature, com outra superfície de API |
| Migrar `Dialog`, `DropdownMenu`, `Select`, `Tabs`, `Tooltip` (família client) para CSS `sv-*` | P2 desta spec cobre apenas a família server-safe. A família client fica coberta pelo fix de D1 via tokens (`var(--sv-*)`), que já a torna theme-aware, e migra em feature própria |
| Redesign visual de qualquer componente existente | `port, don't redesign` — paridade visual em dark é critério de aceite, não efeito colateral |
| Suporte a Tailwind v4 CSS-first (`@theme`/`@source`) | O repo declara `tailwindcss ^4` em devDeps mas usa config v3-style. Normalizar isso é trabalho próprio; aqui o preset é publicado no formato que já existe |
| Máscaras, validação, integração com react-hook-form / Zod | Primitivos não-controlados. Validação é do consumidor |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Estratégia de estilo dos novos componentes | CSS real `sv-*` em `style.css`, dirigido por `var(--sv-*)`, exposto por receita `field()`/`table()`. Sem Tailwind obrigatório | DESIGN.md §7 proíbe exigir Tailwind; e é o único jeito de o componente seguir `[data-theme]` sem config do consumidor | **y** — respondido pelo usuário |
| `Input` migra junto | Sim. `Input` passa a emitir `.sv-field` | Sem isso `Textarea` e `Input` divergem em light mode — exatamente a dor relatada | **y** — respondido pelo usuário |
| Valores da moldura de campo na migração do `Input` | Cada valor atual que mapeia **exatamente** para um token é preservado (altura 40px = `--sv-space-10`; raio 6px = `--sv-radius-sm`; padding 12px/8px = `--sv-space-3`/`--sv-space-2`; cores = `--sv-surface`/`--sv-border`/`--sv-text`/`--sv-text-2`). A **única** mudança de valor é `font-size`: `text-sm` do Tailwind (14px) não corresponde a nenhum token e passa a `var(--sv-text-base)` (15px) | 14px é default do Tailwind, não valor do Still Void — DESIGN.md:194 declara que não existe primitivo de campo especificado. Ancorar na escala do sistema é correção contra a spec (`patch`), não escolha estética (`major`). Mudança declarada no changeset | y — assumption registrada, **é a única mudança visual desta spec** |
| Anel de foco (D5) | `.sv-field:focus-visible` usa `outline: 2px solid var(--sv-accent-ink)` + `outline-offset: 2px`, em vez do `ring-*` do Tailwind | `ring-accent` não existe no `tailwind.config.ts` do pacote (só `sv-signal-cyan`, `sv-twilight-violet`, …), então hoje **não há foco visível**. `--sv-accent-ink` é o token que já garante contraste ≥4.5:1 nos dois temas | y — assumption registrada |
| `Checkbox`/`RadioGroup` | Nativos, server-safe, em `@still-void/ui/react` | AD-002 | **y** — respondido pelo usuário |
| Defeitos D1–D4 entram nesta feature | Sim, em fase própria, com changeset próprio (`patch`/`fix`) separado do changeset das features (`minor`) | D1 é pré-requisito: sem ele os componentes novos nasceriam com o mesmo bug | **y** — respondido pelo usuário |
| Classes utilitárias Tailwind emitidas hoje por `Input` (`h-10`, `bg-sv-surface`, …) | Não são API pública. Trocá-las por `.sv-field` é `patch`/`minor`, não `major` | CONTRIBUTING lista como `major` remover/renomear *export*, classe `sv-*` ou variável `--sv-*`. Utilitária Tailwind interna não é nenhum dos três | y — assumption registrada |
| `tailwindcss` como peer dep | `peerDependencies` + `peerDependenciesMeta.optional: true` | Obrigatória seria `major` (novo peer requerido). Após o fix de D1 a lib estiliza sem Tailwind, então opcional é literalmente verdade | y — assumption registrada |
| `RadioGroup` e propagação de `name` | `RadioGroup` aceita `name` e injeta em filhos diretos que sejam `RadioGroupItem` via `React.Children.map`/`cloneElement`; `name` explícito no item vence | Context não existe em Server Components. Repetir `name` em 3–5 itens × 3 grupos é a duplicação que o componente de grupo deveria remover. Limitação (só filhos diretos) é documentada e testada | y — assumption registrada |
| `FileInput` existe como componente próprio, em vez de só corrigir `Input type="file"` | Componente próprio | Chrome nativo do `<input type=file>` exige tratamento de padding/altura via `::file-selector-button` que quebraria a altura fixa do `Input`. Ainda assim compartilha `.sv-field` — não é decoração duplicada | y — assumption registrada |
| `Table` cobre `TableCaption` e `TableFooter` mesmo sem call site no VittaFlow | Sim, família completa | São 8 exports triviais; entregar 6 e deixar 2 força o consumidor a voltar ao `<table>` cru na primeira tabela com total no rodapé |  y — assumption registrada |
| Versão base | `package.json` está em `2.0.0` na `main`; o relatório verificou o publicado `2.0.1` (patch posterior). A ausência dos exports vale para ambas | Confirmado contra `src/react/index.ts` e `src/react/client/shadcn.ts` da árvore atual | y — verificado |
| Seção "defeitos no que ela exporta" do relatório | O texto recebido foi truncado após `file-input` e não trouxe essa seção. Os defeitos endereçados aqui (D1–D4) foram derivados por auditoria própria do repo | Registrado para que, se a seção original chegar, seja tratada como escopo adicional e não como já coberta | **n** — pendente do usuário |

**Open questions:** uma — a seção de defeitos do relatório original chegou truncada (ver última linha da tabela). Não bloqueia: D1–D4 foram levantados de forma independente, com evidência no código. Se a seção original trouxer itens novos, entram como spec incremental.

---

## User Stories

### P1: Campos de formulário nativos e coerentes ⭐ MVP

**User Story**: Como dev consumindo `@still-void/ui` num Server Component, quero `Input`, `Textarea`, `NativeSelect` e `FileInput` que compartilhem exatamente a mesma moldura visual e funcionem dentro de um `<form>` nativo, para eu parar de manter uma receita `nativeField` local que espelha o `<Input>` do pacote à mão.

**Why P1**: 30 dos 50 call sites do relatório. É a lacuna que gerou código-espelho no consumidor — a forma mais cara de dívida, porque desalinha silenciosamente a cada release da lib.

**Acceptance Criteria**:

1. WHEN o consumidor importa `Textarea`, `NativeSelect` ou `FileInput` de `@still-void/ui/react` THEN o pacote SHALL exportá-los como componentes que renderizam, respectivamente, os elementos `<textarea>`, `<select>` e `<input type="file">` — sem `'use client'`, sem hooks, sem Radix.
2. WHEN `Input`, `Textarea`, `NativeSelect` e `FileInput` são renderizados lado a lado THEN os quatro SHALL emitir a classe base `sv-field`, de forma que borda, raio, superfície, tipografia e anel de foco venham de uma única regra CSS.
3. WHEN `<NativeSelect name="x">` é renderizado dentro de um `<form>` THEN o elemento SHALL ser um `<select>` real com `name="x"`, operável por `userEvent.selectOptions` e serializado por `new FormData(form)`.
4. WHEN `<Textarea rows={6} />` é renderizado THEN o `<textarea>` SHALL receber `rows="6"` — o atributo que o `Input` não aceita e que motivou a lacuna.
5. WHEN qualquer um dos quatro recebe `className="custom"` THEN a classe SHALL ser aplicada **em adição** a `sv-field`, nunca a substituindo.
6. WHEN qualquer um dos quatro recebe `ref` THEN o ref SHALL apontar para o elemento DOM nativo correspondente (`HTMLInputElement`, `HTMLTextAreaElement`, `HTMLSelectElement`, `HTMLInputElement`).
7. WHEN qualquer um dos quatro recebe `disabled` THEN o elemento SHALL ficar desabilitado e SHALL receber tratamento visual de desabilitado pela mesma regra `.sv-field:disabled`.
8. WHEN `<FileInput accept="image/*" multiple />` é renderizado THEN o `<input>` SHALL ter `type="file"`, `accept="image/*"` e `multiple`, e o botão nativo SHALL ser estilizado via `::file-selector-button` com tokens do sistema.
9. WHEN o consumidor passa `type` para `FileInput` THEN o componente SHALL ignorar o override e permanecer `type="file"` — o componente não é um `Input` genérico disfarçado.
10. WHEN a regra `.sv-field` é inspecionada THEN cada declaração de cor, espaçamento e raio SHALL referenciar uma `var(--sv-*)` — nenhum literal hex, oklch ou pixel solto além dos que não têm token (`border-width: 1px`).
11. WHEN `Input` migrado é comparado com o anterior THEN altura (40px), raio (6px), padding (12px/8px) e as quatro cores SHALL ser idênticos em dark, e `font-size` SHALL ser o único valor alterado (14px → `var(--sv-text-base)`, 15px).
12. WHEN um campo recebe foco por teclado THEN SHALL exibir anel de foco visível de 2px em `var(--sv-accent-ink)` com offset de 2px — corrigindo D5, em que `focus-visible:ring-accent` referencia uma cor Tailwind inexistente e não pinta nada.

**Independent Test**: renderizar um `<form>` com os quatro campos, submeter via `FormData`, conferir os pares nome/valor; inspecionar `className` de cada um contendo `sv-field`; navegar por `Tab` e confirmar o anel visível nos dois temas.

---

### P1: Escolhas múltiplas sem boundary client ⭐ MVP

**User Story**: Como dev montando um formulário de prontuário renderizado no servidor, quero `Checkbox` e `RadioGroup`/`RadioGroupItem` estilizados pelo sistema, sem transformar a tela inteira em Client Component.

**Why P1**: 4 call sites, mas é primitivo básico de formulário e é onde a decisão arquitetural importa — a alternativa Radix custaria 2 dependências e uma boundary client por causa de um checkbox.

**Acceptance Criteria**:

1. WHEN `Checkbox`, `RadioGroup` e `RadioGroupItem` são importados de `@still-void/ui/react` THEN SHALL estar disponíveis sem `'use client'` e sem nenhuma dependência `@radix-ui/*`.
2. WHEN `<Checkbox name="ativo" defaultChecked />` é renderizado THEN SHALL produzir `<input type="checkbox" name="ativo">` com `checked` inicial, acessível por `getByRole('checkbox')` e alternável por `userEvent.click`.
3. WHEN `Checkbox` recebe `type` THEN SHALL permanecer `type="checkbox"`.
4. WHEN `<RadioGroup legend="Tipo de diagnóstico">` é renderizado THEN SHALL produzir um `<fieldset>` com `<legend>` contendo o texto, e o grupo SHALL ser localizável por `getByRole('group', { name: 'Tipo de diagnóstico' })`.
5. WHEN `RadioGroup` recebe `legendHidden` THEN a `<legend>` SHALL permanecer no DOM (acessível a leitor de tela) e receber a classe de ocultação visual do sistema — nunca `display:none` nem remoção do elemento.
6. WHEN `<RadioGroup name="nanda">` envolve `RadioGroupItem`s como filhos diretos THEN cada item SHALL renderizar `<input type="radio" name="nanda">`, ficando mutuamente exclusivos no mesmo `<form>`.
7. WHEN um `RadioGroupItem` declara o próprio `name` THEN esse valor SHALL prevalecer sobre o `name` do grupo.
8. WHEN um `RadioGroupItem` não é filho direto do `RadioGroup` (está dentro de um wrapper) THEN o `name` do grupo SHALL não ser injetado — comportamento documentado, e o item SHALL continuar renderizando normalmente com o `name` que ele mesmo declarar.
9. WHEN `RadioGroup` contém filhos que não são `RadioGroupItem` (texto, `null`, um `<hr>`) THEN SHALL renderizá-los inalterados, sem lançar erro.
10. WHEN `<RadioGroupItem value="real">Real</RadioGroupItem>` é renderizado THEN o `children` SHALL virar o rótulo associado ao input via `<label>`, de modo que `getByLabelText('Real')` retorne o `<input type="radio">`.
11. WHEN `RadioGroup` recebe `orientation="horizontal"` THEN SHALL aplicar o modificador de layout correspondente; o default SHALL ser vertical.

**Independent Test**: renderizar os três grupos NANDA-I/NIC/NOC num `<form>`, clicar uma opção em cada, submeter e conferir que `FormData` traz exatamente um valor por grupo.

---

### P1: Tabela de dados apresentacional ⭐ MVP

**User Story**: Como dev de uma tela de staff, quero a família `Table` do sistema, para as 12 telas pararem de repetir à mão o mesmo cabeçalho e o mesmo corpo tokenizados.

**Why P1**: maior retorno da lista — 12 arquivos replicam a mesma decoração hoje.

**Acceptance Criteria**:

1. WHEN o consumidor importa `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell` e `TableCaption` de `@still-void/ui/react` THEN os oito SHALL existir e renderizar, respectivamente, `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>`, `<td>`, `<caption>`.
2. WHEN `<Table>` é renderizado THEN o `<table>` SHALL estar envolvido por um container com rolagem horizontal, para que uma tabela larga role dentro do próprio bloco em vez de estourar a página.
3. WHEN `<Table containerClassName="h-96">` é usado THEN a classe SHALL ir para o container de rolagem e `className` SHALL continuar indo para o `<table>` — os dois alvos são endereçáveis separadamente.
4. WHEN a tabela é renderizada THEN o `<table>` SHALL sair semanticamente íntegro: `getByRole('table')`, `getAllByRole('columnheader')`, `getAllByRole('row')` e `getAllByRole('cell')` SHALL resolver.
5. WHEN cada um dos oito componentes recebe `ref` THEN o ref SHALL apontar para o elemento DOM nativo correspondente.
6. WHEN `TableCaption` é usado THEN SHALL renderizar `<caption>` como filho do `<table>`, nomeando a tabela para leitor de tela.
7. WHEN a tabela é renderizada em `[data-theme='light']` e em `[data-theme='dark']` THEN separadores, fundo de cabeçalho e cor de texto SHALL vir de `var(--sv-*)`, mudando com o tema sem nenhuma configuração do consumidor.

**Independent Test**: renderizar uma tabela de 3 colunas × 3 linhas com caption e footer; conferir os roles ARIA e que nenhuma classe utilitária Tailwind é necessária para o estilo aparecer.

---

### P1: Componentes deixam de ser cegos a tema (D1) ⭐ MVP

**User Story**: Como consumidor que renderiza `[data-theme='light']`, quero que os componentes do pacote sigam o tema, para não ter campos e cards pretos numa página branca.

**Why P1**: é a causa raiz do relatório "não atendiam aos requisitos", e é pré-requisito dos componentes novos — sem o fix, eles nasceriam com o mesmo bug.

**Acceptance Criteria**:

1. WHEN `tailwind.config.ts` é inspecionado THEN nenhuma cor do sistema SHALL estar como literal hex/oklch: cada uma SHALL referenciar a variável CSS correspondente (`'sv-surface': 'var(--sv-surface)'`, …), de modo que a troca de tema em CSS se propague.
2. WHEN o contrato de ligação é verificado THEN cada chave de cor do config SHALL referenciar uma variável que **existe** em `theme.css` (checagem cruzada entre os dois arquivos), e cada regra `sv-*` nova SHALL declarar suas cores só por `var(--sv-*)` — o que é o que faz `[data-theme]` se propagar.
   > **Emenda pós-verificação (2026-08-23).** A redação original exigia renderizar sob `[data-theme]` e afirmar a **cor resolvida** via `getComputedStyle`. Isso é inverificável no harness escolhido: jsdom nunca carrega `style.css` e não resolve `var()`, então a asserção seria teatro. A AC foi reescrita para a proposição que o harness observa de verdade — ligação e ausência de literal — que é o que efetivamente previne a regressão do D1. A checagem de **cor pintada** exige browser real e fica registrada como lacuna conhecida, candidata a um teste de Storybook/Playwright em feature própria. Falha de precisão da spec, encontrada pelo Verifier.
3. WHEN os valores das variáveis de tema são comparados antes e depois THEN `theme.css` SHALL permanecer inalterado — o fix é de *ligação*, não de valor (`port, don't redesign`).
4. WHEN os tokens TS (`src/tokens/colors.ts`) são comparados com `theme.css` THEN `tests/tokenParity.test.ts` SHALL continuar passando sem alteração no teste.
5. WHEN os aliases de cor `*-light` do Tailwind config (`sv-surface-light`, `sv-text-light`, …) deixam de ter função — porque a variável já troca sozinha — THEN SHALL ser removidos, e a remoção SHALL ser declarada como quebra no changeset se algum consumidor puder tê-los usado como utilitária.

**Independent Test**: montar uma página de teste com `data-theme` alternando, inspecionar `getComputedStyle` de um `Input` e de um `Card` nos dois estados.

---

### P2: Distribuição da camada Tailwind (D2, D3, D4)

**User Story**: Como consumidor instalando o pacote do npm, quero receber o que a documentação diz que recebo — o preset Tailwind, a folha de overrides e a declaração de peer dependency —, para não ter que copiar config de dentro do DESIGN.md à mão.

**Why P2**: depois do P1 (CSS real `sv-*`), a camada Tailwind deixa de ser obrigatória para os componentes migrados, então isso vira conveniência e correção de doc-drift — importante, mas não bloqueante.

**Acceptance Criteria**:

1. WHEN o tarball é gerado (`npm pack`) THEN SHALL conter o preset Tailwind e `shadcn-overrides.css`, hoje ausentes.
2. WHEN o consumidor faz `import stillVoidPreset from '@still-void/ui/tailwind-preset'` THEN o subpath SHALL resolver, com tipos válidos em ESM e CJS.
3. WHEN o consumidor faz `import '@still-void/ui/shadcn-overrides.css'` THEN o subpath SHALL resolver para o arquivo copiado em `dist/`.
4. WHEN `package.json` é inspecionado THEN `tailwindcss` SHALL constar em `peerDependencies` com `peerDependenciesMeta.optional: true` — refletindo que, pós-P1, os componentes migrados estilizam sem Tailwind.
5. WHEN `npm run lint:package` roda THEN `publint --strict` e `attw` SHALL passar, com os novos subpaths de CSS excluídos do `attw` como os existentes.
6. WHEN a documentação é lida THEN `README.md`, `docs/design-system.md` e `DESIGN.md` §6 SHALL descrever o estado real: quais componentes precisam de Tailwind e quais não, e como carregar o preset.

**Independent Test**: `npm pack`, extrair o tarball, conferir a lista de arquivos e resolver cada subpath num projeto limpo.

---

### P2: Restante da família server-safe migra para CSS `sv-*`

**User Story**: Como mantenedor, quero `Button`, `Card`, `Alert` e `Badge` no mesmo esquema de `Input`, para o pacote parar de ter dois modelos de estilo convivendo na mesma entry.

**Why P2**: coerência interna e remoção definitiva do lock-in em Tailwind na entry server-safe. Não bloqueia o consumidor, porque o fix de D1 já os tornou theme-aware.

**Acceptance Criteria**:

1. WHEN `Button`, `Card` (família), `Alert` (família) e `Badge` são renderizados THEN SHALL emitir classes `sv-*` com CSS real em `style.css`, sem depender de utilitárias Tailwind para a aparência base.
2. WHEN cada variante existente é renderizada (variantes de `Button`, de `Badge`, de `Alert`) THEN o conjunto de variantes e seus nomes SHALL permanecer idêntico — nenhum export, prop ou nome de variante muda.
3. WHEN qualquer um deles recebe `className` THEN SHALL compor com a classe base, não substituí-la.
4. WHEN os testes existentes (`tests/ui-button.test.tsx`, `ui-card`, `ui-alert`, `ui-badge`) rodam THEN SHALL passar sem edição — se um teste precisar mudar, é regressão de API, não migração.

**Independent Test**: rodar a suíte existente sem tocá-la; abrir o Storybook e comparar cada componente em dark e light.

---

### P3: Catálogo, documentação e release

**User Story**: Como dev que vai adotar os componentes novos, quero story no Storybook, doc atualizada e changeset descritivo.

**Why P3**: mecânico, mas é regra do repo — CONTRIBUTING exige story por componente e changeset por mudança em `src/`.

**Acceptance Criteria**:

1. WHEN um componente novo é adicionado THEN SHALL ter story em `src/react/stories/` mostrando dark/light e ao menos um accent.
2. WHEN `docs/design-system.md` é lido THEN o catálogo SHALL listar os componentes novos na tabela server-safe, e SHALL declarar explicitamente que `NativeSelect` (campo) e `Select` (combobox) coexistem com propósitos distintos.
3. WHEN os changesets são inspecionados THEN SHALL haver registros separados: `minor` para os componentes/receitas/exports novos e `patch` para as correções D1–D4, cada um escrito para o consumidor do changelog.
4. WHEN `README.md` é lido THEN a nota sobre Tailwind SHALL refletir o estado pós-migração, não o anterior.

---

## Edge Cases

- WHEN `RadioGroup` recebe `children` `null`/`undefined`/`false` THEN SHALL renderizar o `<fieldset>` vazio sem lançar.
- WHEN `RadioGroup` sem `name` envolve itens sem `name` THEN SHALL renderizar os inputs sem `name` (comportamento nativo), sem inventar um.
- WHEN `NativeSelect` é renderizado sem `<option>` THEN SHALL renderizar um `<select>` vazio, sem erro.
- WHEN `NativeSelect` recebe `multiple` THEN SHALL repassar o atributo; o estilo `.sv-field` SHALL não fixar altura de forma a quebrar o list box.
- WHEN `Table` recebe `children` diretamente sem `TableHeader`/`TableBody` THEN SHALL renderizar mesmo assim — os subcomponentes são composição, não obrigação.
- WHEN um componente novo recebe `id`, `aria-*` ou `data-*` THEN SHALL repassar para o elemento nativo sem filtrar.
- WHEN `FileInput` recebe `value` THEN SHALL repassar; o navegador rejeitar valor programático em `type=file` é comportamento nativo, não da lib.
- WHEN o consumidor carrega `style.css` mas **não** `theme.css` THEN as regras `sv-*` novas SHALL se comportar exatamente como as regras `sv-*` já existentes na mesma situação: `var(--sv-*)` sem valor resolve para o *initial value* da propriedade, sem regra de fallback própria. Não há contrato adicional a cumprir nem teste a escrever — é herança do contrato existente, e `theme.css` é documentado como obrigatório. *(Marcado como não-testável após verificação: a redação anterior prometia "fallbacks" que a folha nunca teve.)*
- WHEN `Checkbox` é usado dentro de `TableHead`/`TableCell` THEN a célula SHALL declarar `vertical-align: middle`, que é a única garantia observável no nível de CSS. *(A premissa original — "o port upstream já trata `[role=checkbox]`" — não se aplica: aquele tratamento existe para o `Checkbox` do Radix, que renderiza `button[role=checkbox]`; o nosso é `<input>` nativo, que não precisa do ajuste. Corrigido após verificação.)*

---

## Requirement Traceability

| ID | Story | Fase | Status |
| --- | --- | --- | --- |
| FDP-01 | P1: Campos nativos — `Textarea` | Design | Pending |
| FDP-02 | P1: Campos nativos — `NativeSelect` | Design | Pending |
| FDP-03 | P1: Campos nativos — `FileInput` | Design | Pending |
| FDP-04 | P1: Campos nativos — receita `field()` + `.sv-field`, fonte única | Design | Pending |
| FDP-05 | P1: Campos nativos — `Input` migra para `.sv-field` com paridade visual | Design | Pending |
| FDP-06 | P1: Escolhas — `Checkbox` nativo | Design | Pending |
| FDP-07 | P1: Escolhas — `RadioGroup` (`fieldset`/`legend`/orientation) | Design | Pending |
| FDP-08 | P1: Escolhas — `RadioGroupItem` + propagação de `name` | Design | Pending |
| FDP-09 | P1: Tabela — família de 8 componentes | Design | Pending |
| FDP-10 | P1: Tabela — container de rolagem + `containerClassName` | Design | Pending |
| FDP-11 | P1: Tabela — CSS `.sv-table*` theme-aware | Design | Pending |
| SVD-01 | P1: D1 — Tailwind config passa a referenciar `var(--sv-*)` | Design | Pending |
| SVD-02 | P1: D1 — remoção dos aliases `*-light` obsoletos | Design | Pending |
| SVD-06 | P1: D5 — anel de foco visível (`ring-accent` inexistente hoje) | Design | Pending |
| SVD-03 | P2: D2 — preset Tailwind publicado (`files` + `exports`) | Design | Pending |
| SVD-04 | P2: D3 — `tailwindcss` como peer dep opcional | Design | Pending |
| SVD-05 | P2: D4 — `shadcn-overrides.css` copiado para `dist` + subpath | Design | Pending |
| FDP-12 | P2: `Button`/`Card`/`Alert`/`Badge` migram para CSS `sv-*` | Design | Pending |
| FDP-13 | P1/P2: barrel `@still-void/ui/react` exporta tudo que é novo | Design | Pending |
| FDP-14 | P3: stories para cada componente novo | Design | Pending |
| FDP-15 | P3: docs (`design-system.md`, `README.md`, `DESIGN.md` §6) | Design | Pending |
| FDP-16 | P3: changesets separados (`minor` features / `patch` fixes) | Design | Pending |

**Coverage:** 22 requisitos, 0 mapeados a tasks ainda.

---

## Success Criteria

- [ ] O VittaFlow consegue deletar `nativeField` de `src/lib/ui.ts` e as 6 marcações `sv-gap:` correspondentes, trocando cada workaround por um import de `@still-void/ui/react`
- [ ] Nenhum novo `dependencies` no `package.json` — as 6 lacunas fecham com zero dependência de runtime adicional
- [ ] Todos os componentes novos renderizam em Server Component do Next.js sem `'use client'`
- [ ] `npm test` verde com cobertura ≥ thresholds atuais (100% em lines/branches/functions/statements)
- [ ] `npm run typecheck`, `npm run build` e `npm run lint:package` verdes
- [ ] Nenhum valor de token alterado — `tests/tokenParity.test.ts` e `tests/contrast.test.ts` passam sem edição
- [ ] Todo campo tem anel de foco visível em ambos os temas (hoje nenhum tem)
- [ ] Nenhum export existente removido ou renomeado — a release é `minor` + `patch`, não `major`
