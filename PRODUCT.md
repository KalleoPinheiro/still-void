# Product

## Register

product

## Platform

web

## Users

Frontend developers integrating the Still Void design system into their own project — whether they're building in React/Next.js and want the server-safe component adapter, or in another framework (Angular, Vue, plain HTML) and consume the framework-agnostic recipes and CSS directly. Single audience; no secondary persona.

## Product Purpose

`@still-void/ui` ports the **Still Void** visual identity from the `blog.kalleopinheiro.dev` prototype into a reusable, typed TypeScript package. It exists so that identity doesn't have to be rebuilt or approximated per consuming project: typed design tokens, pure CSS recipes, vanilla DOM behaviors, and an optional React adapter split into a server-safe entry and a `'use client'` entry, so the exact same dark/light + accent theming works whether the consumer renders on the server, the client, or outside React entirely. Success looks like: a consumer installs the package, gets correct types immediately, renders inside a Next.js Server Component with zero hydration mismatch, and the visual output matches the spec bit-for-bit — no drift, no manual reimplementation.

## Positioning

The only design system that is simultaneously framework-agnostic at its core (pure CSS variables and class-returning recipe functions, no React required) and ships React components safe to render inside Next.js Server Components. Most component libraries force a choice between one or the other — full portability with no framework integration, or deep framework integration with a hard client-side lock-in.

## Brand Personality

Calm, precise, unadorned. The voice matches the name: no marketing fluff, no hedging. Documentation states rules plainly and shows the constraint behind them (the README's fidelity-rules section is the reference tone — a flat list of "this is exact, don't approximate it," not persuasive copy).

## Anti-references

- **Kitchen-sink UI kits** (MUI, Ant Design, Chakra) — no components accreting a dozen-plus boolean props to cover every conceivable case. Composition (slots, `children`) over configuration.
- **Framework or build-tool lock-in** — never require Tailwind, a specific CSS-in-JS runtime, or pin to one React version to use the core. Recipes and behaviors stay plain TypeScript and CSS variables; React is a layer on top, never a requirement.
- **Generic SaaS template aesthetic** — no gradient text, no hero-metric card, no eyebrow-above-every-section. These are already structurally impossible in the shipped CSS (cards carry no shadow, `.sv-gradient-border` is the deliberate signature, not a decorative cliché to be reached for by reflex).

## Design Principles

- **Port, don't redesign.** Every token value (hex, oklch, easing, font family) is literal from the Still Void spec. Rounding a color "for elegance" or swapping a fallback font in as the final choice is a regression, not an improvement.
- **Composition over configuration.** Slots and `children` are the extension point, not additional boolean props.
- **The core never depends on a framework.** Recipes and behaviors are plain TS/CSS and must keep working with zero framework installed. React (and any future adapter) sits on top as an optional layer.
- **Server-safe by default, client by exception.** A component only becomes a Client Component when it genuinely needs browser APIs or local state (theme switching, scroll spy, clipboard). Everything else renders on the server with no hydration cost.

## Accessibility & Inclusion

WCAG AA baseline across every component: visible focus states, correct `aria-*` usage (already present — `role="progressbar"` on `ReadingProgress`, `aria-current` on `TableOfContents` and nav links), and color contrast validated against the token palette in both dark and light mode. Enforced in the component catalog via Storybook's `addon-a11y`.
