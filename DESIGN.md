---
name: Still Void
description: React/Next.js design system — calm dark-first surfaces, one sharp accent, zero decoration.
colors:
  bg-dark: "#0A0A0C"
  bg-elev-dark: "#111114"
  surface-dark: "#16161B"
  surface-2-dark: "#1C1C22"
  border-dark: "rgba(255,255,255,0.08)"
  border-strong-dark: "rgba(255,255,255,0.14)"
  text-dark: "#EDEDF0"
  text-2-dark: "#8B8B96"
  text-3-dark: "#83838F"
  bg-light: "#F7F7F5"
  bg-elev-light: "#FFFFFF"
  surface-light: "#FFFFFF"
  surface-2-light: "#F2F2EF"
  border-light: "rgba(0,0,0,0.08)"
  border-strong-light: "rgba(0,0,0,0.14)"
  text-light: "#16161B"
  text-2-light: "#5A5A66"
  text-3-light: "#6F6F78"
  signal-cyan: "oklch(0.78 0.12 210)"
  twilight-violet: "oklch(0.72 0.14 295)"
  quiet-mint: "oklch(0.78 0.10 160)"
  warm-amber: "oklch(0.78 0.12 75)"
typography:
  display:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.08em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
  14: "56px"
  16: "64px"
  18: "72px"
components:
  category-pill:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-2-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  post-card:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.lg}"
    padding: "24px"
  callout-note:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-2-dark}"
    rounded: "{rounded.md}"
    padding: "16px 20px"
  code-block:
    backgroundColor: "{colors.bg-elev-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.mono}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: Still Void

## 1. Overview

**Creative North Star: "The Late-Night Terminal"**

Still Void is what's left on screen after everything unnecessary has been switched off: a dark, near-black canvas, one calm typeface doing most of the talking, and exactly one sharp accent color earning its keep on links, dots, and the occasional border. It's the visual register of someone working alone at midnight with the desk lamp off — code, prose, and a cursor, nothing performing for an audience. Dark is the default mode, not a toggle bolted on afterward; light mode exists as a faithful negative, not a second design.

The system explicitly rejects the SaaS-cream and gradient-hero vocabulary of default AI-generated interfaces: no drop shadows anywhere, no gradient text, no eyebrow-label-above-every-section scaffolding, no hero-metric card template. Where most component libraries reach for elevation and decoration to signal "designed," Still Void signals it through restraint — every color, weight, and radius value is fixed and literal, ported once from the source spec and never approximated "for elegance."

**Key Characteristics:**
- Dark-first: `#0A0A0C` canvas is the resting state, not an inverted afterthought.
- One accent at a time, chosen per-consumer via `data-accent`, never mixed on the same surface.
- Zero shadows, ever — depth comes from border contrast and tonal surface steps only.
- Sora for anything that needs to be *read as a heading*; Manrope for anything that needs to be *read*; JetBrains Mono for anything that needs to be *copied*.

## 2. Colors

A near-monochrome dark stack (four tonal steps of near-black) carries the whole surface; exactly one accent color, switchable per consumer, supplies every moment of color in the entire system.

### Primary
- **Signal Cyan** (`oklch(0.78 0.12 210)`): the default accent. Used for links, the reading-progress bar, active nav/TOC state, and the `.sv-gradient-border` signature — never as a fill behind body text.

### Secondary (alternate accents — one active at a time via `data-accent`)
- **Twilight Violet** (`oklch(0.72 0.14 295)`): alternate accent; same duty as Signal Cyan when selected.
- **Quiet Mint** (`oklch(0.78 0.10 160)`): alternate accent; same duty as Signal Cyan when selected.
- **Warm Amber** (`oklch(0.78 0.12 75)`): alternate accent; also the fixed color of the `callout--warn` variant regardless of the active site-wide accent.

### Neutral (dark, default)
- **Void** (`#0A0A0C`) — page background.
- **Raised Void** (`#111114`) — elevated backdrops (sticky header glass base).
- **Panel** (`#16161B`) — card and pill surfaces.
- **Panel Deep** (`#1C1C22`) — nested/secondary surfaces (skeleton shimmer midpoint).
- **Hairline** (`rgba(255,255,255,0.08)`) — default border.
- **Hairline Strong** (`rgba(255,255,255,0.14)`) — hover-state border.
- **Ink** (`#EDEDF0`) — primary text.
- **Ink Muted** (`#8B8B96`) — secondary text, metadata.
- **Ink Faint** (`#83838F`) — tertiary text, timestamps, placeholders. Corrected from an earlier `#5A5A66` that read ~2.6:1 on Panel — below the AA floor for real copy.

### Neutral (light, faithful negative)
- **Paper** (`#F7F7F5`) — page background.
- **Paper Elevated** (`#FFFFFF`) — card/header surfaces.
- Text and border roles invert the dark-mode ramp 1:1 (Ink becomes `#16161B`, Ink Faint and Ink Muted swap order) — light mode is the same system read backward, not a redesign.

### Named Rules
**The One-Accent Rule.** Exactly one *site* accent is active at a time, set via `data-accent` on `<html>` — used for links, the reading-progress bar, active nav/TOC state, and `.sv-gradient-border`. A page never renders two of those specific elements in different accent hues at once. This rule does **not** cover semantic/category-tag colors: callout variants (`note`/`warn`/`aha`) and `CategoryPill` colors are deliberately fixed per meaning, independent of the active site accent — exactly like `callout--warn` staying Warm Amber regardless of `data-accent`. Multiple category colors on one screen is the feature working as designed, not a violation.

**The No-Approximation Rule.** Every hex and oklch value here is copied verbatim from the source spec. Rounding `oklch(0.78 0.12 210)` to `oklch(0.8 0.12 210)` "for a rounder number" is a regression, not a cleanup.

## 3. Typography

**Display Font:** Sora (with `ui-sans-serif, system-ui, sans-serif` fallback)
**Body Font:** Manrope (with `ui-sans-serif, system-ui, sans-serif` fallback)
**Label/Mono Font:** JetBrains Mono (with `ui-monospace, SF Mono, monospace` fallback)

**Character:** Sora carries structure — confident, slightly geometric, used sparingly and only where something is a heading. Manrope carries reading — warmer and more humanist, built for paragraphs at comfortable length. The two are close enough in x-height to sit on the same page without fighting, distinct enough that switching families reads as "this is now a heading," not decoration.

### Hierarchy
- **Display** (700, 2.75rem / 44px, line-height 1.15): hero titles only (`Hero`). `text-wrap: balance` always on.
- **Headline** (600, 1.75rem / 28px, line-height 1.15): section and article titles (`ArticleHeader`, `FeaturedPostCard`).
- **Title** (600, 1.375rem / 22px, line-height 1.3): card titles (`PostCard`).
- **Body** (400, 0.9375rem / 15px, line-height 1.5): default paragraph text; prose lead bumps to 1rem/16px. Cap line length at 68ch (`.sv-prose`).
- **Label** (600, 0.75rem / 12px, letter-spacing 0.08em, uppercase): pills, sidebar section headers, code-block header text.
- **Mono** (400, 0.8125rem / 13px, line-height 1.7): code, timestamps in code context.

### Named Rules
**The Sparse-Display Rule.** Sora appears only at Display/Headline/Title sizes. Label text (pills, sidebar section headers, code-block header) is Manrope, same as body — Label is a weight/tracking/case treatment, not a typeface change. Sora never sets body copy or Label text; the moment either is in Sora, it's being used as decoration, not structure.

**The Balanced-Heading Rule.** Every Display and Headline gets `text-wrap: balance`. A heading that wraps to an unbalanced 4-word/1-word split is a bug, not a content problem.

## 4. Elevation

Still Void is flat by doctrine — there is no `box-shadow` anywhere in the system, on any component, in any state. Depth is conveyed two other ways: **tonal layering** (Panel sits one step lighter than Void, Panel Deep one step lighter again — depth reads as a lightness gradient, not a drop shadow) and a **1px translateY lift** on hover (`.sv-card-hover`) paired with a border-color shift from Hairline to Hairline Strong. The one deliberate exception to "no ornament" is `.sv-gradient-border` — a 1px conic gradient ring (accent → transparent → Hairline Strong) used as the system's single signature flourish, reserved for `FeaturedPostCard`.

### Shadow Vocabulary
None. If a `box-shadow` appears anywhere in a consuming project's use of this system, it is not using Still Void correctly.

### Named Rules
**The Flat-By-Default Rule.** No card, pill, header, or modal-equivalent in this system ever receives a `box-shadow`. Elevation is a lightness step and a border, never a blur.

**The One-Flourish Rule.** `.sv-gradient-border` is used on exactly one component family (`FeaturedPostCard`) so its rarity keeps it a signature rather than a habit. Reaching for it on a second component dilutes it.

## 5. Components

Every component is precise and unornamented — a component earns color or motion only when it's carrying state (active nav link, hover lift, copy-success feedback), never as baseline decoration.

*Button and Input primitives are specified.* The form-field frame below closes the Button/Input pass that earlier revisions of this document listed as open work.

### Form fields — Input / Textarea / NativeSelect / FileInput

All four share one CSS rule, `.sv-field` (recipe: `field({ variant })`), so border, radius, surface, typography and focus ring come from a single source rather than four hand-copied approximations:

- **Height:** 40px (`--sv-space-10`); `Textarea` grows instead (`min-height: 80px`, resizable vertically).
- **Corner radius:** 6px (`--sv-radius-sm`).
- **Padding:** 12px horizontal / 8px vertical (`--sv-space-3` / `--sv-space-2`).
- **Surface:** `var(--sv-surface)` background on a 1px `var(--sv-border)` border, `var(--sv-text)` foreground, `var(--sv-text-2)` placeholder.
- **Type scale:** `var(--sv-text-base)` (15px) — the one visual value in this pass that isn't a literal carry-over from the previous shadcn defaults (those were Tailwind's unspecified `text-sm`, 14px, not a Still Void token; see the `patch` changeset for the reancoring).
- **Disabled:** `cursor: not-allowed`, `opacity: 0.5`.
- **`FileInput`** additionally styles its native `::file-selector-button` (`-webkit-file-upload-button` fallback) with the same border/radius/surface tokens; `NativeSelect` keeps the browser's native affordance (no `appearance: none`) so `color-scheme` carries the dropdown chrome and native `multiple` list boxes into the right theme for free.

### Focus state (all interactive controls)

`outline: 2px solid var(--sv-accent-ink)` with `outline-offset: 2px` on `:focus-visible` — never `box-shadow`, never Tailwind's `ring-*` utilities. `--sv-accent-ink` is the token already validated at ≥4.5:1 contrast in both themes. This replaces a prior state where the shadcn layer's `focus-visible:ring-accent` referenced a Tailwind color (`accent`) that did not exist in the package's config, so no field had a visible focus ring at all (a WCAG 2.4.7 failure, not a style choice).

### Chips — CategoryPill
- **Shape:** fully rounded (`rounded.full`, 9999px), `padding: 4px 12px`.
- **Style:** Panel background, Ink Muted text, uppercase Label typography, a 6px accent-colored dot leading the label — categories are always a colored dot + word, never an icon or emoji standing in for the dot.
- **State:** `interactive` variant adds a pointer cursor and a Hairline→Hairline-Strong border transition on hover; `active` locks that same treatment plus Ink-colored text.

### Cards — PostCard / FeaturedPostCard
- **Corner Style:** 12px (`rounded.lg`).
- **Background:** Panel, no shadow, 1px Hairline border.
- **Shadow Strategy:** none — see Elevation. Hover applies `.sv-card-hover` (1px lift + border brighten); `FeaturedPostCard` additionally wears `.sv-gradient-border`.
- **Internal Padding:** 24px comfortable (`spacing.6`) / 16px dense variant (`spacing.4`) for `PostCard`; 32px (`spacing.8`) for `FeaturedPostCard`.

### Callouts
- **Style:** Panel background, 1px Hairline border, plus a full (not side-only) 2px left border in the callout's own color — this is a full border-side treatment tied to a semantic role, not a decorative accent stripe applied by reflex.
- **Variants:** `note` (Signal Cyan), `warn` (Warm Amber, fixed regardless of active site accent), `aha` (Twilight Violet, fixed).

### Navigation — Header / TableOfContents
- **Style:** Header is sticky with a frosted-glass backdrop (`.sv-glass`, 72% opacity + 12px blur) by default; nav links are Ink Muted, transitioning to Ink on hover/active with no underline.
- **TableOfContents:** Ink Faint links by default; the scroll-spy-active link turns the accent color — the only place in the system where the accent marks "current position" rather than "primary action."
- **Mobile:** no distinct nav pattern is defined yet in this system; treat as an open gap, not an implicit "same as desktop."

### Code — CodeBlock
- **Style:** Raised Void background, 1px Hairline border, 12px radius, JetBrains Mono throughout, uppercase Label-styled header bar showing filename or language.
- **Copy affordance:** ghost button, Ink Muted → Ink on hover, switches to accent-colored border + text on copy success for 2 seconds — the only component with a timed color state.

## 6. shadcn/ui Components

A curated set of shadcn/ui components has been adapted to Still Void, preserving the design system's core principles. The server-safe family (`Button`, `Card`, `Alert`, `Badge`, and the form/table primitives above) styles itself with real `sv-*` CSS in `style.css`, not Tailwind utilities — the client-only Radix family (`Dialog`, `DropdownMenu`, `Select`, `Tabs`, `Tooltip`) still ships as Tailwind utility classes, migrated in a later feature.

### Theming Strategy
- **CSS variables, not Tailwind, drive theming.** `sv-*` classes read `var(--sv-*)`, so `[data-theme]`/`[data-accent]` propagate to every server-safe component with zero consumer configuration and zero Tailwind dependency.
- **Tailwind Preset (optional):** `@still-void/ui/tailwind-preset` maps the same `sv-*` keys to `var(--sv-*)` for consumers composing their own markup with Tailwind utilities on top of the system's tokens. It is not required by any component the package ships, and `tailwindcss` is declared as an optional peer dependency accordingly.
- **`shadcn-overrides.css` (opt-in subpath):** ships as `@still-void/ui/shadcn-overrides.css`. It applies `box-shadow: none !important` to bare element selectors (`button`, `input`, `select`, `textarea`, a `[class*="shadow"]` catch-all), which is aggressive enough to reach into a consumer's *own* unrelated components — so it is never imported by `style.css` or loaded automatically. Opt in only if you're adding more unstyled shadcn components of your own and want the same shadow reset.
- **No Gradients:** Gradient text and background gradients removed entirely; the system uses only flat surfaces and the `.sv-gradient-border` accent (and only on FeaturedPostCard).

### Component Guarantees
Every imported shadcn component *must* adhere to:
1. **No box-shadow** — the Flat-By-Default Rule applies to shadcn as much as native Still Void components.
2. **Correct fonts** — Sora/Manrope headings (not arbitrary default), JetBrains Mono for code, Manrope for body/labels.
3. **One accent at a time** — shadcn Button variants, Select focus states, Dialog overlays all respect `data-accent`, never mix hues.
4. **Spacing/radii literal** — every component border-radius and padding is set to a value from `src/tokens/`, never approximated.

### Adding New shadcn Components
When integrating a new shadcn component:
1. Run `npx shadcn-ui@latest add [component]` to install.
2. Override styles in `shadcn-overrides.css` — remove shadows, fix fonts, lock to Still Void tokens.
3. Add Storybook story in `src/react/stories/` showing dark/light modes and accent variants.
4. Verify no `box-shadow` appears (use browser DevTools Inspector).
5. Verify fonts render correctly (Sora on headings, Manrope on body, JetBrains on code).
6. Commit with message: "feat: add [ComponentName] component with Still Void theming".

## 7. Do's and Don'ts

Every Don't below is a named anti-reference from PRODUCT.md, repeated here so the visual spec enforces the same line as the product strategy — and additional rules for shadcn component additions.

### Do:
- **Do** keep exactly one accent active per page via `data-accent`; never render two accent hues on the same view (see The One-Accent Rule).
- **Do** use `.sv-gradient-border` on `FeaturedPostCard` only — its rarity is what keeps it a signature (The One-Flourish Rule).
- **Do** use `text-wrap: balance` on every Display and Headline (The Balanced-Heading Rule).
- **Do** treat categories as a colored dot + label, never an icon or emoji.
- **Do** compose new component variants via `children`/slots (`actions`, `visual`, `eyebrow`), matching PRODUCT.md's "composition over configuration" principle.

### Don't:
- **Don't** add a `box-shadow` to any card, pill, or panel — this system is a kitchen-sink-UI-kit anti-reference specifically because it refuses ambient shadow (The Flat-By-Default Rule).
- **Don't** round or "improve" a token value — `oklch(0.78 0.12 210)` and `#0A0A0C` are exact, not starting points (The No-Approximation Rule, PRODUCT.md's "port, don't redesign").
- **Don't** use gradient text, a hero-metric stat card, or an uppercase-tracked eyebrow label above every section — the generic-SaaS-template anti-reference named directly in PRODUCT.md.
- **Don't** require Tailwind or a specific CSS-in-JS runtime to use a component — the core is CSS variables and class-returning recipes; framework lock-in is a named anti-reference in PRODUCT.md.
- **Don't** set Sora on body copy or data — Sora is a structural signal (heading), not a body/label font (The Sparse-Display Rule).
