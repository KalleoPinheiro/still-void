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

Plus CSS entries, framework-neutral, imported once at the app root:

| Entry | What it is |
| --- | --- |
| `@still-void/ui/theme.css` | CSS custom properties (`--sv-*`): color tokens, dark/light via `[data-theme]`, accents via `[data-accent]` |
| `@still-void/ui/style.css` | All component classes (`sv-*`) — this is all a consumer needs for every server-safe component, Tailwind or not |
| `@still-void/ui/shadcn-overrides.css` | **Opt-in.** Applies `box-shadow: none !important` to bare element selectors (`button`, `input`, `select`, `textarea`, …). Never imported by `style.css` — importing it automatically would reach into a consumer's own components, not just the package's |

Plus one Tailwind entry, for consumers who compose their own markup with Tailwind
utilities on top of Still Void's tokens:

| Entry | What it is |
| --- | --- |
| `@still-void/ui/tailwind.css` | A Tailwind **v4** CSS-first `@theme inline` block mapping `--color-sv-*`, `--font-sv-*`, `--spacing`, and `--radius-sv-*` to `var(--sv-*)`. `@import` it once; optional — the components themselves style through real `sv-*` CSS and need no Tailwind at all (see "Tailwind is optional" below) |

**Rule of thumb:** import from `@still-void/ui/react` by default. Reach for
`@still-void/ui/react/client` only for the specific pieces that need it (theme
toggling, copy-to-clipboard, scroll spy, reading progress, or a Radix-backed shadcn
component with internal state) — and compose them into your Server Components via
slots/`children`, never by making a whole page a Client Component.

### Tailwind is optional

Every component this package ships — server-safe or client, including the shadcn-derived
`Button`, `Card`, `Alert`, `Badge`, the form/table primitives, and the `Dialog`/`Select`/
`DropdownMenu`/`Tabs`/`Tooltip`/`AlertDialog` family — styles itself through real `sv-*`
classes in `style.css`, driven by `var(--sv-*)`. None of them need Tailwind, a Tailwind
config, or any build-time CSS processing beyond loading `theme.css` + `style.css`.
`tailwindcss` is declared as a peer dependency at `>=4` (still **optional**): install it
and `@import "@still-void/ui/tailwind.css"` only if you're composing your **own** markup
with Tailwind utilities against Still Void's tokens — the package's own components don't
need it. Tailwind v3 is no longer supported in any form (the `v2.x` line's
`./tailwind-preset` export is gone as of `3.0.0`) — see
[migration-v2-to-v3.md](migration-v2-to-v3.md) if you're upgrading.

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
- `recipes/field` — `field(options?: { variant?: 'input' | 'textarea' | 'select' | 'file' })` +
  `fieldClasses` (`choice`, `srOnly`). The single source of truth for the form-field frame
  shared by `Input`, `Textarea`, `NativeSelect` and `FileInput` — use it when composing your
  own field markup instead of mirroring `.sv-field`'s CSS by hand. `fieldMessage(options?: {
  variant?: 'hint' | 'error' })` styles the helper/error text paired with a field via
  `aria-describedby`; invalid state itself is the native `aria-invalid="true"` attribute, not
  a prop — every field component already spreads `...props`, so it needs no component change
- `recipes/table` — `table()` + `tableClasses` (`container`, `head`, `body`, `foot`, `row`,
  `th`, `td`, `caption`) — the class map behind the `Table` family, for a raw `<table>`
- `recipes/cx` — `cx(...)`, the internal class-join helper (exported for consumer use too). It only
  concatenates and drops falsy values, on purpose: the `sv-*` classes it joins are never Tailwind
  utilities, so there is never a utility conflict to resolve. This is deliberately *not* the same
  helper as the shadcn-derived family's own `cn()` (`src/lib/utils.ts`, `clsx` + `tailwind-merge`):
  those components can still be composed with a *consumer's own* Tailwind utility `className`
  override (`@still-void/ui/tailwind.css` exists for exactly that), and `cn()`'s conflict
  resolution is what makes that override actually win instead of colliding. `cx()` is for `sv-*`
  class composition; `cn()` is for the shadcn layer's Tailwind interop. Neither should replace the
  other.

## Component catalog

### Server-safe (`@still-void/ui/react`)

| Component | Notes |
| --- | --- |
| `Header`, `Logo`, `Footer` | Shell layout pieces |
| `Content` primitives — `CategoryPill`, `PostCard`, `FeaturedPostCard`, `PostGrid`, `Layout`, `Sidebar`, `SidebarSection`, `Hero`, `Skeleton`, `CardSkeleton` | Blog/content layout |
| `Article`, `ThemeScript` | Article shell; `ThemeScript` inlines the pre-hydration theme script to avoid FOUC |
| `Button` (variants `default`/`destructive`/`outline`/`secondary`/`ghost`/`link`/`accent`), `Card` (+ `CardHeader`/`CardFooter`/`CardTitle`/`CardDescription`/`CardContent`; renders `<div>` by default, `as="section"\|"article"\|"li"\|"aside"` to pick another tag, or `asChild` to merge onto a single child — `asChild` wins if both are given), `Alert` (+ `AlertTitle`/`AlertDescription`), `Badge`, `Input` | shadcn/ui components with no internal state |
| `Icon` | Curated, server-safe icon set over `@heroicons/react/24/outline`. `name` (a closed union), `size` (`sm`\|`md`\|`lg`, default `md`, sized via `.sv-icon` tokens, never a `size` prop on the underlying SVG), `label` for an accessible name (otherwise `aria-hidden`) |
| `Textarea` | `<textarea>`, styled via `field({ variant: 'textarea' })`. Accepts `rows` — the attribute `Input` never took |
| `NativeSelect` | Real `<select>` — form field, serializes into `FormData`, driveable by `userEvent.selectOptions`. **Coexists on purpose with `Select`** (client-only Radix combobox) — see "NativeSelect vs. Select" below |
| `FileInput` | `<input type="file">` with a styled `::file-selector-button`. `type` is fixed to `"file"` even if a caller passes another `type` |
| `Checkbox` | `<input type="checkbox">`, no wrapper — pair with your own `<label>` or the `sv-choice` class (`fieldClasses.choice`) for a label+control row |
| `RadioGroup`, `RadioGroupItem` | `<fieldset>`/`<legend>` group of native radios. See "RadioGroup: name propagation" below for the direct-children limitation |
| `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` | Presentational data table — a `<table>` inside a horizontally-scrolling container. No sorting/pagination/selection; that's a separate `DataTable` feature, not this family |

### `NativeSelect` vs. `Select`

Both ship from the package and **neither is deprecated in favor of the other** — they solve
different problems:

| | `NativeSelect` (`@still-void/ui/react`) | `Select` (`@still-void/ui/react/client`) |
| --- | --- | --- |
| Element | Real `<select>` | Radix combobox with a portaled listbox |
| Server-safe | Yes — no `'use client'`, no hooks | No — client boundary, internal state |
| Form integration | Serializes into `FormData` out of the box | Needs a hidden input or controlled state to submit natively |
| Interaction in tests | `userEvent.selectOptions` | Radix's own trigger/listbox interaction |
| Use it when | You want a plain form field that works in a Server Component and needs zero JS to submit | You want custom-styled options, search, or rich option content, and are already in a Client Component |

### `Sidebar` vs. `SidebarPanel` (app shell)

Both ship from the package and **neither is deprecated in favor of the other** — they solve
different problems:

| | `Sidebar` / `SidebarSection` (`@still-void/ui/react`) | `SidebarProvider`, `SidebarPanel`, `SidebarTrigger`, `SidebarInset` (`@still-void/ui/react/client`) |
| --- | --- | --- |
| Purpose | Content navigation (blog, docs TOC) — a static rail or sidebar | Application shell (admin panels, dashboards) — a responsive panel with a toggle |
| Server-safe | Yes — no `'use client'`, no hooks, no state | No — client boundary, manages `open`/`close` state, reads viewport |
| Responsive | Not built-in; you manage it (e.g., `display: none` below breakpoint) | Built-in: drawer below a breakpoint, static panel above it |
| Breakpoint | You control via `@media` or CSS class | Configurable (default 1024px); read via `useMediaQuery` and `matchMedia` |
| Interaction in tests | Renders as static `<aside>` / `<section>` | Radix `Dialog` machinery: portal, focus trap, overlay, `Escape` to close |
| Use it when | Content is part of the page structure (TOC, sidebar nav for a blog post) | Toggling navigation is needed (app drawer, responsive admin panel) |

### `RadioGroup`: `name` propagation is direct-children only

`RadioGroup` uses neither `useId` (a Hook) nor `createContext` (a React API, not a Hook) —
this package's policy is that nothing reachable from the server-safe entry may call either,
so it injects its `name` prop into `RadioGroupItem` children via
`React.Children.map`. This only reaches **direct children**: a `RadioGroupItem` wrapped in
another element (e.g. a styling `<div>`) does not receive the group's `name` and must
declare its own. A `RadioGroupItem`'s own `name` always wins over the group's.

### Client-only (`@still-void/ui/react/client`)

| Component | Notes |
| --- | --- |
| `ThemeProvider`, `useTheme`, `ThemeToggle` | Wraps `createThemeManager`; provides `[data-theme]`/`[data-accent]` context |
| `CopyButton` | Wraps `copyToClipboard` |
| `TableOfContents` | Wraps scroll-spy behavior for active-heading tracking |
| `ReadingProgress` | Wraps `createReadingProgress` |
| `useScrollSpy`, `useReadingProgress`, `useMediaQuery` | Raw hooks, if you want to build custom UI around the behaviors |
| `createMediaQuery` | Behavior over `window.matchMedia` with `getSnapshot()`, `subscribe()`, `destroy()` — used by `useMediaQuery` and `SidebarProvider`. Returns an inert controller when `matchMedia` is unavailable (e.g., in jsdom without a stub) |
| `SidebarProvider`, `useSidebar`, `SidebarPanel`, `SidebarTrigger`, `SidebarInset` | Responsive app shell: sidebar becomes a drawer below a breakpoint. **Coexists with `Sidebar`/`SidebarSection`** (the content-rail family) — see "Sidebar vs. SidebarPanel" below |
| `ToastProvider`, `useToast` | Notification queue: up to 3 toasts (configurable), auto-dismiss (5s default), pauses on hover/focus. Four severities map to semantic `aria-live` announcements. |
| shadcn/ui: `Dialog` family, `AlertDialog` family, `DropdownMenu` family, `Select` family, `Tabs` family, `Tooltip` family | Radix-backed, require client state. `DialogContent` renders a close button by default (`<Icon name="x" />`, opt out with `showCloseButton={false}`); `AlertDialogContent` never does — a destructive confirmation resolves through explicit `AlertDialogAction`/`AlertDialogCancel`, not an escape-hatch X |

Every shadcn component (server-safe or client) follows the Still Void CSS rules —
no box-shadow, tokens for spacing/radii, one accent at a time. See CONTRIBUTING.md if
you're adding a new one.

### Alert: semantic variants and zero-regression default

`Alert` (`@still-void/ui/react`) now accepts an optional `variant` prop with four severities:
`'info'`, `'success'`, `'warning'`, `'danger'`. When a variant is present, the component
automatically derives the correct `role` (`status` for info/success, `alert` for warning/danger)
and renders a default icon — a behavior that **changes from its neutral default** (`role="alert"`,
no icon). **To preserve backward compatibility**: `Alert` without a `variant` prop renders
**identically to its current behavior** — `role="alert"`, no icon — so existing code never breaks.

The `icon` prop lets you override or suppress the default: `icon={<CustomIcon/>}` renders your
icon; `icon={null}` suppresses it entirely. The `action` prop adds an optional action button slot
(e.g. "Undo", "Retry").

| Severity | Token | Icon | Alert `role` |
| --- | --- | --- | --- |
| info | `--sv-info-ink` | `info` | `status` |
| success | `--sv-success-ink` | `check-circle` | `status` |
| warning | `--sv-warning-ink` | `alert-triangle` | `alert` |
| danger | `--sv-danger-ink` | `alert-circle` | `alert` |
| *(omitted)* | — | none | `alert` *(current behavior)* |

### Toast: transient notifications with semantic announcements

`ToastProvider` and `useToast` (`@still-void/ui/react/client`) manage a queue of notifications.
Up to three are shown at once (configurable via `max`); older ones are removed (FIFO). Each
toast auto-dismisses after 5 seconds (configurable per toast or at the provider level) and
pauses on hover or focus.

The four severities map to the **same semantic table as `Alert`** (info/success/warning/danger).
The critical difference from a simple `Alert` alert box is that **toast announces itself via
`aria-live`, not by being read when it appears**: it uses Radix's region (`role="region"`)
with `aria-live` set to `assertive` for warning/danger (interrupts screen reader speech) and
`polite` for info/success (waits for a pause). **`role="alert"` is not emitted**, because the
Radix primitive fixes `role="status"` on the toast item itself — overlaying `role="alert"` would
duplicate the announcement to assistive technology. The `aria-live` attribute is what conveys
urgency, not the role.

| Severity | Radix type | `aria-live` |
| --- | --- | --- |
| info | `background` | `polite` |
| success | `background` | `polite` |
| warning | `foreground` | `assertive` |
| danger | `foreground` | `assertive` |

Use `action?: { label, altText, onClick }` to add a button (the `altText` is mandatory — it
gives screen readers a description when the toast auto-dismisses before the user reaches the
button, e.g. "Undo (Ctrl+Z)").

## Accessibility

WCAG AA baseline: visible focus states, correct `aria-*` (`role="progressbar"` on
`ReadingProgress`, `aria-current` on `TableOfContents`/nav links), validated color contrast
in both themes. See `tests/contrast.test.ts` for the enforced contrast checks and Storybook's
`addon-a11y` for interactive auditing (`npm run storybook`).
