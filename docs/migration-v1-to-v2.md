# Migration Guide — `@still-void/ui` 1.x → 2.0

`2.0` removes the framework-agnostic core entry point (`import ... from '@still-void/ui'`).
The package is now React/Next.js-only, exported from two entry points:
`@still-void/ui/react` (server-safe) and `@still-void/ui/react/client` (`'use client'`).
No visual/token value changed — this is an import-path migration only, plus a peer
dependency change. See [design-system.md](design-system.md) for the current architecture.

## Who is affected

- **React/Next.js consumers who only ever imported from `@still-void/ui/react` or
  `@still-void/ui/react/client`:** no changes needed beyond bumping the version — those two
  entry points are unchanged (with additive re-exports, see below).
- **Any consumer importing directly from `@still-void/ui`** (no subpath): breaks — that
  entry point no longer exists. Follow the import map below.
- **Non-React consumers** (Vue, Angular, plain HTML/vanilla JS): **no migration path.**
  `2.0` requires React ≥18 as a peer dependency. Stay on the `1.x` line
  (`npm install @still-void/ui@^1`) — it will not receive new features, but keeps working.

## Step 1 — install React/React DOM

`react` and `react-dom` (>=18) are now **required** peer dependencies (previously optional):

```sh
npm install react@">=18" react-dom@">=18"
```

If your project is already React/Next.js, you likely have these installed already — this
step is a no-op.

## Step 2 — update imports

Every named export previously available from `@still-void/ui` now comes from
`@still-void/ui/react` (tokens, recipes, types) or `@still-void/ui/react/client`
(DOM behaviors). Nothing was renamed — only the import path changes.

| Old import (`@still-void/ui`) | New import |
| --- | --- |
| `colors`, `accents`, `accentsInk`, `semantic`, `semanticInk`, `themeModes`, `ThemeMode`, `AccentName`, `ColorScheme`, `SemanticName` | `@still-void/ui/react` |
| `fontFamilies`, `fontWeights`, `fontSizes`, `lineHeights`, `letterSpacings` | `@still-void/ui/react` |
| `spacing`, `radii` | `@still-void/ui/react` |
| `easings`, `durations` | `@still-void/ui/react` |
| `defaultCategoryColors`, `resolveAccentColor`, `resolveCategoryColor` | `@still-void/ui/react` |
| `zIndex` | `@still-void/ui/react` |
| `PostSummary`, `TocItem`, `NavItem` (types) | `@still-void/ui/react` (unchanged — already there pre-`2.0`) |
| `cx`, `header`, `logo`, `footer` + `*Classes` (recipes) | `@still-void/ui/react` |
| `categoryPill`, `postCard`, `featuredPostCard`, `postGrid`, `layout`, `sidebar`, `hero`, `skeletonLine`, `cardSkeleton` + `*Classes` | `@still-void/ui/react` |
| `codeBlock`, `callout`, `tableOfContents`, `tocLink`, `readingProgress`, `articleHeader`, `prose` + `*Classes`, `CalloutKind` | `@still-void/ui/react` |
| `createThemeManager`, `ThemeManager`, `ThemeManagerOptions`, `ThemeState`, `DEFAULT_STORAGE_KEY` | `@still-void/ui/react/client` |
| `createScrollSpy`, `ScrollSpy`, `ScrollSpyOptions` | `@still-void/ui/react/client` |
| `createReadingProgress`, `ReadingProgressOptions` | `@still-void/ui/react/client` |
| `ReadingProgress` (behavior interface) | `@still-void/ui/react/client` as **`ReadingProgressController`** — renamed to avoid colliding with the `ReadingProgress` *component*, which already lived at `@still-void/ui/react/client` |
| `copyToClipboard` | `@still-void/ui/react/client` |

`@still-void/ui/theme.css` and `@still-void/ui/style.css` are unchanged.

### Example

```diff
- import { postCard, postCardClasses, createThemeManager } from '@still-void/ui';
+ import { postCard, postCardClasses } from '@still-void/ui/react';
+ import { createThemeManager } from '@still-void/ui/react/client';
```

```diff
- import type { ThemeMode, AccentName } from '@still-void/ui';
+ import type { ThemeMode, AccentName } from '@still-void/ui/react';
```

## Step 3 — the one renamed type

If you used the `ReadingProgress` **type** from the old core entry (the behavior's return
type, `{ getPercent, destroy }`) — not the React component of the same name — rename it to
`ReadingProgressController` on import from `@still-void/ui/react/client`:

```diff
- import type { ReadingProgress } from '@still-void/ui';
+ import type { ReadingProgressController } from '@still-void/ui/react/client';
```

## Step 4 — verify

```sh
npm run build        # or your app's build — should fail loudly on any remaining bare
                      # `@still-void/ui` import, not silently
npm run typecheck
```

A bare `import ... from '@still-void/ui'` now fails module resolution — that's expected
and is how you find every remaining call site.

## What did not change

- Every token **value** (colors, spacing, typography, motion) — pixel/hex/oklch-identical.
- `theme.css` / `style.css` output — byte-identical.
- All shadcn/ui component behavior and props (`Button`, `Card`, `Dialog`, `Select`, etc.).
- The `@still-void/ui/react` vs `@still-void/ui/react/client` split itself — only its
  contents grew (tokens/recipes/behaviors moved in from the removed core).

## If you can't migrate yet

Pin to the last `1.x` release: `npm install @still-void/ui@^1`. It keeps the
framework-agnostic core entry point and works outside React. It will not receive `2.x`
features or shadcn component updates going forward.
