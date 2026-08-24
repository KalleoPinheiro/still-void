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

## Handoff

- **Feature concluída**: `form-and-data-primitives` — ✅ Verifier rodada 2 PASS (871 testes, 100% cobertura, 11/11 mutantes mortos, gates verdes). Nada em aberto nela.
- **Próximo trabalho**: `.specs/features/still-void-gaps-round-2/intake.md` — **leia esse arquivo primeiro**
- **Contexto**: o documento de lacunas do VittaFlow chegou truncado na rodada 1 (cortava no meio de `file-input`). A versão completa chegou em 2026-08-23 e traz **7 itens de catálogo** e **uma seção inteira de defeitos** que a rodada 1 nunca viu. Cada item do intake foi conferido contra o código-fonte desta branch — não é reprodução da alegação.
- **Next step**: resolver as 6 decisões pendentes listadas no fim do intake, depois entrar em Specify. A sequência recomendada está no intake; o item mais urgente é **GAP-02** (consumidor em Tailwind v4 renderiza a família client sem cor, silenciosamente), e a recomendação é atacá-lo via **GAP-06** (migrar a família client para CSS `sv-*`) em vez de publicar um `@theme` que só mascara.
- **Achado que exige registro**: `@radix-ui/react-alert-dialog` está em `dependencies` com **zero** uso em `src/`, e `docs/design-system.md:134` anuncia a família `AlertDialog` como exportada. Peso morto no bundle de todo consumidor + promessa falsa na doc. A linha 134 foi reescrita pela T23 da rodada 1 e a alegação falsa passou — o cross-check de doc do Verifier não pegou. Falha de verificação da rodada 1, registrada como GAP-03.
- **Estado do repo**: árvore limpa, 39 commits em `4422b64..HEAD`, PR ainda **não** aberto para `main`
- **Blockers**: nenhum técnico; só as 6 decisões do intake
- **Branch**: `claude/tlc-spec-still-void-gaps-ee7589`
