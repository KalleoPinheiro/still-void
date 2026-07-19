# @quiet-tech/ui

**Quiet Tech** design system as a framework-agnostic TypeScript library — extracted from the
`blog.kalleopinheiro.dev` prototype. Works with React, Angular, Vue, or plain HTML, with
first-class support for **Next.js Server Components**.

## Architecture

The library is layered so the core never depends on any framework:

| Layer | Entry | Runs where | What it is |
|---|---|---|---|
| **Tokens** | `@quiet-tech/ui` | anywhere | Typed constants: colors (hex + oklch), typography, spacing, radii, motion |
| **Theme CSS** | `@quiet-tech/ui/theme.css` | browser | CSS vars (`--qt-*`), dark/light via `data-theme`, accents via `data-accent`, signature utilities |
| **Component CSS** | `@quiet-tech/ui/style.css` | browser | All component classes (`qt-*`) |
| **Recipes** | `@quiet-tech/ui` | anywhere (RSC-safe) | Pure functions returning class strings: `postCard({ dense: true })` |
| **Behaviors** | `@quiet-tech/ui` | client | Vanilla DOM: `createThemeManager`, `createScrollSpy`, `createReadingProgress`, `copyToClipboard` |
| **React (server-safe)** | `@quiet-tech/ui/react` | server or client | Components without hooks — render inside Server Components |
| **React (client)** | `@quiet-tech/ui/react/client` | client | `'use client'` bundle: `ThemeProvider`, `ThemeToggle`, `CopyButton`, `TableOfContents`, `ReadingProgress`, hooks |

## Install

```sh
npm install @quiet-tech/ui
```

React is an **optional** peer dependency — non-React consumers install nothing extra.

## Usage — Next.js (App Router, Server Components)

```tsx
// app/layout.tsx (Server Component)
import '@quiet-tech/ui/theme.css';
import '@quiet-tech/ui/style.css';
import { Header, Logo, Footer } from '@quiet-tech/ui/react';
import { ThemeProvider, ThemeToggle } from '@quiet-tech/ui/react/client';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Server-rendered attributes = correct theme on first paint, no flash.
    <html lang="en" data-theme="dark" data-accent="cyan" suppressHydrationWarning>
      <body className="qt-body">
        <ThemeProvider>
          <Header
            logo={<Logo label="quiet.tech" />}
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
import { Hero, PostGrid, PostCard, Layout } from '@quiet-tech/ui/react';

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

Everything in `@quiet-tech/ui/react` is hook-free and browser-API-free, so it renders on the
server. Interactive pieces come from `@quiet-tech/ui/react/client` and are composed in via
slots (`actions`, `visual`, `eyebrow`).

```tsx
// CodeBlock stays a Server Component; only the copy button hydrates.
import { CodeBlock } from '@quiet-tech/ui/react';
import { CopyButton } from '@quiet-tech/ui/react/client';

<CodeBlock code={source} language="ts" actions={<CopyButton code={source} />} />;
```

Syntax highlighting is bring-your-own (by design — the prototype tokenizer was demo-only):
render with Shiki on the server and pass the markup via `rendered`.

## Usage — any other framework (recipes + behaviors)

```ts
import { postCard, postCardClasses, createThemeManager } from '@quiet-tech/ui';
```

```html
<!-- Angular -->
<article [class]="postCard({ dense: true })">
  <h3 [class]="postCardClasses.title">{{ post.title }}</h3>
</article>
```

Behaviors are plain DOM and return a `destroy()`:

```ts
const theme = createThemeManager(); // drives data-theme / data-accent, persists to localStorage
theme.toggleMode();
theme.setAccent('violet');
```

See [playground/index.html](playground/index.html) for the full catalog rendered with **zero
framework code** — open it with `npm run playground` after `npm run build`.

## Theming

- Mode: `data-theme="dark" | "light"` on `<html>` (dark is default).
- Accent: `data-accent="cyan" | "violet" | "mint" | "amber"` — pure CSS, so it works in
  Server Components with no JS.
- Everything is overridable via CSS vars (`--qt-accent`, `--qt-bg`, …). No `!important` anywhere.

## Fidelity rules (do not regress)

- Color values (hex/oklch) are literal from the spec — never rounded.
- `.qt-gradient-border` is the visual signature; never replace with `box-shadow`.
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
npm test                  # vitest (31 tests)
npm run typecheck         # tsc --noEmit (strict)
npm run playground        # serve the framework-free catalog
npm run storybook         # component catalog at localhost:6006
npm run build-storybook   # static Storybook build → storybook-static/
npm run changeset         # record a change for the next release
npm run version           # apply pending changesets, bump version, update CHANGELOG
npm run release           # build + publish to npm
```

## Versioning

Releases are managed with [Changesets](https://github.com/changesets/changesets). After a
change that should ship in the next version, run `npm run changeset` and describe it — the
changelog and version bump are generated from these entries, not written by hand.
