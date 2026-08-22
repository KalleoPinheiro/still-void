# Product

## Register

product

## Platform

web

## Users

Frontend developers integrating the Still Void design system into their React or Next.js project. Single audience; no secondary persona. (Consumers on other frameworks are out of scope as of `2.0` — see [docs/migration-v1-to-v2.md](docs/migration-v1-to-v2.md).)

## Product Purpose

`@still-void/ui` ports the **Still Void** visual identity from the `blog.kalleopinheiro.dev` prototype into a reusable, typed TypeScript package built specifically for React and Next.js. It exists so that identity doesn't have to be rebuilt or approximated per consuming project: typed design tokens, pure recipes, and a React adapter split into a server-safe entry and a `'use client'` entry, so the exact same dark/light + accent theming works whether the consumer renders on the server or the client. Success looks like: a consumer installs the package, gets correct types immediately, renders inside a Next.js Server Component with zero hydration mismatch, and the visual output matches the spec bit-for-bit — no drift, no manual reimplementation.

## Positioning

A design system built for React and Next.js from the ground up, that still splits cleanly between a server-safe entry and a `'use client'` entry — so consumers render inside Next.js Server Components with zero hydration cost, without giving up first-class client interactivity. Most component libraries either ignore RSC entirely or bolt it on; here the split is the architecture, not an afterthought.

## Brand Personality

Calm, precise, unadorned. The voice matches the name: no marketing fluff, no hedging. Documentation states rules plainly and shows the constraint behind them (the README's fidelity-rules section is the reference tone — a flat list of "this is exact, don't approximate it," not persuasive copy).

## Anti-references

- **Kitchen-sink UI kits** (MUI, Ant Design, Chakra) — no components accreting a dozen-plus boolean props to cover every conceivable case. Composition (slots, `children`) over configuration.
- **Build-tool lock-in** — never require Tailwind or a specific CSS-in-JS runtime, and never pin to one React version. Recipes stay plain TypeScript and CSS variables underneath the React layer.
- **Generic SaaS template aesthetic** — no gradient text, no hero-metric card, no eyebrow-above-every-section. These are already structurally impossible in the shipped CSS (cards carry no shadow, `.sv-gradient-border` is the deliberate signature, not a decorative cliché to be reached for by reflex).

## Design Principles

- **Port, don't redesign.** Every token value (hex, oklch, easing, font family) is literal from the Still Void spec. Rounding a color "for elegance" or swapping a fallback font in as the final choice is a regression, not an improvement.
- **Composition over configuration.** Slots and `children` are the extension point, not additional boolean props.
- **Tokens and recipes stay plain TS/CSS underneath.** Even though the public API is React-only, the implementation avoids framework coupling where it costs nothing — token values and class-name recipes are pure functions/data, not React-specific.
- **Server-safe by default, client by exception.** A component only becomes a Client Component when it genuinely needs browser APIs or local state (theme switching, scroll spy, clipboard). Everything else renders on the server with no hydration cost.

## Accessibility & Inclusion

WCAG AA baseline across every component: visible focus states, correct `aria-*` usage (already present — `role="progressbar"` on `ReadingProgress`, `aria-current` on `TableOfContents` and nav links), and color contrast validated against the token palette in both dark and light mode. Enforced in the component catalog via Storybook's `addon-a11y`.
