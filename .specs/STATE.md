# STATE

## Decisions

### AD-001
- **Decision**: Componentes do pacote são estilizados por **classes `sv-*` com CSS real** em `src/css/style.css`, dirigido por `var(--sv-*)`. Classes utilitárias Tailwind não são o mecanismo de estilo base de nenhum componente.
- **Reason**: `DESIGN.md` §7 ("Don'ts") proíbe explicitamente exigir Tailwind para usar um componente. Além da lei escrita, é a única forma de o componente seguir `[data-theme]`/`[data-accent]` sem configuração do consumidor — a camada shadcn atual está travada na paleta dark porque os tokens no `tailwind.config.ts` são hex literais.
- **Trade-off**: Perde-se a colagem direta de código shadcn upstream (que vem em utilitárias). Cada componente portado exige escrever a regra CSS equivalente, e a superfície de `style.css` cresce.
- **Scope**: Todos os componentes exportados por `@still-void/ui/react` e `@still-void/ui/react/client`.
- **Date**: 2026-08-22
- **Status**: active

### AD-002
- **Decision**: Primitivos de formulário sem necessidade real de estado (`NativeSelect`, `Textarea`, `Checkbox`, `RadioGroup`, `RadioGroupItem`, `FileInput`, família `Table`) são **nativos e server-safe**, exportados de `@still-void/ui/react`. Radix só entra quando o comportamento é impossível no elemento nativo (combobox com portal, dialog, menu, tooltip, tabs).
- **Reason**: Um `<input type="checkbox">` dentro de um `<form>` com Server Actions não precisa de JS. Usar Radix ali custaria uma boundary `'use client'` e uma dependência de runtime por controle — exatamente o argumento que o relatório do VittaFlow usou para rejeitar `Select` como substituto de `<select>`. Aplicar o mesmo raciocínio a checkbox e radio é consistência, não exceção.
- **Trade-off**: Indicador de check/radio fica limitado ao que `accent-color` e pseudo-elementos permitem; não há ícone customizado. Um par Radix pode ser adicionado depois em `/react/client` com nomes distintos, sem conflito.
- **Scope**: Catálogo de componentes; decide o entry point (`/react` vs `/react/client`) de todo primitivo novo.
- **Date**: 2026-08-22
- **Status**: active

### AD-003
- **Decision**: `NativeSelect` (campo `<select>`) e `Select` (combobox Radix) **coexistem** como componentes distintos com propósitos declarados. Nenhum é depreciado em favor do outro.
- **Reason**: São contratos diferentes: um é campo de formulário serializável por `FormData` e operável por `userEvent.selectOptions`; o outro é combobox com listbox em portal e visual controlado. Forçar um a substituir o outro quebra um dos dois usos.
- **Trade-off**: Dois componentes com nome parecido no catálogo — mitigado por documentação explícita da diferença.
- **Scope**: Catálogo e documentação.
- **Date**: 2026-08-22
- **Status**: active

### AD-004
- **Decision**: Valores visuais herdados de defaults do Tailwind/shadcn (não do spec Still Void) podem ser reancorados na escala de tokens do sistema, e isso é classificado como **`patch`** (correção contra a spec), não `major`. Toda reancoragem é declarada nominalmente no changeset.
- **Reason**: `CONTRIBUTING.md` distingue "valor corrigido contra a spec = patch" de "valor mudado por escolha estética = major". `DESIGN.md:194` declara que nenhum primitivo de `Button`/`Input` foi especificado na v1 — logo os valores atuais são defaults vazados, não spec. O caso concreto é `text-sm` (14px, default do Tailwind) → `var(--sv-text-base)` (15px).
- **Trade-off**: Consumidor pode notar diferença de 1px na tipografia do campo sem um bump major avisando. Mitigado por changeset explícito.
- **Scope**: Migração da camada shadcn para CSS `sv-*`.
- **Date**: 2026-08-22
- **Status**: active

### AD-005
- **Decision**: Estado visual de foco no sistema é `outline: 2px solid var(--sv-accent-ink)` com `outline-offset: 2px` — nunca `box-shadow`, nunca as utilitárias `ring-*` do Tailwind.
- **Reason**: `box-shadow` é proibido pela Flat-By-Default Rule; `ring-*` do Tailwind é implementado com `box-shadow` e, no config atual do pacote, referencia uma cor (`accent`) que não existe — resultado: nenhum foco visível hoje, falha de WCAG 2.4.7. `--sv-accent-ink` é o token já validado para ≥4.5:1 nos dois temas.
- **Trade-off**: `outline` não acompanha `border-radius` em navegadores muito antigos; aceitável para o baseline suportado.
- **Scope**: Todos os componentes interativos e focáveis.
- **Date**: 2026-08-22
- **Status**: active

### AD-006
- **Decision**: Um componente server-safe pode expor **`as`** (union fechada de tags) **e** **`asChild`** (via `@radix-ui/react-slot`), e `@radix-ui/react-slot` passa a ser dependência **direta**. `as` cobre a troca de tag; `asChild` cobre composição arbitrária (`next/link`, componente do consumidor). Quando ambos forem passados, `asChild` vence e `as` é ignorado.
- **Reason**: Decisão do usuário em 2026-08-23, sobre a alternativa de escolher só um. Verificado antes de aceitar: `@radix-ui/react-slot@1.3.3` não tem diretiva `'use client'`, não usa nenhum hook e depende só de `@radix-ui/react-compose-refs` — logo é compatível com AD-002 e não força boundary client. Hoje o Slot já existe como transitiva (via `react-dialog`, `react-select`, `react-menu`, `react-primitive`); promovê-lo a direta remove a fragilidade de depender de uma transitiva que o Radix pode reorganizar.
- **Trade-off**: `Card` passa a ser o primeiro componente server-safe com dependência de runtime, e a superfície de API dobra em um componente que hoje só tem `className`. Exige documentar quando usar cada um. Precedência `asChild` > `as` precisa ser testada, não só documentada.
- **Scope**: Todo componente do catálogo que precise trocar o elemento renderizado.
- **Date**: 2026-08-23
- **Status**: active

### AD-007
- **Decision**: Divergência entre documentação e artefato publicado é resolvida **na direção que agrega**, quando a capacidade é genuinamente desejada. Caso concreto: `docs/design-system.md` anuncia a família `AlertDialog` e `@radix-ui/react-alert-dialog` está em `dependencies`, mas nenhum símbolo existe em `src/` — resolve-se **portando e exportando** o componente, não apagando a linha da doc.
- **Reason**: Decisão do usuário em 2026-08-23. Confirmação destrutiva é lacuna real de um design system, e o consumidor (VittaFlow) hoje usa `window.confirm` para operações destrutivas em prontuário. A dependência já está instalada e paga.
- **Trade-off**: Mais superfície de API para 0 call sites atuais. A alternativa (remover a dep) economizaria 108K de install por consumidor. Custo aceito porque a lacuna funcional é real.
- **Scope**: Catálogo; e como precedente para futuras divergências doc↔artefato.
- **Date**: 2026-08-23
- **Status**: active

### AD-008
- **Decision**: `FileInput` **mantém** o comportamento atual (`<input type="file">` visível, botão nativo via `::file-selector-button`) como default, e **ganha uma variante** para o padrão `label` + input escondido com rótulo em `children`. Nenhum consumidor quebra.
- **Reason**: Decisão do usuário em 2026-08-23. As duas abordagens são legítimas: a atual mantém o controle nativo acessível por padrão; a pedida no relatório dá controle visual total e alvo de clique maior, e é o workaround que o VittaFlow já usa.
- **Trade-off**: Mais superfície de API e mais teste para 2 call sites. O modo de input escondido exige cuidado extra de a11y — foco visível no `label` e exposição do arquivo escolhido.
- **Scope**: `FileInput`.
- **Date**: 2026-08-23
- **Status**: active — execução confirmada para a **rodada 3** (2026-08-24); fora da rodada 2

### AD-009
- **Decision**: Abrir/fechar dos componentes com portal (`Dialog`, `AlertDialog`, `Select`, `DropdownMenu`, `Tooltip`) anima com **fade mínimo**: transição de `opacity` dirigida por `[data-state="open"|"closed"]`, com `var(--sv-duration-fast)` e `var(--sv-ease-hover)`, zerada dentro de `@media (prefers-reduced-motion: reduce)`. Nada de zoom, slide ou translate.
- **Reason**: Decisão do usuário em 2026-08-24. `DESIGN.md:192` só permite motion quando ela carrega estado — abrir/fechar é exatamente isso, enquanto zoom/slide é decoração. Custo zero de regressão: as classes `animate-in`/`zoom-*`/`slide-*` que os componentes emitem hoje dependem de `tailwindcss-animate`, que **nunca esteve instalado** neste repo, logo nada anima atualmente.
- **Trade-off**: Perde-se o "feel" do shadcn upstream, que é o que a maioria dos consumidores reconhece. Em troca, ~60 linhas de keyframes a menos e uma regra de motion que o design system consegue defender.
- **Scope**: Toda camada visual de componente com estado aberto/fechado.
- **Date**: 2026-08-24
- **Status**: active

### AD-010
- **Decision**: `lucide-react` entra como **dependência direta**, e o design system expõe um componente **`Icon`** server-safe (`name` de union fechada sobre um set curado, `size`, `label`) sobre a classe `.sv-icon`. Ícone é `currentColor`, tamanho vem de `var(--sv-space-*)`, `aria-hidden` por padrão e `role="img"` + `aria-label` quando `label` é passado. Cada ícone é importado nominalmente do lucide — nunca `import * as`.
- **Reason**: Decisão do usuário em 2026-08-24, com o custo declarado na mesa (31 MB desempacotado no `node_modules` de todo consumidor). Objetivo explícito: padronizar o uso de ícones também nas aplicações consumidoras, não só dentro do pacote. `lucide-react` é o padrão de fato do shadcn, tem zero dependências e trata `react` como peer.
- **Trade-off**: 31 MB de install para quem usa só `Button` e `Card` — 300× o peso do `@radix-ui/react-alert-dialog` que o próprio intake tratou como problema. O bundle final continua ~1 KB por ícone graças ao tree-shaking, então o custo é de disco/instalação, não de runtime. `Icon` com set curado (em vez de re-export nomeado por ícone) mantém a API pública pequena: ampliar o set é `minor`, e nenhum ícone individual vira export que só sai em `major`.
- **Scope**: Camada de ícones do pacote e todo componente que precise de indicador visual.
- **Date**: 2026-08-24
- **Status**: active

### AD-011
- **Decision**: `@still-void/ui/tailwind.css` é publicado contendo **apenas** um bloco `@theme` que mapeia `--color-sv-*`, fonte, espaçamento e raio para `var(--sv-*)`. Sem `@source` e sem os aliases `--color-background`, `--color-ring`, `--color-destructive`, `--color-destructive-foreground`. O peer `tailwindcss` volta a `>=3`, seguindo opcional, e `@still-void/ui/tailwind-preset` (v3) continua exportado.
- **Reason**: Decisão do usuário em 2026-08-24. Depois de migrar a família client para CSS `sv-*`, o `dist` não emite mais nenhuma classe Tailwind — o `@source` pedido pelo relatório não teria o que varrer, e os quatro aliases existiam só por causa das classes que a migração elimina. O arquivo deixa de servir o pacote e passa a servir o **código do consumidor**, que quer `bg-sv-surface` nos componentes dele.
- **Trade-off**: Diverge do bloco literal que o relatório do VittaFlow pediu; se algum consumidor já tiver copiado aquele bloco à mão, os quatro aliases continuam do lado dele (o que é correto — são apelidos do app, não do design system).
- **Scope**: Superfície de integração com Tailwind.
- **Date**: 2026-08-24
- **Status**: active

## Handoff

- **Rodada 1 (`form-and-data-primitives`)**: concluída, Verifier PASS, **PR #10 mergeada em `main`**. PR #11 (`chore: version packages`) está aberta — mergear ela é o que publica no npm.
- **Rodada 2 (`still-void-gaps-round-2`)**: fase **Specify** concluída em 2026-08-24 — `spec.md` escrita com 40 requisitos (ICON / CLIENT / ALERT / BTN / CARD / TW), aguardando confirmação do usuário antes do Design.
- **Decisões novas desta sessão**: **AD-009** (motion: fade mínimo por `[data-state]`, sem zoom/slide), **AD-010** (`lucide-react` como dep direta + componente `Icon` com set curado), **AD-011** (`tailwind.css` só com `@theme`, sem `@source` nem aliases mortos; peer `tailwindcss` volta a `>=3`). `FileInput` (AD-008) confirmado **fora** desta rodada — vai para a rodada 3.
- **Escopo travado**, nesta ordem: (1) camada `Icon`; (2) migrar família client (`dialog`, `dropdown-menu`, `select`, `tabs`, `tooltip`) para CSS `sv-*`, fechando GAP-06/07/08; (3) família `AlertDialog` (AD-007); (4) `Button variant="accent"`; (5) `Card` com `as` **e** `asChild` (AD-006, `@radix-ui/react-slot` vira dep direta); (6) `@still-void/ui/tailwind.css` (AD-011) por último, quando o pacote já não emitir nenhuma classe Tailwind.
- **Fora do escopo da rodada 2**: `Separator`, `Progress`, `Pagination`, `FileInput`, `data-chart`; migrar `ThemeToggle`/`CopyButton` para `Icon`; remover o `tailwind-preset` v3.
- **Perguntas em aberto na spec** (não bloqueiam o Design, defaults escolhidos): default de `showCloseButton` (assumido `true`), alargar o peer `tailwindcss` para `>=3`, e renderizar indicadores nos itens de `Select`/`DropdownMenu` que hoje reservam `pl-8` para um ícone inexistente.
- **Rede de segurança**: já existem `tests/ui-dialog`, `ui-select`, `ui-tabs`, `ui-tooltip`, `ui-dropdown-menu` — mesma regra da rodada 1: teste existente que precise de edição é regressão de API, para e reporta.
- **Armadilha conhecida da rodada 1, não repetir**: contrato de CSS por substring (`toContain('.sv-card')`) não discrimina, porque `.sv-card__header` já satisfaz. Usar o parser seletor→corpo de `tests/component-css-contract.test.ts` desde o começo. E `tests/server-safety.test.ts` cobre só o grafo de `/react`; a família client vive em `/react/client` e **não** é coberta por ele.
- **Estado do repo**: árvore limpa, branch nova criada a partir de `origin/main`.
- **Blockers**: nenhum.
- **Branch**: `claude/still-void-gaps-round-2`
