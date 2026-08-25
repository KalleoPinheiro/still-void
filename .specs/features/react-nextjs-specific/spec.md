# React/Next.js-Specific Design System — Specification

## Problem Statement

`@still-void/ui` hoje é agnóstico de framework: core puro (tokens/recipes/behaviors em TS+CSS) + adapter React opcional (`/react`, `/react/client`). Isso duplica superfície de API (core + React), trava evolução dos componentes shadcn/ui recém-portados (que já assumem React/Radix) e não reflete o uso real — todo consumidor conhecido é React ou Next.js. A proposta: eliminar a camada agnóstica como API pública e reposicionar o pacote como design system **React/Next.js-first**, com split client/server explícito, mantendo tokens visuais e componentes shadcn intactos.

## Goals

- [ ] Remover core agnóstico (`.` entry point: tokens/recipes/behaviors framework-agnostic) da API pública
- [ ] Consolidar API pública em dois entry points: `@still-void/ui/react` (server-safe) e `@still-void/ui/react/client` (`'use client'`)
- [ ] Preservar 100% dos valores visuais (cores, tipografia, spacing, motion, `.sv-gradient-border`) — zero mudança de design
- [ ] Preservar todos os componentes shadcn/ui existentes e seu split client/server atual
- [ ] Publicar breaking change como major version (Changesets) em branch nova
- [ ] Documentação nova do design system (uso, tokens, componentes, princípios) + guia de migração completo para consumidores

## Out of Scope

| Feature | Reason |
| --- | --- |
| Suporte a Vue/Angular/vanilla | Eliminado por decisão de produto — não é mais objetivo do pacote |
| Reescrita visual/redesign de componentes | "Port, don't redesign" continua valendo — só muda organização de API, não tokens/estilo |
| Reescrita dos componentes shadcn existentes | Decisão do usuário: só reestrutura exports/entry points, componentes shadcn ficam como estão |
| Nova build tool / bundler | tsup permanece |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Core agnóstico é removido totalmente (não fica interno) | Remove `tokens/recipes/behaviors` do entry `.` público; internamente tokens/recipes continuam existindo como implementação usada pelos componentes React, mas deixam de ser export público standalone | Usuário confirmou "remove total" | y |
| Nome do pacote | Mantém `@still-void/ui`, bump major | Usuário confirmou | y |
| Nome da branch | `feature/react-nextjs-specific`, a partir de `feature/shadcn-theme-integration` (branch atual) | Pedido explícito do usuário | y |
| Componentes shadcn existentes | Só reestrutura exports/entry points, sem reescrever | Usuário confirmou | y |
| `peerDependencies.react` deixa de ser opcional | Vira obrigatório (`react`/`react-dom` sempre exigidos) | Pacote deixa de suportar uso sem React | y — decorre diretamente do escopo pedido |
| `main`/`module`/`types` (entry `.`) | Passa a apontar para o mesmo conteúdo de `./react` (ou é removido e `.` vira erro de import) | Consumidores que hoje importam de `@still-void/ui` direto (sem `/react`) quebram — documentado no guia de migração | y — assumption, ver Edge Cases |
| CSS entries (`./theme.css`, `./style.css`) | Mantidos como estão — CSS não é framework-specific, continua sendo a mesma folha de estilo | Sem motivo para quebrar distribuição de CSS | y |
| Tokens TS (cores, tipografia etc.) usados por consumidores para lógica (não só estilo) | Ficam re-exportados a partir de `@still-void/ui/react` (e `/react/client` onde fizer sentido), não mais do entry `.` | Consumidor React ainda precisa de `ThemeMode`, `AccentName` etc. — hoje já parcialmente re-exportado em `/react` | y |
| Versionamento | Major bump (breaking change), changeset já criado para minor anterior (shadcn) permanece intocado; novo changeset nesta feature declara major | Regra do CONTRIBUTING.md: remover/renomear export é major | y |

**Open questions:** nenhuma — todas resolvidas ou registradas acima.

---

## User Stories

### P1: Import único React-first ⭐ MVP

**User Story**: Como dev React/Next.js consumindo `@still-void/ui`, quero importar tudo (tokens, recipes, componentes) a partir de `@still-void/ui/react` ou `@still-void/ui/react/client`, sem precisar saber que existiu um core agnóstico.

**Why P1**: É o core da mudança de posicionamento — sem isso não há breaking change coerente.

**Acceptance Criteria**:

1. WHEN um consumidor importa de `@still-void/ui/react` THEN o pacote SHALL expor tokens, tipos, recipes server-safe e todos componentes shadcn server-safe existentes.
2. WHEN um consumidor importa de `@still-void/ui/react/client` THEN o pacote SHALL expor os behaviors client-side (theme manager, scroll spy, reading progress, clipboard) e componentes shadcn client-only existentes.
3. WHEN um consumidor tenta importar de `@still-void/ui` (entry `.`, sem subpath) THEN o build SHALL falhar de forma clara (erro de módulo não encontrado / export map sem `.`), não um import silenciosamente vazio.
4. WHEN o pacote é buildado (`npm run build` + `lint:package`) THEN `publint --strict` e `attw` SHALL passar sem erros para os entries `./react`, `./react/client`, `./theme.css`, `./style.css`.

**Independent Test**: Instalar o pacote buildado num app Next.js de exemplo, importar de `@still-void/ui/react` e `@still-void/ui/react/client`, renderizar sem erro de hidratação; confirmar que `import from '@still-void/ui'` falha no bundler.

---

### P1: Zero regressão visual ⭐ MVP

**User Story**: Como consumidor existente, quero que o resultado visual renderizado (cores, tipografia, spacing, `.sv-gradient-border`, dark/light + accent) seja idêntico ao anterior à mudança.

**Why P1**: "Port, don't redesign" — quebra de API não pode virar quebra de design.

**Acceptance Criteria**:

1. WHEN os testes visuais/Storybook existentes rodam contra os componentes pós-mudança THEN SHALL produzir as mesmas classes/valores de tokens que antes (sem diffs de cor/spacing/motion).
2. WHEN `theme.css`/`style.css` são comparados antes/depois THEN SHALL ser byte-idênticos (a menos de mudanças de caminho de build).

**Independent Test**: Rodar Storybook, inspecionar visualmente os componentes portados; diff de CSS gerado antes/depois da mudança.

---

### P2: Documentação do design system

**User Story**: Como dev novo no time consumindo o pacote, quero uma doc central explicando arquitetura (server vs client), tokens, princípios de design e catálogo de componentes, sem precisar ler o código-fonte.

**Why P2**: Necessário para adoção, mas não bloqueia a quebra técnica em si.

**Acceptance Criteria**:

1. WHEN um dev abre a documentação do design system THEN SHALL encontrar: visão geral da arquitetura React/Next (server vs client), lista de tokens com propósito de cada um, catálogo de componentes com exemplo de import.
2. WHEN um componente client-only existe THEN a doc SHALL indicar explicitamente que requer `'use client'` / entry `/react/client`.

**Independent Test**: Revisão manual da doc cobrindo cada componente e token exportado.

---

### P2: Guia de migração para consumidores

**User Story**: Como mantenedor de um projeto consumidor já usando a versão anterior (agnóstica), quero um guia passo-a-passo de migração para a versão nova.

**Why P2**: Necessário para não quebrar consumidores existentes sem caminho de upgrade.

**Acceptance Criteria**:

1. WHEN o guia de migração é lido THEN SHALL listar todos exports removidos do entry `.` e onde encontrá-los agora (`/react` ou `/react/client`).
2. WHEN o consumidor segue o guia THEN SHALL conseguir migrar sem alterar tokens/CSS (só imports).
3. WHEN o consumidor usava o core fora de React (Vue/Angular/vanilla) THEN o guia SHALL declarar explicitamente que não há caminho de migração — pacote não suporta mais esse uso — e sugerir fixar na versão anterior.

**Independent Test**: Seguir o guia manualmente num projeto fictício migrando de v1 para v2.

---

### P3: Changeset major documentado

**User Story**: Como mantenedor, quero um changeset descrevendo a breaking change para o changelog.

**Why P3**: Mecânico, mas necessário para o pipeline de release existente.

**Acceptance Criteria**:

1. WHEN `npm run changeset` gera o registro THEN SHALL declarar bump `major` com descrição da remoção do core agnóstico.

---

## Edge Cases

- WHEN o entry `.` é totalmente removido do `exports` map THEN bundlers modernos (webpack/Vite/Next) SHALL reportar erro de resolução de módulo — comportamento aceito e documentado (não um fallback silencioso).
- WHEN um tipo hoje só exportado pelo core (ex: algum token não re-exportado em `/react`) for necessário por componente React THEN SHALL ser adicionado ao re-export de `/react` antes de remover o core (auditoria de paridade obrigatória na fase de Design).
- WHEN `main`/`module`/`types` de nível de pacote (fora do `exports` map, usados por resolução legada) apontam pro antigo `dist/index.*` THEN SHALL ser removidos ou redirecionados — se ficarem apontando pra um build que não existe mais, quebra resolução legada silenciosamente; isso é tratado na fase de Design.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| RNS-01 | P1: Import único React-first | Execute | ✅ Verified — `src/react/index.ts` re-exporta os 6 módulos de token + 4 de recipe + types |
| RNS-02 | P1: Import único React-first | Execute | ✅ Verified — `src/react/client/index.ts` re-exporta themeManager/scrollSpy/readingProgress/clipboard |
| RNS-03 | P1: Import único React-first | Execute | ✅ Verified — `src/index.ts` removido, `exports["."]`/`main`/`module`/`types` de topo removidos do `package.json` |
| RNS-04 | P1: Import único React-first | Execute | ✅ Verified — `npm run lint:package` (`publint --strict` + `attw`) verde em `./react`, `./react/client`, css, `package.json` |
| RNS-05 | P1: Zero regressão visual | Execute | ✅ Verified — tokens/recipes intocados, só paths de re-export; `npm test` 171/171 (inclui `tokenParity.test.ts`, `contrast.test.ts`) |
| RNS-06 | P1: Zero regressão visual | Execute | ✅ Verified — `scripts/copy-css.mjs` inalterado, `theme.css`/`style.css` copiados verbatim |
| RNS-07 | P2: Documentação do design system | Execute | ✅ Verified — `docs/design-system.md` escrito, com tabela server/client por componente |
| RNS-08 | P2: Documentação do design system | Execute | ✅ Verified — idem RNS-07 (arquitetura + tokens + catálogo cobertos) |
| RNS-09 | P2: Guia de migração | Execute | ✅ Verified — `docs/migration-v1-to-v2.md`, mapa completo antigo→novo |
| RNS-10 | P2: Guia de migração | Execute | ✅ Verified — seção "What did not change" no guia de migração |
| RNS-11 | P2: Guia de migração | Execute | ✅ Verified — seção "If you can't migrate yet" (path explícito pra quem não usa React) |
| RNS-12 | P3: Changeset major | Execute | ✅ Verified — `.changeset/react-nextjs-only.md`, `"@still-void/ui": major`, publicado como `2.0.0` |

**Coverage:** 12 total, 12 mapeados e verificados, 0 unmapped.

**Verificado**: Verifier PASS registrado em `.specs/features/react-nextjs-specific/validation.md` (evidência por AC, `npm run typecheck`/`build`/`lint:package`/`test` verdes) e numa revisão posterior de cobertura/segurança/perf (`5cbede0..HEAD`, sensor 5/5 mutantes mortos após fix em `b070ffd`, 320/320 testes, cobertura 100%). Mergeado em `main` via PR #7 (`4422b64`), publicado como `@still-void/ui@2.0.0`. Esta tabela ficou marcada `Pending` desde `2026-08-22` (merge da PR #7) apesar do PASS já registrado em `validation.md` — corrigido a pedido do usuário depois de achado durante o fechamento da PR #15.

---

## Success Criteria

- [ ] `npm run build && npm run lint:package && npm run typecheck && npm test` passam limpos na branch nova
- [ ] Nenhum export público restante do entry `.` agnóstico
- [ ] Storybook renderiza todos componentes sem diff visual
- [ ] Doc de design system + guia de migração publicados em `docs/` (ou local combinado com README/DESIGN.md conforme convenção do repo)
- [ ] Changeset major criado
