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
- **Status**: active — **agendada, não incluída na rodada 2** (ver nota de conflito de escopo no intake)

## Handoff

- **Feature concluída**: `form-and-data-primitives` — ✅ Verifier rodada 2 PASS (871 testes, 100% cobertura, 11/11 mutantes mortos). Nada em aberto.
- **Próximo trabalho**: rodada 2 — `.specs/features/still-void-gaps-round-2/intake.md`. **As 6 decisões estão tomadas** (AD-006, AD-007, AD-008 + tabela no intake). Não há bloqueio: entrar direto em **Specify**.
- **Escopo travado (P0 + P1)**:
  1. GAP-06/07/08 — migrar família client (`dialog`, `dropdown-menu`, `select`, `tabs`, `tooltip`: 5 arquivos, 498 linhas, 43 exports) para CSS `sv-*`; fecha `dialog-shadow`, as classes de cor inexistentes, `dialog-close-button` e `dialog-aria-modal`
  2. GAP-02 — publicar `@still-void/ui/tailwind.css` (v4 CSS-first, `@source` + `@theme`); fazer **depois** de 1, quando o bloco `@theme` já estiver mínimo
  3. GAP-03 — portar e exportar a família `AlertDialog` (AD-007)
  4. GAP-04 — `Button variant="accent"`; trivial agora que `.sv-btn` existe com modificadores
  5. GAP-05 — `Card` com `as` **e** `asChild` (AD-006); `@radix-ui/react-slot` vira dep direta
- **Fora do escopo da rodada 2**: `Separator`, `Progress`, `Pagination`, `FileInput` (abordagem decidida em AD-008, execução adiada), `data-chart` (declarado fora)
- **Rede de segurança**: já existem `tests/ui-dialog`, `ui-select`, `ui-tabs`, `ui-tooltip`, `ui-dropdown-menu` — mesma regra da rodada 1 vale: teste existente que precise de edição é regressão de API, para e reporta
- **Armadilha conhecida da rodada 1, não repetir**: contrato de CSS por substring (`toContain('.sv-card')`) não discrimina, porque `.sv-card__header` já satisfaz. Usar o parser seletor→corpo de `tests/component-css-contract.test.ts` desde o começo. E `tests/server-safety.test.ts` já cobre o grafo de `/react` — a família client vive em `/react/client` e **não** é coberta por ele; se um componente client for movido para server-safe, o teste pega sozinho
- **Estado do repo**: árvore limpa, 39 commits em `4422b64..HEAD`, PR da rodada 1 ainda **não** aberto para `main`
- **Blockers**: nenhum
- **Branch**: `claude/tlc-spec-still-void-gaps-ee7589`
