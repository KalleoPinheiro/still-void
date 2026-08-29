# @still-void/ui

[![npm](https://img.shields.io/npm/v/@still-void/ui?color=6b5bd6)](https://www.npmjs.com/package/@still-void/ui)
[![CI](https://github.com/KalleoPinheiro/still-void/actions/workflows/ci.yml/badge.svg)](https://github.com/KalleoPinheiro/still-void/actions/workflows/ci.yml)

**Still Void** design system for **React and Next.js** — extracted from the
`blog.kalleopinheiro.dev` prototype. Ships as two entry points: a server-safe entry that
renders inside Next.js Server Components with zero hydration cost, and a `'use client'`
entry for interactive pieces. See [docs/design-system.md](docs/design-system.md) for the
full architecture and component catalog,
[docs/migration-v1-to-v2.md](docs/migration-v1-to-v2.md) if you're upgrading from the
framework-agnostic `1.x` line, and
[docs/migration-v2-to-v3.md](docs/migration-v2-to-v3.md) for the `2.x` → `3.x` breaking
changes (Tailwind v4 is now required, and the v3 preset is gone).

## Architecture

| Layer | Entry | Runs where | What it is |
|---|---|---|---|
| **Theme CSS** | `@still-void/ui/theme.css` | browser | CSS vars (`--sv-*`), dark/light via `data-theme`, accents via `data-accent`, signature utilities |
| **Component CSS** | `@still-void/ui/style.css` | browser | All component classes (`sv-*`) — every component this package ships needs only this, never Tailwind |
| **Tailwind theme (optional)** | `@still-void/ui/tailwind.css` | browser (Tailwind v4 build) | `@theme inline` mapping `--color-sv-*`/`--font-sv-*`/`--spacing`/`--radius-sv-*` to `var(--sv-*)`, for `bg-sv-surface`-style utilities in **your own** markup |
| **React (server-safe)** | `@still-void/ui/react` | server or client | Tokens, recipes, and components without hooks — render inside Server Components |
| **React (client)** | `@still-void/ui/react/client` | client | `'use client'` bundle: DOM behaviors (`createThemeManager`, `createScrollSpy`, `createReadingProgress`, `createMediaQuery`, `copyToClipboard`), `ThemeProvider`, `ThemeToggle`, `CopyButton`, `TableOfContents`, `ReadingProgress`, app shell (`SidebarProvider`, `SidebarPanel`, `SidebarTrigger`, `SidebarInset`), toast (`ToastProvider`), hooks |

## Install

```sh
npm install @still-void/ui
```

`react` and `react-dom` (>=18) are required peer dependencies.

## Usage — Next.js (App Router, Server Components)

```tsx
// app/layout.tsx (Server Component)
import '@still-void/ui/theme.css';
import '@still-void/ui/style.css';
import { Header, Logo, Footer, ThemeScript } from '@still-void/ui/react';
import { ThemeProvider, ThemeToggle } from '@still-void/ui/react/client';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Server-rendered attributes = correct theme for a first-time visitor.
    // <ThemeScript /> runs before paint and re-applies a *returning* visitor's
    // stored preference, so there's no flash of the wrong theme either way.
    <html lang="en" data-theme="dark" data-accent="cyan" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="sv-body">
        <ThemeProvider>
          <Header
            logo={<Logo label="still.void" />}
            items={[{ label: 'Home', href: '/', active: true }]}
            actions={<ThemeToggle />}
          />
          {children}
          <Footer author="Kalleo Pinheiro" links={[{ label: 'RSS', href: '/rss' }]} />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx (Server Component — zero client JS for this content)
import { Hero, PostGrid, PostCard, Layout } from '@still-void/ui/react';

export default async function Home() {
  const posts = await getPosts(); // fetch on the server
  return (
    <Layout>
      <Hero eyebrow="blog" title="Calm engineering, sharp accents" />
      <PostGrid>
        {posts.map((post) => (
          <PostCard key={post.href} post={post} />
        ))}
      </PostGrid>
    </Layout>
  );
}
```

Everything in `@still-void/ui/react` is hook-free and browser-API-free, so it renders on the
server. Interactive pieces come from `@still-void/ui/react/client` and are composed in via
slots (`actions`, `visual`, `eyebrow`).

```tsx
// CodeBlock stays a Server Component; only the copy button hydrates.
import { CodeBlock } from '@still-void/ui/react';
import { CopyButton } from '@still-void/ui/react/client';

<CodeBlock code={source} language="ts" actions={<CopyButton code={source} />} />;
```

Syntax highlighting is bring-your-own (by design — the prototype tokenizer was demo-only):
render with Shiki on the server and pass the markup via `rendered`.

## Recipes and behaviors

Recipes are pure class-name builders (server-safe, exported from `@still-void/ui/react`);
behaviors are plain DOM and return a `destroy()` (client-only, exported from
`@still-void/ui/react/client`):

```ts
import { postCard, postCardClasses } from '@still-void/ui/react';
import { createThemeManager } from '@still-void/ui/react/client';

const theme = createThemeManager(); // drives data-theme / data-accent, persists to localStorage
theme.toggleMode();
theme.setAccent('violet');
```

## Fonts

`theme.css` sets `--sv-font-display`/`--sv-font-body`/`--sv-font-mono` to Sora, Manrope and
JetBrains Mono, but does **not** load them — that's a render-blocking `@import` on every
consumer's critical path, and a runtime dependency on a third-party CDN. Load them yourself:

```tsx
// app/layout.tsx — next/font self-hosts and inlines the @font-face rules, no network request
import { Sora, Manrope, JetBrains_Mono } from 'next/font/google';

const sora = Sora({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--sv-font-display' });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--sv-font-body' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--sv-font-mono' });
```

```html
<!-- any other framework: preconnect + stylesheet -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

System-font fallbacks (`ui-sans-serif`, `system-ui`, `ui-monospace`) already cover the gap
before your chosen font loads — see [Fidelity rules](#fidelity-rules-do-not-regress).

## Theming

- Mode: `data-theme="dark" | "light"` on `<html>` (dark is default).
- Accent: `data-accent="cyan" | "violet" | "mint" | "amber"` — pure CSS, so it works in
  Server Components with no JS.
- Everything is overridable via CSS vars (`--sv-accent`, `--sv-bg`, …). No `!important` anywhere.

## shadcn/ui Components

A selection of **shadcn/ui** components has been ported to Still Void with the design system's palette, typography, and spacing applied. Both server-safe and client-only variants are available:

**Server-safe components** (import from `@still-void/ui/react`):
- `Button` — with variants (default, destructive, outline, secondary, ghost, link, **accent**) and sizes (sm, default, lg, icon)
- `Card` — with header, title, description, content, footer; renders as `<div>` by default, or any of `section`/`article`/`li`/`aside` via `as`, or merges onto a single child via `asChild`
- `Icon` — a curated set of icons (`@heroicons/react` under the hood) with `size` (`sm`/`md`/`lg`) and an accessible `label`
- `Input` — text input with placeholder, disabled, and focus states
- `Alert` — with optional semantic `variant` (info/success/warning/danger), automatic icon and role derivation, and an optional `action` slot; zero-regression default when variant is omitted
- `Badge` — with variants (default, secondary, destructive, outline)
- `Textarea` — multi-line text field sharing `Input`'s frame, plus `rows`
- `NativeSelect` — a real `<select>`, serializable via `FormData`; coexists with the client-only `Select` combobox (see [docs/design-system.md](docs/design-system.md))
- `FileInput` — `<input type="file">` with a styled file-selector button
- `Checkbox` — `<input type="checkbox">`, no wrapper
- `RadioGroup` / `RadioGroupItem` — `<fieldset>`/`<legend>` group of native radios
- `Table` family — `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`, a presentational data table with a scrolling container
- `Sidebar` / `SidebarSection` — content sidebar (blog table of contents, article navigation); static rail at all viewport widths. **Coexists with the client-only `SidebarPanel`** for responsive app shells — see [docs/design-system.md](docs/design-system.md)

All of the above style themselves through real `sv-*` CSS classes — **no Tailwind required**,
for any component this package ships, in any version.

**Client-only components** (import from `@still-void/ui/react/client`):
- `SidebarProvider` / `SidebarPanel` / `SidebarTrigger` / `SidebarInset` / `useSidebar` — responsive app shell with toggleable sidebar (drawer below breakpoint, static panel above); read/control state via context
- `ToastProvider` / `useToast` — notification queue (up to 3 by default, configurable), auto-dismiss (5s default), pause on hover/focus; four severities with semantic `aria-live` announcements
- `Dialog` — modal with trigger, content, header, footer, title, description; renders a close button by default (`showCloseButton={false}` to opt out)
- `AlertDialog` — the same modal mechanics as `Dialog`, without a close button, for destructive confirmations that must be resolved through explicit `Action`/`Cancel`
- `Select` — dropdown with groups, labels, and scroll
- `Dropdown` — menu with items, checkboxes, radio groups, labels, separators
- `Tabs` — tabbed interface with triggers and content
- `Tooltip` — positioned tooltip with provider

### Usage

```tsx
// Server Component
import { Button, Card, CardHeader, CardTitle, CardContent } from '@still-void/ui/react';

export default function MyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Save</Button>
      </CardContent>
    </Card>
  );
}
```

```tsx
// Client Component ('use client')
import { Dialog, DialogTrigger, DialogContent } from '@still-void/ui/react/client';
import { Button } from '@still-void/ui/react';

export function SettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Settings</Button>
      </DialogTrigger>
      <DialogContent>
        {/* modal content */}
      </DialogContent>
    </Dialog>
  );
}
```

**Note on Tailwind:** **no component this package ships requires Tailwind at all**, in either
entry. Every component — server-safe or client — styles itself through real `sv-*` classes in
`@still-void/ui/style.css`, driven by `var(--sv-*)`, so it follows `[data-theme]`/
`[data-accent]` with **zero Tailwind config**. That was not always true: before `3.0.0`, the
client-only family (`Dialog`, `DropdownMenu`, `Select`, `Tabs`, `Tooltip`) still emitted
Tailwind utility classes and rendered unstyled without one — see
[docs/migration-v2-to-v3.md](docs/migration-v2-to-v3.md) if you're coming from `2.x`.

`@still-void/ui/tailwind.css` exists for a different reason: if **your own** markup wants
`bg-sv-surface`/`text-sv-text`/`rounded-sv-lg`-style utilities built from this package's
tokens, `@import "@still-void/ui/tailwind.css";` in a Tailwind **v4** project wires them up —
a `@theme inline` block, so the generated utilities keep following `[data-theme]`/
`[data-accent]` at runtime instead of freezing on whichever value was in scope at build time.
This is why `tailwindcss` is declared as a peer dependency at `>=4` — the package no longer
supports Tailwind v3 in any form, preset included (see the migration doc). The peer stays
**optional**: a consumer with no Tailwind at all still gets every component correctly styled.

There is also an opt-in `@still-void/ui/shadcn-overrides.css` subpath (bare-element
`box-shadow: none !important` resets) for consumers who install additional unstyled shadcn
components of their
own — it is never imported automatically.

## Fidelity rules (do not regress)

- Color values (hex/oklch) are literal from the spec — never rounded.
- `.sv-gradient-border` is the visual signature; never replace with `box-shadow`.
- Cards have **no shadow**.
- `text-wrap: balance` on every display heading.
- Fonts: Sora (display) / Manrope (body) / JetBrains Mono (code). System fonts are loading
  fallbacks only.
- Hover easing `cubic-bezier(.3,.7,.4,1)`; reading progress bar is linear.
- Categories are colored dots + label — never emoji.

> Note: the reference sources (`colors_and_type.css`, `ui_kits/blog/*.jsx`) were not available
> at extraction time. Colors, accents, fonts, radii, easing and component inventory come
> literally from the spec document; the numeric type/spacing scales were derived and are
> centralized in `src/tokens/` for easy correction against the originals.

## Scripts

```sh
npm run build             # tsup (ESM + CJS + .d.ts) + CSS to dist/
npm test                  # vitest (320 tests)
npm run typecheck         # tsc --noEmit (strict)
npm run lint:package      # publint + are-the-types-wrong on the packed tarball
npm run storybook         # component catalog at localhost:6006
npm run build-storybook   # static Storybook build → storybook-static/
npm run changeset         # record a change for the next release
npm run version-packages  # apply pending changesets, bump version, update CHANGELOG (CI does this)
npm run release           # build + publish to npm (CI does this)
```

## Versioning

Releases are managed with [Changesets](https://github.com/changesets/changesets) and are
fully automated — nobody publishes from a laptop:

1. A pull request that touches `src/` or `scripts/` must carry a changeset
   (`npm run changeset`); CI fails without one.
2. Merging into `main` opens a **`chore: version packages`** pull request with the version
   bump and the generated `CHANGELOG.md`.
3. Merging *that* publishes to npm with
   [provenance](https://docs.npmjs.com/generating-provenance-statements), tags `v<version>`,
   creates the GitHub release and redeploys Storybook.

The changelog and the version are generated from changeset entries, never written by hand.
Unreleased changes can be tried out from a `canary` snapshot before they ship.

Bump levels for a design system (what counts as breaking, and why a corrected token is a
patch while a redesigned one is a major) are documented in
[CONTRIBUTING.md](CONTRIBUTING.md).
