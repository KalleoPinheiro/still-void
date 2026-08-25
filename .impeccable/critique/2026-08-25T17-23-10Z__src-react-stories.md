---
target: Still Void UI library (src/react components + Storybook catalog)
total_score: 30
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-25T17-23-10Z
slug: src-react-stories
---
Method: dual-agent (A: design-review agent · B: detector/browser-evidence agent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | `CopyButton` gives real timed feedback (`aria-live="polite"`), mas nenhuma story mostra estado loading/pending (Select abrindo, Dialog abrindo). |
| 2 | Match System / Real World | 3 | Nomenclatura mapeia bem pro vocabulário dev — mas `Hero`/`ArticleHeader` usam prop `eyebrow`, exata palavra que DESIGN.md §7 proíbe ("no uppercase-tracked eyebrow label"). |
| 3 | User Control and Freedom | 4 | Opt-outs deliberados por toda parte: `showCloseButton={false}` no Dialog, `icon={null}` colapsa slot no Select (contrato "CLIENT-14"). |
| 4 | Consistency and Standards | 2 | Dois utilitários de classe concorrentes (`cx()` vs `cn()`+tailwind-merge); `Table.stories.tsx` muda pra dados em português enquanto resto é inglês; `Alert.stories.tsx` usa emoji cru onde `Icon` existe pra isso. |
| 5 | Error Prevention | 3 | `CategoryPillProps` é union discriminada, type-safe — mas zero `aria-invalid`/estado de erro em `.sv-field` pra qualquer campo. |
| 6 | Recognition Rather Than Recall | 2 | `Button.stories.tsx` omite variant `"accent"` do `argTypes`, mesmo implementada e funcional — dev só descobre lendo README. |
| 7 | Flexibility and Efficiency | 4 | Recipes exportadas standalone (`postCard()`, `field()`, `categoryPill()`) dão path de poder real pra quem não usa React. |
| 8 | Aesthetic and Minimalist Design | 4 | Doutrina zero-shadow/um-acento/quatro-níveis-tonais seguida com disciplina real no CSS shipado, confirmado por grep — não só prometida em doc. |
| 9 | Error Recovery | 1 | Gap total: nenhum `.sv-field--error`, nenhum `[aria-invalid]`, nenhum `FormField` composto em lugar nenhum de `src/`. DESIGN.md §5 nem menciona estado de erro. |
| 10 | Help and Documentation | 4 | README, PRODUCT.md, DESIGN.md, CONTRIBUTING.md, dois migration guides precisos, Storybook autodocs — raro nesse porte. |
| **Total** | | **30/40** | **Good** |

## Design Specificity Verdict

**LLM assessment**: Sistema majoritariamente autoral, com costuras visíveis onde boilerplate shadcn foi portado sem reescrita. Evidência forte de autoria: `src/tokens/colors.ts`/`theme.css` carregam correções WCAG literais com matemática de derivação real nos comentários (duas iterações de correção em `text-3-light`); zero cor hardcoded fora de `theme.css`; comentários citam vocabulário de rastreamento de defeito real (`CLIENT-05`, `AD-005`, `ICON-01..06`) que só existe se alguém auditou componente por componente. Os migration docs têm precisão ("Who is affected," "What did not change") que sistema genérico gerado por IA nunca se dá ao trabalho de escrever. Mas duas costuras entregam o ponto: a metade shadcn (`src/components/ui/*.tsx`) usa um *segundo* utilitário de classe não reconciliado (`cn()` via `clsx`+`tailwind-merge`) duplicando o `cx()` próprio do sistema — colado e restilizado sem reescrever pro princípio "plain TypeScript, sem dependência de build-tool" que o próprio PRODUCT.md reivindica. E o catálogo Storybook — a superfície primária de descoberta — usa emoji cru (`ℹ️`, `✓`, `⚠️`, `✕`) como ícones de Alert apesar do sistema shipar um componente `Icon` com os glifos certos — a contradição mais clara e visível do próprio brand ("never emoji" nas Fidelity rules do README).

**Deterministic scan**: 9 findings, exit code 2. Distribuição: `design-system-font-size` (6), `design-system-color` (1), `design-system-radius` (2). Todas as 9 ocorrências estão em `src/react/stories/*.stories.tsx` — **zero drift em `src/react/components/*` ou no CSS shipado**. Isso corrobora a leitura acima: o produto instalado (tokens, recipes, CSS) é disciplinado; é a vitrine (Storybook) onde a disciplina escorrega. Achado que cruza com a review qualitativa: 4 dos 6 findings de font-size estão em `Alert.stories.tsx:27,39,51,63` — exatamente os spans de emoji cru que a Assessment A já sinalizou como violação de brand; o detector pegou pelo ângulo métrico (tamanho fora da escala tipográfica) o mesmo arquivo que a revisão qualitativa pegou pelo ângulo semântico (emoji proibido). Um achado, dois ângulos, mesmo arquivo — sinal forte.

Falso positivo provável: `CategoryPill.stories.tsx:32` (`#ff5566`) — a story `RawColor` existe especificamente pra demonstrar que `color` aceita "any CSS color" (documentado em `Content.tsx`), e DESIGN.md's One-Accent Rule exclui explicitamente CategoryPill/callout do constraint de acento único. Não é violação, é feature documentada sem anotação que a isente do scanner.

Achados restantes (advisories reais, mas story-only, sem alcançar componente shipado): `Icon.stories.tsx:61` (0.6875rem, legenda de demo), `Select.stories.tsx:132` (0.875rem numa variante "Small" não documentada em DESIGN.md), `Tooltip.stories.tsx:164,168` (border-radius 3px em `<kbd>`, fora da escala 6/8/12/16/9999px).

**Browser evidence**: Nenhuma ferramenta de browser/screenshot disponível na sessão do Assessment B (confirmado via três buscas de ferramenta distintas). Sem overlay visual pra mostrar. Fallback executado: Storybook subiu em background (porta 6006), respondeu 200 em `/`, `/iframe.html` e `/index.json` com manifest completo de todas as stories — confirma que o catálogo builda e indexa sem erro fatal. Servidor parado ao final (PID do wrapper e do processo filho na porta, ambos confirmados mortos via `lsof`/`curl`). Nenhuma checagem de foco por teclado foi possível (exige DOM real).

Achado não-planejado, mas mecânico e reproduzível: o log de startup do Vite acusa `@heroicons/react/24/outline` importado por `src/components/ui/icon-set.ts` mas não resolvível. Confirmado: `@heroicons/react` está declarado em `package.json` (linha 129) mas ausente de `node_modules` tanto neste worktree quanto no checkout principal do repo. `icon-set.ts` importa 15 ícones desse pacote pra alimentar o registro que o componente `Icon` usa — e `Icon` é consumido transitivamente por Button-com-ícone, Alert, DropdownMenu, Select e mais. Isso é drift de instalação de dependência (declarada, não instalada), fora do escopo do detector de tokens, mas é evidência mecânica real de algo quebrado, não opinião.

## Overall Impression

O núcleo do sistema — tokens, recipes, CSS shipado — é exatamente o que PRODUCT.md promete: literal, testado por contrato (`tests/contrast.test.ts`, `tests/tokenParity.test.ts`), sem drift detectável pelo scanner. O problema não está no que é publicado, está no que apresenta o que é publicado: uma dependência de ícone declarada e nunca instalada, que provavelmente quebra a renderização de `Icon` em qualquer ambiente limpo; um catálogo Storybook que modela o anti-padrão exato que o brand proíbe (emoji em vez de `Icon`); e um gap real e admitido — validação de formulário — que qualquer consumidor batendo o "day one" de construir um form de verdade vai sentir imediatamente. A maior oportunidade única: fechar o ciclo entre o que DESIGN.md promete e o que o catálogo demonstrativo realmente ensina, porque é ali que um desenvolvedor forma sua primeira impressão de confiança no sistema.

## What's Working

- **O fix de focus-ring é real, não só reivindicado.** `theme.css` (`:focus-visible { outline: 2px solid var(--sv-accent-ink); outline-offset: 2px; }`) e toda regra `:focus-visible` de componente interativo (`.sv-field`, `.sv-btn`, `.sv-badge`, `.sv-tabs__trigger`, `.sv-menu-item`, `.sv-dialog__close`) implementam de fato a correção que DESIGN.md relata para a regressão WCAG 2.4.7 — verificado nos seletores reais, não só no changelog.
- **Testes de contrato automatizados.** `tests/contrast.test.ts`, `tests/tokenParity.test.ts`, `tests/component-css-contract.test.ts` significam que as reivindicações visuais do sistema (razões de contraste, paridade token↔CSS) são checadas em CI, não só afirmadas em markdown — raro num design system deste porte.
- **`field()` como fonte única real.** A reivindicação de DESIGN.md de que Input/Textarea/NativeSelect/FileInput "compartilham uma regra CSS... em vez de quatro aproximações copiadas à mão" confere literalmente em `src/recipes/field.ts` e `style.css:604-667`.

## Priority Issues

**[P0] Dependência `@heroicons/react` declarada mas não instalada quebra `Icon`**
- **Why it matters**: `icon-set.ts` importa 15 ícones desse pacote pra alimentar o componente `Icon`, consumido transitivamente por Alert, Button-com-ícone, DropdownMenu, Select e mais — em ambiente limpo (`npm install` seguindo só o `package.json`), esses imports falham e qualquer componente que renderiza um ícone quebra em runtime, não é degradação visual, é erro.
- **Fix**: adicionar `@heroicons/react` a `dependencies` (não só implícito via devDependency de outro pacote) e rodar `npm install` limpo em CI pra pegar esse tipo de drift antes do próximo release.
- **Suggested command**: `/impeccable harden`

**[P1] Zero estado de erro/inválido no sistema de campos de formulário**
- **Why it matters**: `.sv-field` (`style.css:604-667`) só define default e `:disabled` — nenhum `.sv-field--error`, nenhuma regra `[aria-invalid]`. DESIGN.md §5 nem menciona validação. Consumidores (o caso de uso real do sistema, segundo PRODUCT.md) batem nisso no primeiro form real que constroem e inventam convenção própria por projeto — o oposto exato da promessa de "fonte única em vez de aproximações copiadas à mão."
- **Fix**: modifier `.sv-field--error` lendo os tokens `--sv-danger`/`--sv-danger-ink` já definidos em `theme.css` mas nunca consumidos por nenhum campo, mais padrão `aria-invalid`/`aria-describedby` e slot de mensagem de erro documentado.
- **Suggested command**: `/impeccable harden`

**[P1] Storybook modela o anti-padrão exato que o brand proíbe**
- **Why it matters**: `Alert.stories.tsx` usa emoji cru (`ℹ️`, `✓`, `⚠️`, `✕`) com hacks de `style={{ marginRight }}`, enquanto `icon-set.ts` shipa glifos próprios pra exatamente isso (`info`, `check-circle`, `alert-triangle`, `alert-circle`) e o README diz literalmente "never emoji." É a superfície primária de descoberta ensinando o padrão errado. Reforçado pelo detector: 4 dos 6 findings de `design-system-font-size` caem exatamente nesses mesmos spans de emoji (linhas 27, 39, 51, 63), fora da escala tipográfica.
- **Fix**: reescrever as stories de Alert compondo `<Icon name="..." />`; considerar dar a `Alert` um prop `variant` real apoiado nos tokens `semantic`/`semanticInk` já definidos em `colors.ts` mas não usados por nenhum componente hoje.
- **Suggested command**: /impeccable polish

**[P2] Variant `accent` do Button — a assinatura do One-Accent Rule — invisível no próprio Storybook**
- **Why it matters**: `Button.stories.tsx`'s `argTypes.variant.options` e o render `AllVariants` omitem `"accent"`, mesmo `ButtonProps` suportando e `.sv-btn--accent` estando implementado e lendo `var(--sv-accent-ink)` corretamente (`style.css:868`). É a única variant de Button que expressa o One-Accent Rule, e some sem o dev já ter lido o README antes.
- **Fix**: adicionar `"accent"` a `argTypes.options` e ao render `AllVariants`.
- **Suggested command**: /impeccable document

**[P2] Texto de story desatualizado contradiz o mecanismo de foco já corrigido**
- **Why it matters**: `Input.stories.tsx`'s `FocusState` tem placeholder "Focus this input (ring-2 ring-accent)" — descrição literal do mecanismo pré-fix baseado em `ring-*` do Tailwind, que DESIGN.md narra como a regressão WCAG 2.4.7 já resolvida. O CSS real usa `outline`, nunca `ring-*`. Quem lê essa story recebe o oposto do que o código faz.
- **Fix**: atualizar o texto do placeholder pra descrever o mecanismo `outline`, ou remover o parêntese.
- **Suggested command**: /impeccable document

## Persona Red Flags

**Jordan (dev novo no sistema)**: lê o Don't-list de DESIGN.md §7 ("no... uppercase-tracked eyebrow label") e minutos depois encontra `Hero` e `ArticleHeader` shipando prop/slot chamado literalmente `eyebrow` (`Content.tsx`, `Article.tsx`) — mesmo com intenção diferente (rótulo de categoria vs. tique decorativo de marketing), a colisão de nome contra regra dita quatro páginas antes já corrói confiança. Abre `Alert.stories.tsx` esperando o sistema "preciso, sem adorno" prometido em PRODUCT.md e acha emoji.

**Riley (stress tester)**: tenta montar form de login com erro de validação e descobre que não há path suportado (P1 acima); precisa fazer `grep` no pacote inteiro pra confirmar que não existe nada tipo `aria-invalid` antes de desistir e criar convenção própria — quebra a promessa de "tokens tipados... sem drift" do Product Purpose. Também esbarra em `SelectItem`'s distinção `icon={null}` vs `icon={undefined}` (comentário interno "CLIENT-14") — gotcha real e sutil documentado só em comentário de código, nunca em story ou README.

**Casey (mobile)**: DESIGN.md admite abertamente "no distinct nav pattern is defined yet" pra mobile (§5), e o código confirma que não é gap de doc, é gap real e shipado — a única regra responsiva tocando `.sv-header__nav` (`style.css:50-58`) é `overflow-x: auto` com mask-fade, um nav de scroll horizontal, não um padrão de colapso/hambúrguer. Nenhuma story define parâmetro de viewport mobile ou demonstra esse comportamento — dev mobile só descobre o gap estreitando o browser manualmente, sem orientação nenhuma sobre o que construir no lugar.

## Minor Observations

- `src/recipes/cx.ts` (joiner minimalista, alinhado com "recipes stay plain TS") coexiste com `cn()` de `src/lib/utils.ts` (`clsx`+`tailwind-merge`, boilerplate shadcn intocado) usado em todo `src/components/ui/*.tsx` — `tailwind-merge` resolve conflito de utility Tailwind, capacidade que esse sistema não precisa (ele shipa classes `sv-*` BEM, não utilities). Herdado, nunca reauditado contra a arquitetura própria declarada.
- `Table.stories.tsx` muda pra dados de saúde em português ("Pacientes internados," "Diagnóstico") enquanto as outras 32 stories são em inglês — provável vazamento de contexto do autor, não exemplo deliberado de localização.
- `ThemeToggle` usa rótulos de texto ("Light"/"Dark") em vez dos ícones `sun`/`moon` que já existem em `icon-set.ts` — talvez deliberado (mais acessível), vale confirmar que não é descuido.
- Nenhuma story de `Table` demonstra estado vazio, apesar de estados vazios estarem no checklist do próprio sistema.
- DESIGN.md's frontmatter YAML lista `text-3-light: "#6F6F78"`, mas o próprio DESIGN.md/`colors.ts` descreve uma correção posterior pra `#6D6D76`, que é o valor de fato shipado (`colors.ts:33`, `theme.css:121`) — o doc se contradiz; quem só lê o frontmatter machine-readable pega valor stale.
- DESIGN.md §4 diz hover usa "1px translateY lift," mas `theme.css:203` implementa `translateY(-2px)` — gap pequeno, mas exatamente o tipo de imprecisão que a No-Approximation Rule existe pra evitar, aqui aplicada a motion em vez de cor.

## Questions to Consider

1. Se `field()` é a fonte única literal que evita "quatro aproximações copiadas à mão," por que `Alert` — componente de destaque — não tem disciplina equivalente e sequer tem variant semântica própria?
2. `tests/contrast.test.ts` já roda em CI — por que não pegou que o frontmatter do próprio DESIGN.md ainda lista o valor antigo `#6F6F78` que o código abandonou? Os testes de contrato deveriam validar o doc-fonte, não só o CSS shipado?
3. A metade shadcn (`src/components/ui/`) ainda carrega `tailwind-merge` e a convenção `cn()` padrão — em que ponto "curated set of shadcn/ui components adapted to Still Void" (DESIGN.md §6) vira de fato "portado," na mesma barra que `cx()` e as recipes já alcançaram?
4. O nav mobile ausente (gap admitido pelo próprio DESIGN.md) é redução de escopo intencional pra um v3 mirando um caso de uso tipo-blog específico, ou é trabalho inacabado que deveria travar uma alegação de "catálogo de componentes 1.0 completo"?
