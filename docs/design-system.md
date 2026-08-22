# Still Void — Design System Guide

`@still-void/ui` is a design system for **React and Next.js**. This doc covers the
architecture, tokens, and component catalog. For visual spec details (exact colors,
easing curves, elevation rules), see [DESIGN.md](../DESIGN.md). For product positioning,
see [PRODUCT.md](../PRODUCT.md). If you're migrating from the pre-`2.0` framework-agnostic
package, see [migration-v1-to-v2.md](migration-v1-to-v2.md).

## Architecture: server vs. client

The package has exactly two JS entry points. There is no bare `@still-void/ui` import —
picking server or client is mandatory.

| Entry | `'use client'`? | What it exports |
| --- | --- | --- |
| `@still-void/ui/react` | No — renders in Server Components | Design tokens, recipes, data-contract types, and every component that doesn't need hooks/state/browser APIs |
| `@still-void/ui/react/client` | Yes — the whole bundle is one Client Component boundary | DOM/localStorage behaviors, hooks, and every component that needs interactivity |

Plus two CSS entries, framework-neutral, imported once at the app root:

| Entry | What it is |
| --- | --- |
| `@still-void/ui/theme.css` | CSS custom properties (`--sv-*`): color tokens, dark/light via `[data-theme]`, accents via `[data-accent]` |
| `@still-void/ui/style.css` | All component classes (`sv-*`) |

**Rule of thumb:** import from `@still-void/ui/react` by default. Reach for
`@still-void/ui/react/client` only for the specific pieces that need it (theme
toggling, copy-to-clipboard, scroll spy, reading progress, or a Radix-backed shadcn
component with internal state) — and compose them into your Server Components via
slots/`children`, never by making a whole page a Client Component.

## Design tokens

All exported from `@still-void/ui/react` as plain typed constants — safe to use in both
server and client code, and safe to read at build time (e.g. to drive a Tailwind config).

| Token module | Exports | Purpose |
| --- | --- | --- |
| `tokens/colors` | `colors`, `accents`, `accentsInk`, `semantic`, `semanticInk`, `ThemeMode`, `AccentName`, `ColorScheme`, `SemanticName`, `themeModes` | Dark/light palettes, the four signature accents (signal-cyan, twilight-violet, quiet-mint, warm-amber), semantic (success/warn/danger) colors |
| `tokens/typography` | `fontFamilies`, `fontWeights`, `fontSizes`, `lineHeights`, `letterSpacings` | Sora (display), Manrope (body), JetBrains Mono (code) — see README "Fonts" for loading |
| `tokens/spacing` | `spacing`, `radii` | Spacing scale and border-radius scale |
| `tokens/motion` | `easings`, `durations` | Named easing curves and duration steps |
| `tokens/categories` | `defaultCategoryColors`, `resolveAccentColor`, `resolveCategoryColor` | Maps content categories (`ia`, `prompt`, `dev`, `arch`, `ts`) to accent colors |
| `tokens/zIndex` | `zIndex` | Named z-index steps — never hardcode a raw z-index number |

Every value here is literal from the Still Void spec (see DESIGN.md's frontmatter). Do not
round, approximate, or "improve" a token — that's a regression, not a fix (see PRODUCT.md,
"Port, don't redesign").

## Recipes

Pure class-name builder functions — also exported from `@still-void/ui/react`, server-safe.
Use these when composing your own markup around a token-driven look, instead of a full
component:

- `recipes/shell` — `header()`, `logo()`, `footer()` + their `*Classes` maps
- `recipes/content` — `categoryPill()`, `postCard()`, `featuredPostCard()`, `postGrid()`,
  `layout()`, `sidebar()`, `hero()`, `skeletonLine()`, `cardSkeleton()` + `*Classes` maps
- `recipes/article` — `codeBlock()`, `callout()`, `tableOfContents()`, `tocLink()`,
  `readingProgress()`, `articleHeader()`, `prose()` + `*Classes` maps
- `recipes/cx` — `cx(...)`, the internal class-join helper (exported for consumer use too)

## Component catalog

### Server-safe (`@still-void/ui/react`)

| Component | Notes |
| --- | --- |
| `Header`, `Logo`, `Footer` | Shell layout pieces |
| `Content` primitives — `CategoryPill`, `PostCard`, `FeaturedPostCard`, `PostGrid`, `Layout`, `Sidebar`, `SidebarSection`, `Hero`, `Skeleton`, `CardSkeleton` | Blog/content layout |
| `Article`, `ThemeScript` | Article shell; `ThemeScript` inlines the pre-hydration theme script to avoid FOUC |
| `Button`, `Card` (+ `CardHeader`/`CardFooter`/`CardTitle`/`CardDescription`/`CardContent`), `Alert` (+ `AlertTitle`/`AlertDescription`), `Badge`, `Input` | shadcn/ui components with no internal state |

### Client-only (`@still-void/ui/react/client`)

| Component | Notes |
| --- | --- |
| `ThemeProvider`, `useTheme`, `ThemeToggle` | Wraps `createThemeManager`; provides `[data-theme]`/`[data-accent]` context |
| `CopyButton` | Wraps `copyToClipboard` |
| `TableOfContents` | Wraps scroll-spy behavior for active-heading tracking |
| `ReadingProgress` | Wraps `createReadingProgress` |
| `useScrollSpy`, `useReadingProgress` | Raw hooks, if you want to build custom UI around the behaviors |
| shadcn/ui: `Dialog` family, `AlertDialog` family, `DropdownMenu` family, `Select` family, `Tabs` family, `Tooltip` family | Radix-backed, require client state |

Every shadcn component (server-safe or client) follows the Still Void CSS rules —
no box-shadow, tokens for spacing/radii, one accent at a time. See CONTRIBUTING.md if
you're adding a new one.

## Accessibility

WCAG AA baseline: visible focus states, correct `aria-*` (`role="progressbar"` on
`ReadingProgress`, `aria-current` on `TableOfContents`/nav links), validated color contrast
in both themes. See `tests/contrast.test.ts` for the enforced contrast checks and Storybook's
`addon-a11y` for interactive auditing (`npm run storybook`).
