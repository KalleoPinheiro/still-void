# @quiet-tech/ui

## 0.1.0

Initial extraction from the `blog.kalleopinheiro.dev` prototype.

- Typed design tokens: colors (dark/light + 4 oklch accents), typography (Sora/Manrope/JetBrains Mono), spacing 4–72px, radii 6/8/12/16/full, motion easing `cubic-bezier(.3,.7,.4,1)`.
- `theme.css`: CSS vars with `data-theme` / `data-accent` switching (Server Component safe) and signature utilities (`.qt-gradient-border`, `.qt-card-hover`, `.qt-skeleton`, `.qt-glass`).
- `style.css`: full component styles (`qt-*` classes).
- Framework-agnostic recipes (class-name builders) for Header, Logo, Footer, CategoryPill, PostCard, FeaturedPostCard, PostGrid, Layout, Sidebar, Hero, Skeleton, CodeBlock, Callout, TableOfContents, ReadingProgress, ArticleHeader, Prose.
- Vanilla behaviors: `createThemeManager`, `createScrollSpy`, `createReadingProgress`, `copyToClipboard`.
- React adapter: server-safe components (`@quiet-tech/ui/react`) + client bundle (`@quiet-tech/ui/react/client`) with `ThemeProvider`, `ThemeToggle`, `CopyButton`, `TableOfContents`, `ReadingProgress`, `useScrollSpy`, `useReadingProgress`, `useTheme`.
- Build: tsup (ESM + CJS + `.d.ts`), `'use client'` banner on the client entry, CSS exported as `./theme.css` and `./style.css`.
- Tests: 31 vitest tests (recipes, theme manager, scroll spy, React components incl. copy button feedback).
- Playground: framework-free HTML catalog under `playground/`.
