# @still-void/ui

## 1.1.1

### Patch Changes

- [#2](https://github.com/KalleoPinheiro/still-void/pull/2) [`7001676`](https://github.com/KalleoPinheiro/still-void/commit/7001676e20e9dd72269d347826d0546d25fefde8) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Fix the types shipped to CommonJS consumers. Every export subpath advertised a single
  `types` entry pointing at the ESM `.d.ts`, so anything using `require('@still-void/ui')`
  resolved ESM type declarations against a CommonJS runtime file (attw: "Masquerading as
  ESM"), and `@still-void/ui/react` / `@still-void/ui/react/client` resolved to nothing at
  all under the legacy `node10` module resolution. `exports` now carries per-condition
  `types` (`.d.ts` for `import`, the already-built `.d.cts` for `require`), plus
  `typesVersions` for `node10` consumers and a `./package.json` export.

## 1.1.0

### Minor Changes

- feat(react): add ThemeScript to prevent flash of wrong theme on load

  feat(tokens): WCAG AA accent/semantic color layer + z-index scale

  fix(security): escape < in ThemeScript's embedded JSON to prevent </script> breakout

  fix(storybook): apply sv-root theme class in preview decorator

  fix(a11y): keyboard-operable CategoryPill + guard color resolvers

  fix(a11y): CSS accessibility & consistency pass

  fix(theme): remove render-blocking Google Fonts @import

  perf(behaviors): rAF-throttle reading progress, quiet ARIA spam

  ci: add GitHub Actions workflow for typecheck/test/build

## 1.0.0

### Major Changes

- ds first version

## 0.1.0

Initial extraction from the `blog.kalleopinheiro.dev` prototype.

- Typed design tokens: colors (dark/light + 4 oklch accents), typography (Sora/Manrope/JetBrains Mono), spacing 4–72px, radii 6/8/12/16/full, motion easing `cubic-bezier(.3,.7,.4,1)`.
- `theme.css`: CSS vars with `data-theme` / `data-accent` switching (Server Component safe) and signature utilities (`.sv-gradient-border`, `.sv-card-hover`, `.sv-skeleton`, `.sv-glass`).
- `style.css`: full component styles (`sv-*` classes).
- Framework-agnostic recipes (class-name builders) for Header, Logo, Footer, CategoryPill, PostCard, FeaturedPostCard, PostGrid, Layout, Sidebar, Hero, Skeleton, CodeBlock, Callout, TableOfContents, ReadingProgress, ArticleHeader, Prose.
- Vanilla behaviors: `createThemeManager`, `createScrollSpy`, `createReadingProgress`, `copyToClipboard`.
- React adapter: server-safe components (`@still-void/ui/react`) + client bundle (`@still-void/ui/react/client`) with `ThemeProvider`, `ThemeToggle`, `CopyButton`, `TableOfContents`, `ReadingProgress`, `useScrollSpy`, `useReadingProgress`, `useTheme`.
- Build: tsup (ESM + CJS + `.d.ts`), `'use client'` banner on the client entry, CSS exported as `./theme.css` and `./style.css`.
- Tests: 31 vitest tests (recipes, theme manager, scroll spy, React components incl. copy button feedback).
- Playground: framework-free HTML catalog under `playground/`.
