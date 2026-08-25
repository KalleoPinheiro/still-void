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
- **Status**: superseded by AD-013 (a premissa de que o `lucide-react` era server-safe não se sustentou)

### AD-011
- **Decision**: `@still-void/ui/tailwind.css` é publicado contendo **apenas** um bloco `@theme` que mapeia `--color-sv-*`, fonte, espaçamento e raio para `var(--sv-*)`. Sem `@source` e sem os aliases `--color-background`, `--color-ring`, `--color-destructive`, `--color-destructive-foreground`. O peer `tailwindcss` volta a `>=3`, seguindo opcional, e `@still-void/ui/tailwind-preset` (v3) continua exportado.
- **Reason**: Decisão do usuário em 2026-08-24. Depois de migrar a família client para CSS `sv-*`, o `dist` não emite mais nenhuma classe Tailwind — o `@source` pedido pelo relatório não teria o que varrer, e os quatro aliases existiam só por causa das classes que a migração elimina. O arquivo deixa de servir o pacote e passa a servir o **código do consumidor**, que quer `bg-sv-surface` nos componentes dele.
- **Trade-off**: Diverge do bloco literal que o relatório do VittaFlow pediu; se algum consumidor já tiver copiado aquele bloco à mão, os quatro aliases continuam do lado dele (o que é correto — são apelidos do app, não do design system).
- **Scope**: Superfície de integração com Tailwind.
- **Date**: 2026-08-24
- **Status**: active

### AD-012
- **Decision**: A superfície Tailwind do pacote é **v4-only**. `peerDependencies.tailwindcss` passa de `>=3 <4` para **`>=4`** (seguindo opcional), e `@still-void/ui/tailwind-preset` é **removido** — junto com `src/tailwind-preset.ts`, sua entry em `tsup.config.ts`, o `typesVersions` correspondente e a raiz `tailwind.config.ts`. A rodada 2 publica **`v3.0.0`**.
- **Reason**: Decisão do usuário em 2026-08-24: lib e consumidores ficam sempre em Tailwind v4+. O preset é formato v3 e o v4 **ignora** `corePlugins.preflight` — mantê-lo exportado sob peer v4 seria publicar uma armadilha, porque carregá-lo num app v4 reativa o Preflight e briga com `style.css`. O repo já usa `tailwindcss ^4.3.3` em devDependencies, então o lado da lib só precisa parar de carregar o artefato v3.
- **Trade-off**: Consumidor em Tailwind v3 fica preso na linha `2.x`. Estreitar peer e remover export são as duas formas canônicas de `major` segundo o CONTRIBUTING, então a rodada deixa de ser `patch`+`minor` e vira `v3.0.0`. Efeito colateral: `tests/tailwind-config-contract.test.ts` inteiro e os blocos de preset em `tests/package-contract.test.ts` são apagados — única exceção autorizada à regra de que editar teste existente é regressão de API, porque aqui a remoção da API **é** a decisão.
- **Scope**: Integração com Tailwind, faixa de peers e política de versionamento da rodada 2.
- **Date**: 2026-08-24
- **Status**: active

### AD-013
- **Decision**: A biblioteca de ícones do design system é **`@heroicons/react`** (dependência direta), não o `lucide-react`. O componente `Icon` e o set curado decididos no AD-010 permanecem exatamente como estão — muda só a origem da geometria. Cada ícone é importado nominalmente de `@heroicons/react/24/outline`; a grade `24/outline` é a família única e o tamanho vem sempre do CSS. O indicador de rádio do `DropdownMenu` é um círculo em CSS, porque o set não tem um ponto na grade certa.
- **Reason**: Decisão do usuário em 2026-08-24, depois que o research reprovou o `lucide-react`. Verificado por inspeção do tarball publicado: `lucide-react@1.34.0` marca `dist/esm/Icon.mjs` e `dist/esm/context.mjs` com `'use client'` e todo ícone passa por `createLucideIcon → Icon → useLucideContext`, o que colocaria um boundary client dentro do entry server-safe e contrariaria o AD-002. A última 0.x sem esse problema (`0.577.0`) é de 2026-03-04 e a linha está parada. `@heroicons/react@2.2.0` foi varrida do mesmo jeito: zero `'use client'`, zero hook, `stroke="currentColor"`, `aria-hidden="true"` por padrão, `title`/`titleId` para nome acessível e **sem prop `size`** — o tamanho é obrigatoriamente CSS, que é o que a spec já exigia.
- **Trade-off**: Sai do set default do shadcn, então exemplo de código copiado de fora vai citar ícone que o nosso set não tem — mitigado por `Icon` aceitar substituição via prop `icon` nos pontos de indicador. Em troca: 3,7 MB em vez de 31 MB, e server-safety garantida por inspeção, não por confiança.
- **Scope**: Camada de ícones e qualquer componente que renderize indicador visual.
- **Date**: 2026-08-24
- **Status**: active

### AD-014
- **Decision**: A regra "teste existente que precise de edição é regressão de API, para e reporta" (CLIENT-12) **cede** a CLIENT-01 exatamente quando a asserção do teste antigo verifica o **mecanismo Tailwind em si** (uma string literal de utilitária ou de sintaxe arbitrária) em vez do **comportamento** que ele produzia. Nesse caso, e só nesse caso, a asserção é **reescrita** para checar o marcador `sv-*` equivalente — nunca apagada, nunca enfraquecida — e a substituição é documentada explicitamente no corpo do commit.
- **Reason**: Confirmado duas vezes na rodada 2 — `tests/ui-select.test.tsx` afirmava `toContain('data-[side=bottom]:translate-y-1')` e `toContain('h-[var(--radix-select-trigger-height)]')`; `tests/ui-dropdown-menu.test.tsx` afirmava `toHaveClass('pl-8')`. Nos dois casos nenhuma implementação correta satisfaz CLIENT-01 (zero utilitária Tailwind emitida, o objetivo central da rodada) e a leitura literal de CLIENT-12 ao mesmo tempo — a string que o teste procura é exatamente a que a migração existe para eliminar. Decisão do usuário em 2026-08-25 para o primeiro caso (Select); o segundo (DropdownMenu) foi resolvido pelo mesmo critério, sem reperguntar, por ser estruturalmente idêntico.
- **Trade-off**: Abre uma exceção nomeada a uma regra que a rodada 1 tratou como absoluta. Mitigado por três amarras: (1) só vale quando o comportamento real é **preservado** em CSS (o nudge de 4px e o casamento de largura viraram `.sv-pop--popper[data-side]`; o recuo do `inset` virou `.sv-menu-item--inset`) — nunca é desculpa para remover funcionalidade; (2) a asserção nova prova o **mesmo fato** que a antiga provava, só que pelo nome novo; (3) toda ocorrência é citada no commit, nunca silenciosa.
- **Scope**: Migração da família client para CSS `sv-*`; precedente para qualquer teste futuro que pine sintaxe Tailwind como mecanismo de verificação.
- **Date**: 2026-08-25
- **Status**: active

## Handoff

- **Rodada 1 (`form-and-data-primitives`)**: concluída, mergeada em `main` (PR #10). PR #11 (`chore: version packages`) segue aberta — mergear é o que publica no npm.
- **Rodada 2 (`still-void-gaps-round-2`)**: Specify, Design e Tasks concluídos. **Execute em andamento — Fases 1–4 de 7 concluídas (T1–T14 + T24)**, branch `claude/still-void-gaps-round-2`.
  - Fase 1 (Ícones): `Icon` server-safe + `@heroicons/react` + `.sv-icon` + `server-safety` endurecido contra terceiros — commits `f6697a9 67a85ce 413bb14 dae8d9c`
  - Fase 2 (CSS primitivas): `.sv-overlay/.sv-dialog/.sv-pop/.sv-menu-item/.sv-tabs` — commits `d2cc02a 1d31a62 6743cd5 12a8253`
  - **T24** (fora do plano original, achado real): cascata de `prefers-reduced-motion` corrigida — `theme.css` escrevia a regra de `reduce` numa folha que carrega **antes** de `style.css`, então perdia a cascata; 5 classes já publicadas na v2 nunca respeitaram `prefers-reduced-motion`. Commit `42e94a6`
  - Fase 3 (Dialog/Tabs/Tooltip): commits `11f01f3 d79d552 d324c46 d7cbf56`. Botão de fechar do Dialog usa texto **`Close dialog`** (não `Close` — colidia com o fixture do teste protegido, ver AD-014-adjacente)
  - Fase 4 (Select/DropdownMenu): commits `b57e1a7 c101242 1845a11`. Corrigido também: `SelectItem` sem `ItemText` deixava o trigger em branco após selecionar (defeito real de v2, não achado pelo intake); polyfill de `scrollIntoView` em `tests/setup.ts` (gap de jsdom, não do componente)
  - **AD-014** registrada: quando um teste protegido pina **sintaxe Tailwind literal** como mecanismo de verificação (não comportamento), CLIENT-12 cede a CLIENT-01 — reescreve a asserção para o marcador `sv-*` equivalente, nunca apaga. Aconteceu 2x (Select popper, DropdownMenu `pl-8`); provável que se repita nas fases 6/7 (`ui-button.test.tsx`, `ui-card.test.tsx`)
  - **T25 e T26 agendadas** (achados da Fase 3, não bloqueiam): displayName `undefined` em todo componente derivado do Radix; `.sv-tabs` existe no CSS e nenhum componente emite
- **Suíte agora**: 1014 testes (era 871 no início da rodada), cobertura 100% nas 4 métricas, `npm run build && npm run lint:package && npm run typecheck` verdes
- **Próximo passo**: Fase 5 — `T15` (`AlertDialog`) e `T16` (exportar + cross-check doc↔barrel), dependem de T9 (Dialog, já pronto)
- **Rede de segurança**: `tests/ui-dialog.test.tsx`, `ui-tabs.test.tsx`, `ui-tooltip.test.tsx` seguem **intactos** (verificado por `git diff --stat`); `ui-select.test.tsx` e `ui-dropdown-menu.test.tsx` têm edição **autorizada e documentada** via AD-014 — não é regressão silenciosa
- **Blockers**: nenhum
- **Branch**: `claude/still-void-gaps-round-2`
