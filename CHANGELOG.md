# @still-void/ui

## 3.3.1

### Patch Changes

- [#24](https://github.com/KalleoPinheiro/still-void/pull/24) [`51b101d`](https://github.com/KalleoPinheiro/still-void/commit/51b101dfdcb70ac8573101d2f3faabfb8277f5a0) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Fix `.sv-app-sidebar__label` shipping a Sora/1.125rem/600 default that fought whatever it wrapped and violated the Sparse-Display Rule (Sora never sets label/body text) the moment a consumer applied the class to ordinary nav-item text, as the App Sidebar Storybook demo did. The class now carries no typography of its own — it only participates in the collapsed-state hiding rule — and inherits font from whatever it wraps, as intended.

## 3.3.0

### Minor Changes

- [#22](https://github.com/KalleoPinheiro/still-void/pull/22) [`7e3ec95`](https://github.com/KalleoPinheiro/still-void/commit/7e3ec95bca55850496e663c855811efbfbb97bda) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add action slot to Alert component.

  The Alert component now accepts an `action` prop (a ReactNode) that renders inside a `.sv-alert__action` element. The action slot is not rendered if the prop is omitted, keeping the DOM clean. Works seamlessly with variant classes and icons from T1.

- [#22](https://github.com/KalleoPinheiro/still-void/pull/22) [`31e8ea2`](https://github.com/KalleoPinheiro/still-void/commit/31e8ea27c290cb0f7c44b61ee465bd79b9d96685) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add semantic variant to Alert component with derived role and default icon.

  The Alert component now accepts a `variant` prop ('info', 'success', 'warning', 'danger') that automatically derives the appropriate `role` ('alert' for danger/warning, 'status' for info/success) and renders a semantic icon. The icon can be customized via the `icon` prop or hidden with `icon={null}`. Alerts without a variant maintain their current behavior unchanged.

- [#22](https://github.com/KalleoPinheiro/still-void/pull/22) [`ca4b68e`](https://github.com/KalleoPinheiro/still-void/commit/ca4b68efa588c88ba9cfad0f56d479c938ebb5a9) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add createMediaQuery behavior for responsive breakpoint detection.

  Introduces `createMediaQuery(query: string)` as a framework-agnostic controllable media query source with `getSnapshot()`, `subscribe()`, and `destroy()` methods. Complements `useMediaQuery` hook for safe hydration in Server Components. Gracefully degrades when `matchMedia` is unavailable (e.g., jsdom without stub).

  Also adds a global `matchMedia` stub to `tests/setup.ts` with default `matches: false` (mobile, below-breakpoint, for the `(min-width: …px)` query used by `SidebarProvider`) for consistent test behavior across the suite.

- [#22](https://github.com/KalleoPinheiro/still-void/pull/22) [`18274db`](https://github.com/KalleoPinheiro/still-void/commit/18274db39916bcd16b052a20a9db1b982f76cdda) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add SidebarInset component for responsive content area.

  Introduces `SidebarInset` as the main content container that adjusts responsively to sidebar state via CSS selectors reading `data-state` and `data-collapsible` attributes from the wrapper. Renders as `<main class="sv-app-sidebar-inset">` and supports custom className merging. Allows layout to adapt without JavaScript calculations, following Flat-By-Default Rule.

- [#22](https://github.com/KalleoPinheiro/still-void/pull/22) [`e1101a0`](https://github.com/KalleoPinheiro/still-void/commit/e1101a0da6989c2ec35929c1c84edd049fb56205) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add @radix-ui/react-toast as a direct runtime dependency for Toast components.

  The `@radix-ui/react-toast` primitive is now available as a direct dependency, enabling the `ToastProvider` and `useToast` implementation. The package is client-only and does not affect the server-safe entry point. This represents a new capability for the design system.

- [#22](https://github.com/KalleoPinheiro/still-void/pull/22) [`b85481f`](https://github.com/KalleoPinheiro/still-void/commit/b85481f15d2af981dbd5b7b5b958210e78ac9c41) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add icon and none collapsible modes to the app sidebar.

  Extends `SidebarProvider` with `collapsible` prop supporting `'icon'` (displays rail of icons when closed on desktop, drawer on mobile), `'offcanvas'` (default, drawer on mobile), and `'none'` (always expanded, no trigger rendered). `SidebarTrigger` returns `null` when `collapsible="none"`. All modes render `data-collapsible` attribute for CSS-driven styling.

- [#22](https://github.com/KalleoPinheiro/still-void/pull/22) [`3b61541`](https://github.com/KalleoPinheiro/still-void/commit/3b6154102772c8e92761d8722703bf6abff9661e) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add SidebarProvider and useSidebar for responsive app shell.

  Introduces `SidebarProvider` component providing state management for application sidebar with breakpoint detection via `useMediaQuery`. Includes `useSidebar()` hook exposing `{ open, setOpen, toggle, isMobile, collapsible, panelId }`. Supports both controlled and uncontrolled modes. Default `collapsible` mode is `'offcanvas'`. Invalid breakpoint values fall back to 1024px. Wrapper element (`.sv-app-shell`) emits `data-state`, `data-collapsible`, and `data-mobile` attributes for CSS-driven responsive layout. Exported from `@still-void/ui/react/client`.

- [#22](https://github.com/KalleoPinheiro/still-void/pull/22) [`62a60e7`](https://github.com/KalleoPinheiro/still-void/commit/62a60e731e776fd5fc50745c94fc819a1002c92f) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add SidebarPanel, SidebarTrigger and SidebarInset components for app shell.

  Introduces responsive sidebar components: `SidebarPanel` renders statically in-flow above breakpoint or as off-canvas drawer below, `SidebarTrigger` provides menu button with toggle functionality, and `SidebarInset` is the content container that adjusts via CSS. Exports from `@still-void/ui/react/client`. Depends on `useMediaQuery` for breakpoint detection and `@radix-ui/react-dialog` for drawer modal behavior (already installed). Focus management and scroll-lock handled by Radix Dialog.

- [#22](https://github.com/KalleoPinheiro/still-void/pull/22) [`15ea2b0`](https://github.com/KalleoPinheiro/still-void/commit/15ea2b0fb6d42161f33bcd51ae5ebe42639aec66) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add action support to toasts.

  Extends `ToastOptions` with optional `action` parameter containing label, required altText, and onClick callback. Renders as a button within the toast with accompanying close button. Action click dismisses the toast after executing callback. AltText requirement enforced by types.

- [#22](https://github.com/KalleoPinheiro/still-void/pull/22) [`2150d78`](https://github.com/KalleoPinheiro/still-void/commit/2150d78c42b0e40a2cbac8e419bb387b006bb8a4) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add dismiss, dismissAll and update handles to useToast.

  `toast()` returns `{ id, dismiss, update }` handle. `dismiss(id)` removes specific toast; `dismissAll()` empties queue. `update(patch)` modifies toast content in-place without remounting. Non-existent dismisses are no-op; double-dismiss on same handle is no-op.

- [#22](https://github.com/KalleoPinheiro/still-void/pull/22) [`3a16b4a`](https://github.com/KalleoPinheiro/still-void/commit/3a16b4a628ac908d5e631c4c69264758cc8f0c9c) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add ToastProvider and useToast for transient notifications.

  Introduces `ToastProvider` + `useToast()` hook for dismissible, auto-dismissing toast notifications with four semantic variants (info, success, warning, danger), automatic stacking (default max 3), pause-on-hover, and optional action buttons. Replaces manual toast implementations across multiple screens. Wraps `@radix-ui/react-toast` (new dependency, already verified for marginal install cost and `'use client'` boundary isolation) with a queue management layer. Exported from `@still-void/ui/react/client`.

- [#22](https://github.com/KalleoPinheiro/still-void/pull/22) [`6020c3e`](https://github.com/KalleoPinheiro/still-void/commit/6020c3ef3e3c66342dae1d2bedfa84f002c3e8a3) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add useMediaQuery hook for responsive breakpoint detection.

  Introduces `useMediaQuery(query: string)` hook built on `createMediaQuery` and `useSyncExternalStore` for safe SSR hydration. Provides a server snapshot (`false`) that matches on initial render, then reflects the true client-side media query state after hydration without triggering mismatch warnings. Exported from `@still-void/ui/react/client` along with `createMediaQuery` and `MediaQueryController` type.

### Patch Changes

- [#22](https://github.com/KalleoPinheiro/still-void/pull/22) [`03d0e82`](https://github.com/KalleoPinheiro/still-void/commit/03d0e823bfbeccfe8811f8f2334a70d40bc8d831) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Fix correctness bugs found by review in the round-5 App Shell / Toast / Alert work (all unreleased in this cycle):

  - `SidebarPanel`: `collapsible="none"` no longer renders an undismissable mobile drawer; the drawer ref now forwards to `Dialog.Content` so consumer refs work below the breakpoint.
  - `SidebarTrigger`: a consumer `onClick` is now called alongside the internal toggle instead of being silently replaced.
  - `ToastProvider`: the mount flag now resets on remount, so a toast fired during a React Strict Mode dev remount no longer silently no-ops; the action and close buttons are explicit `type="button"` so they don't submit a surrounding form; toast content is no longer wrapped in an unclassed `<div>`, restoring the intended flex layout.
  - `Alert`: variant lookup checks own keys only (rejects `"constructor"`/`"toString"`); a custom `icon` node that isn't a `React.isValidElement` (a string, number, or array) is now rendered instead of silently dropped.
  - `createMediaQuery`: a transition notifies a snapshot of listeners, so one listener unsubscribing mid-transition no longer causes the next listener to be skipped.
  - CSS: `.sv-toast__action:hover` referenced an undefined `--sv-surface-3` token; now uses the same surface-2/surface pair as `.sv-btn--secondary`, which shares its base color.

## 3.2.0

### Minor Changes

- [#20](https://github.com/KalleoPinheiro/still-void/pull/20) [`b08a9c9`](https://github.com/KalleoPinheiro/still-void/commit/b08a9c90d6df13a9c4e78cceeb9dc41baeb9dd9e) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add SVG chart primitives — `ChartContainer`, `ChartGrid`, `ChartAxis`, `ChartLine`, `ChartBar` — server-safe, reading `var(--sv-border)`/`var(--sv-text-2)` for grid/axis color; series color (`var(--sv-accent-ink)`, `var(--sv-info-ink)`, `var(--sv-warning-ink)`, or any CSS color) is a caller prop. All geometry (`points`, `positions`, `ticks`, `bars`) is pre-computed pixel space — there is no domain-to-pixel scale engine; mapping a clinical score or percentage to a position stays application logic. Closes the visual half of the hand-rolled-SVG-chart gap without porting domain-specific scale logic into the design system.

- [#20](https://github.com/KalleoPinheiro/still-void/pull/20) [`96e438f`](https://github.com/KalleoPinheiro/still-void/commit/96e438f7ee87191ad20f81fd215c3aa73d2c43cf) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add the `Pagination` family — `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis` — server-safe markup composition (nav/ul/li/a-or-button), no client boundary. `PaginationLink` renders an `<a>` when `href` is passed and a `<button type="button">` otherwise; `isActive` sets `aria-current="page"`. Closes the gap where numbered pagination had no catalog component, only a repeated "Load more" outline button.

- [#20](https://github.com/KalleoPinheiro/still-void/pull/20) [`f5e4572`](https://github.com/KalleoPinheiro/still-void/commit/f5e457256ec77cc824152d8347d61ad8efa190c4) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add `Progress`, a server-safe generic progress bar (`value`/`max`, mirroring the native `<progress>` element's default `max=100`), distinct from the existing `ReadingProgress` (client-only, scroll-driven). Renders `role="progressbar"` with the full `aria-valuenow`/`aria-valuemin`/`aria-valuemax` trio; `value` is clamped into `[0, max]`.

- [#20](https://github.com/KalleoPinheiro/still-void/pull/20) [`be70d8b`](https://github.com/KalleoPinheiro/still-void/commit/be70d8b81703faf9e3d54d4bb1198a954091b0bd) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add `Separator`, a server-safe generic divider (`orientation="horizontal" | "vertical"`, `decorative` defaulting to `true` like shadcn/ui upstream). Closes a gap where consumers hand-rolled a `<span>` divider with no `role="separator"` available on request (`decorative={false}`).

- [#20](https://github.com/KalleoPinheiro/still-void/pull/20) [`8df637c`](https://github.com/KalleoPinheiro/still-void/commit/8df637ca7546d093eafca1bf3b230c37010119ee) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - `DialogContent` gains a `closeLabel?: string` prop for the native close button's accessible name, defaulting to the existing hardcoded `"Close dialog"` (zero behavior change when omitted). Lets a consumer translate the button (e.g. `closeLabel="Fechar"`) instead of disabling it via `showCloseButton={false}` just to avoid shipping untranslated UI.

- [#20](https://github.com/KalleoPinheiro/still-void/pull/20) [`ec26604`](https://github.com/KalleoPinheiro/still-void/commit/ec266045e9617639c82e3e265811de8ce035e235) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - `IconName` gains three values: `camera`, `blocked`, and `pending` (backed by heroicons' `CameraIcon`, `NoSymbolIcon`, and `ClockIcon`, same as every other entry in the curated set). Closes a gap where consumers rendering "camera", "blocked lot" or "pending lot" indicators had no matching icon and fell back to raw Unicode glyphs as text.

## 3.1.0

### Minor Changes

- [#15](https://github.com/KalleoPinheiro/still-void/pull/15) [`55c25b4`](https://github.com/KalleoPinheiro/still-void/commit/55c25b4a778e074e97e2bbe0d7649edb3fc0e145) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - `Header`'s nav is now collapsible below 640px. It renders inside a native `<details>`/`<summary>` disclosure — zero JavaScript, no client boundary, `Header` stays server-safe. `<summary>` shows a `menu` icon as the tap target; opening it turns the nav into a right-aligned dropdown panel with 44px touch targets per link. Above 640px the markup is unchanged in behavior: CSS forces the nav to stay visible regardless of the native open/closed state, so there is exactly one `Header` markup for every width, never a duplicated mobile/desktop nav.

  `headerClasses` gains two new keys: `navToggle` (`sv-header__nav-toggle`) and `navSummary` (`sv-header__nav-summary`), for consumers composing their own markup around the recipe instead of the `Header` component.

- [#15](https://github.com/KalleoPinheiro/still-void/pull/15) [`32a85e1`](https://github.com/KalleoPinheiro/still-void/commit/32a85e1e4edfabde308b8ca5c370f410f589cf44) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add an invalid/error state to the form-field system. `Input`, `Textarea`, `NativeSelect`, and `FileInput` already spread `...props`, so `<Input aria-invalid="true" />` alone now paints the border (and the focus outline) in `var(--sv-danger-ink)` — no new boolean prop, no component change required.

  New recipe, also exported from `@still-void/ui/react`: `fieldMessage(options?: { variant?: 'hint' | 'error' })`, styling the helper/error text meant to sit under a field and be linked to it via `aria-describedby`. Pair it with `aria-invalid` for a fully accessible error state.

### Patch Changes

- [#15](https://github.com/KalleoPinheiro/still-void/pull/15) [`218befc`](https://github.com/KalleoPinheiro/still-void/commit/218befc90b00f3bd36bbbbb34038f5f906f9fa46) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Close the last 5 findings from a design critique's mechanical detector sweep of the Storybook catalog: `CategoryPill`'s `RawColor` story is now marked with an inline exception comment (it demonstrates a documented arbitrary-color passthrough, exempted by DESIGN.md's One-Accent Rule — not drift), and four off-scale inline-style literals (`Icon.stories.tsx`, `Select.stories.tsx`, `Tooltip.stories.tsx` ×2) now reference real DESIGN.md tokens instead of hardcoded values. All changes are in Storybook demo code only — no component or CSS shipped to consumers changed.

- [#15](https://github.com/KalleoPinheiro/still-void/pull/15) [`26c2a0d`](https://github.com/KalleoPinheiro/still-void/commit/26c2a0d4527c5ed7973926d3eadeb94f6a25abf9) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Fix two stale spots in the shadcn Storybook catalog: `Button`'s `accent` variant — implemented since `3.0.0` and reading `var(--sv-accent-ink)` — was missing from the story's `argTypes` and `AllVariants` render, so it was undiscoverable without already knowing it existed; `Input`'s `FocusState` story described the pre-fix Tailwind `ring-2 ring-accent` mechanism instead of the `outline`-based focus ring the package has actually shipped since the WCAG 2.4.7 fix. Also replaced the raw 🎨 emoji standing in for an icon in `Button`'s icon-size stories with the package's own `Icon` component. No component or CSS changed.

- [#15](https://github.com/KalleoPinheiro/still-void/pull/15) [`36ba990`](https://github.com/KalleoPinheiro/still-void/commit/36ba990bf19e1959d7c3f9e6dbb786c21047b214) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Fix `Header`'s desktop nav going invisible in browsers that implement `<details>` via a `::details-content` pseudo-element (the newer WHATWG rendering model, e.g. current Chrome). That pseudo-element is `content-visibility: hidden` while `<details>` has no `open` attribute; overriding `display` on the light-DOM `.sv-header__nav` child alone never reached past it, so the ≥641px "no-op wrapper" rule silently failed to show the nav on a closed `<details>` in those browsers. The ≥641px media query now also resets `.sv-header__nav-toggle::details-content` (`content-visibility`, `block-size`, `overflow`) back to its unhidden defaults; browsers without `::details-content` support simply skip that rule and keep relying on the existing `display` override.

- [#15](https://github.com/KalleoPinheiro/still-void/pull/15) [`74ceb59`](https://github.com/KalleoPinheiro/still-void/commit/74ceb5933bebae70fb6f040cf9024e26104174d7) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Documentation-accuracy fixes surfaced by a design critique: `DESIGN.md`'s frontmatter listed `text-3-light: "#6F6F78"`, a value superseded by a second WCAG contrast fix (`#6D6D76`) that was already what shipped in `theme.css` — the frontmatter now matches. `DESIGN.md`'s Elevation section described the card hover lift as "1px translateY", while `.sv-card-hover:hover` has always shipped `translateY(-2px)` — the doc now matches the code. Also documented, in `docs/design-system.md` and `src/lib/utils.ts`, why `cn()` (shadcn-derived family, `clsx` + `tailwind-merge`) and `cx()` (`recipes/cx`, plain joiner) intentionally coexist rather than one replacing the other. No runtime behavior changed.

- [#15](https://github.com/KalleoPinheiro/still-void/pull/15) [`7a66d83`](https://github.com/KalleoPinheiro/still-void/commit/7a66d8304bbb34c3cf17f28cbb7aa40c10bd4960) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Fix the `Alert` Storybook stories to render the package's own `Icon` component instead of raw emoji (`ℹ️`, `✓`, `⚠️`, `✕`) — the catalog's primary discovery surface was demonstrating the exact anti-pattern the design system forbids. No component or CSS changed; `.sv-alert > svg` already positioned a real `<svg>` icon correctly.

## 3.0.1

### Patch Changes

- [#13](https://github.com/KalleoPinheiro/still-void/pull/13) [`18d4660`](https://github.com/KalleoPinheiro/still-void/commit/18d4660d0d4996adacdaf04d5a732952acf17e90) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Give every Radix-derived component in the client family a real `displayName`. `Dialog`, `Tabs`, `Tooltip`, `Select`, `DropdownMenu`, and `AlertDialog` previously copied `displayName` from the underlying Radix primitive (`X.displayName = XPrimitive.Y.displayName`), but `@radix-ui/react-dialog`, `-tabs`, `-tooltip`, `-select`, and `-dropdown-menu` never declare one — so every one of these components showed up as `ForwardRef` in React DevTools instead of its own name. No behavior change.

- [#13](https://github.com/KalleoPinheiro/still-void/pull/13) [`64fa362`](https://github.com/KalleoPinheiro/still-void/commit/64fa3625070259b167372151c52fa1f4bffb2b64) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - `Tabs` now emits the `sv-tabs` container class on its root element and merges any consumer `className`, matching every other member of the family. `.sv-tabs` was already published in the package's CSS but nothing rendered it — worse, its default `align-items: stretch` would have forced the `inline-flex` `.sv-tabs__list` to the container's full width the moment a consumer applied the class by hand, so the rule now sets `align-items: flex-start`. No existing usage changes: `Tabs` still accepts every prop `TabsPrimitive.Root` does.

## 3.0.0

### Major Changes

- [#12](https://github.com/KalleoPinheiro/still-void/pull/12) [`f5d7428`](https://github.com/KalleoPinheiro/still-void/commit/f5d7428dc40f62f87c38b62a635fa3d388cff0e5) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Require Tailwind v4 (drop the v3 preset), and give `DialogContent` a close button by default.

  - **`tailwindcss` moves from `>=3 <4` to `>=4`**, still an optional peer — a consumer with no Tailwind installed at all is unaffected, since no component this package ships has needed Tailwind since this same release migrated the last holdouts (`Dialog`, `DropdownMenu`, `Select`, `Tabs`, `Tooltip`) to `sv-*` CSS.
  - **`@still-void/ui/tailwind-preset` is removed**, along with `tailwind.config.ts`. It shipped in Tailwind v3's config format; keeping it exported under a v4 peer range would have re-enabled Tailwind's Preflight for anyone who loaded it, fighting `style.css`. `@still-void/ui/tailwind.css` (see the accompanying minor release) is the v4 replacement, for consumers composing their own markup with Tailwind utilities.
  - **`DialogContent` now renders a close button by default** — an `X` icon with the accessible name "Close dialog", positioned top-right. Opt out with `showCloseButton={false}` to keep rendering your own. If your own tests query the dialog by the text "Close" and now get an ambiguous match against ours, either pass `showCloseButton={false}` or scope the query more specifically (e.g. `getByRole('button', { name: 'Close dialog' })`).

  See [`docs/migration-v2-to-v3.md`](https://github.com/KalleoPinheiro/still-void/blob/main/docs/migration-v2-to-v3.md) for the full upgrade path.

### Minor Changes

- [#10](https://github.com/KalleoPinheiro/still-void/pull/10) [`dd7b8a0`](https://github.com/KalleoPinheiro/still-void/commit/dd7b8a01e56868b963a63cb0ad9c4ea902969317) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add server-safe form and table primitives: `Textarea`, `NativeSelect`, `FileInput`, `Checkbox`, `RadioGroup`/`RadioGroupItem`, and the `Table` family (`Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`). All of them import from `@still-void/ui/react`, render without `'use client'`, hooks, or a Radix dependency, and work inside a plain `<form>` — no new runtime dependencies were added.

  - `Textarea` shares `Input`'s frame and adds the `rows` attribute.
  - `NativeSelect` is a real `<select>` — serializes into `FormData` and works with `userEvent.selectOptions`. It coexists on purpose with the existing client-only `Select` (Radix combobox): `NativeSelect` is a form field, `Select` is a rich combobox — see the design-system docs for when to use each.
  - `FileInput` is `<input type="file">` with a styled native file-selector button; passing another `type` has no effect.
  - `Checkbox` is a bare `<input type="checkbox">` — pair it with your own `<label>` or the new `sv-choice` class.
  - `RadioGroup`/`RadioGroupItem` render a `<fieldset>`/`<legend>` group of native radios; the group's `name` is injected into direct-child items only (a nested item needs its own `name`).
  - `Table` renders inside a horizontally-scrolling container so a wide table never breaks page layout.

  New recipes, also exported from `@still-void/ui/react`: `field()`/`fieldClasses` (the single source of truth for the form-field frame shared by all four field components) and `table()`/`tableClasses` (the class map behind the `Table` family, for consumers composing their own `<table>`).

  Two new export subpaths: `@still-void/ui/tailwind-preset` (a Tailwind preset mapping Still Void's `sv-*` tokens to `var(--sv-*)`, for consumers who compose their own markup with Tailwind utilities) and `@still-void/ui/shadcn-overrides.css` (an opt-in `box-shadow` reset for bare shadcn elements — not imported automatically by anything in the package). `tailwindcss` is now declared as an **optional** peer dependency, pinned to `>=3 <4`: none of the package's own server-safe components require it, and the preset is a v3-format config. Tailwind v4 ignores `corePlugins`, so a v4 consumer loading this preset would get Preflight back and fight `style.css` — the v4 path is a CSS entry (`@theme` + `@source`) that this release does not ship. The five client-only components (`Dialog`, `DropdownMenu`, `Select`, `Tabs`, `Tooltip`) still emit Tailwind utilities and need one of the two paths to render styled.

- [#12](https://github.com/KalleoPinheiro/still-void/pull/12) [`f5d7428`](https://github.com/KalleoPinheiro/still-void/commit/f5d7428dc40f62f87c38b62a635fa3d388cff0e5) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add `Icon`, the `AlertDialog` family, a `Button` accent variant, `Card`'s `as`/`asChild`, and a Tailwind v4 theme entry.

  - **`Icon`** (`@still-void/ui/react`, server-safe) — a curated icon set over `@heroicons/react`, with `size` (`sm`/`md`/`lg`, sized entirely through CSS tokens, never a pixel prop) and an optional `label` for an accessible name. Every icon in the package's own components (the `Dialog` close button, `Select`'s chevron and check, `DropdownMenu`'s indicators) now renders through this same component.
  - **`AlertDialog` family** (`@still-void/ui/react/client`) — `AlertDialog`, `AlertDialogTrigger`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, and `AlertDialogCancel`. `@radix-ui/react-alert-dialog` was already an installed dependency with zero call sites; this exports the family the documentation already announced. No close button by default — a destructive confirmation resolves through explicit `Action`/`Cancel`, composed with `Button` via `asChild`.
  - **`Button variant="accent"`** — a filled button using the active accent color (`background: var(--sv-accent-ink)`, `color: var(--sv-bg)`), for the primary action in a view. Follows `[data-theme]`/`[data-accent]` like every other accent-bearing element.
  - **`Card` gains `as` and `asChild`.** `as="section" | "article" | "li" | "aside"` picks the rendered tag (default stays `div`); `asChild` merges the card's class, ref, and props onto a single child instead of rendering a wrapper. `asChild` wins when both are given. `Card` stays fully server-safe — `asChild` is served by a small vendored ref-merge utility rather than `@radix-ui/react-slot`, which turned out to call a React hook internally and would have broken inside a real Server Component.
  - **`@still-void/ui/tailwind.css`** — a Tailwind v4 CSS-first `@theme inline` entry mapping `--color-sv-*`, `--font-sv-*`, `--spacing`, and `--radius-sv-*` to `var(--sv-*)`, for consumers who want `bg-sv-surface`-style utilities in their **own** markup. No component this package ships needs it — every one of them already styles itself through `style.css`.

### Patch Changes

- [#12](https://github.com/KalleoPinheiro/still-void/pull/12) [`f5d7428`](https://github.com/KalleoPinheiro/still-void/commit/f5d7428dc40f62f87c38b62a635fa3d388cff0e5) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Fix theming, accessibility, and value defects in the client-only `Dialog`, `AlertDialog`, `DropdownMenu`, `Select`, `Tabs`, and `Tooltip` family — the last components in the catalog still emitting Tailwind utility classes instead of the package's own `sv-*` CSS.

  - **`shadow-lg`/`shadow-md`/`shadow-sm` are gone.** These violated the Flat-By-Default rule this package's own README declares; the components now carry no `box-shadow` anywhere.
  - **Classes referencing colors that never existed in this package's config are gone.** `bg-background`, `ring-ring`, `ring-accent`, and `ring-offset-background` all resolved to nothing; every surface, border, and focus state now maps to a real `--sv-*` token.
  - **Focus is visible again.** `outline: 2px solid var(--sv-accent-ink)` with a 2px offset, matching every other interactive component — never `ring-*`, never `box-shadow`.
  - **`DialogContent` gains `aria-modal="true"`.** Radix marks sibling content `aria-hidden` when the dialog opens, which is an equivalent signal for most screen readers, but a consumer with an accessibility contract written against the attribute itself needed to add it by hand until now.
  - **`Select`'s trigger no longer goes blank after picking a value.** `SelectItem` never wrapped its children in Radix's `ItemText`, so nothing fed the trigger's `SelectValue` node once a value was set — this shipped in `2.x` and none of the existing tests selected a value, so it went undetected. `SelectItem` and the checkbox/radio items in `DropdownMenu` also gain a check/dot indicator where the layout previously reserved space for one that was never rendered.
  - **A visible fade replaces the previously-inert open/close animation.** The `animate-in`/`zoom-*`/`slide-*` classes these components emitted depended on `tailwindcss-animate`, which this package never installed, so nothing actually animated. Opening and closing now fades over `--sv-duration-fast`, driven by CSS `animation`/`@keyframes` rather than `transition` — Radix's `Presence` (the mechanism that keeps a closing element mounted long enough to animate out) detects an exit animation by its `animation-name`, never by a `transition`, so a transition-based fade would have compiled correctly but never actually been visible on close. Instant under `prefers-reduced-motion`, on both directions.
  - **`prefers-reduced-motion` now actually applies.** Eight classes' reduced-motion overrides — including five already shipping in `2.x` (nav links, footer links, category pills, the copy button, the table of contents) — were declared in a stylesheet that loads before the base rule they were meant to override, so the override never won the CSS cascade. They're now declared in the same stylesheet as the rule they zero out.

- [#10](https://github.com/KalleoPinheiro/still-void/pull/10) [`dd7b8a0`](https://github.com/KalleoPinheiro/still-void/commit/dd7b8a01e56868b963a63cb0ad9c4ea902969317) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Fix theming, focus visibility, and packaging defects in the shadcn-derived components.

  - **Components now follow `[data-theme]`.** The package's Tailwind config previously hard-coded its color tokens as literal hex values, so every shadcn-derived component (including `Input`) stayed locked to the dark palette even under `[data-theme='light']`. Colors now reference the same `var(--sv-*)` custom properties the rest of the system uses — `theme.css` itself is unchanged, this is a wiring fix, not a value change. The 9 `*-light` color aliases in the Tailwind config, which had no effect once the variables carried the switch, were removed.
  - **Every form field now shows a visible focus ring.** `focus-visible:ring-accent` referenced a Tailwind color that didn't exist in the package's config, so keyboard focus was invisible on any field (a WCAG 2.4.7 failure). Focus is now `outline: 2px solid var(--sv-accent-ink)` with a 2px offset, on `Input`, `Textarea`, `NativeSelect`, `FileInput`, `Checkbox`, and `RadioGroupItem`.
  - **`Button` and `Badge` no longer reference nonexistent colors.** Classes like `bg-destructive`, `bg-background`, `text-accent`, `ring-ring`, and `bg-red-500` resolved to nothing in the package's own config; they now map to the corresponding Still Void tokens (`--sv-danger`, `--sv-bg`, `--sv-accent-ink`, etc). `Badge`'s default variant no longer pins to cyan — it now follows the active `data-accent`, like every other accent-bearing element (the One-Accent Rule).
  - **The Tailwind preset and `shadcn-overrides.css` now ship in the published package** — both were referenced in documentation but absent from the npm tarball until now.
  - **One visual value changed:** the form-field frame's `font-size` moves from Tailwind's unspecified `text-sm` default (14px) to `var(--sv-text-base)` (15px). This affects `Input`, `Textarea`, `NativeSelect`, and `FileInput`. 14px was never a Still Void spec value — it was an unlabeled Tailwind default — so this is a correction against the token scale, not a redesign; height, corner radius, padding, and colors are unchanged.

## 2.0.1

### Patch Changes

- [#8](https://github.com/KalleoPinheiro/still-void/pull/8) [`854f674`](https://github.com/KalleoPinheiro/still-void/commit/854f6743ce2b1f258681fcb80c7724575255d93d) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Refresh README to match the v2.0.0 shape: correct test count (31 → 320), remove the dead `npm run playground` script reference (the framework-free catalog was removed with the core entry point), and correct the note about Tailwind CSS — it's a required app dependency for shadcn/ui components, not a declared peer dependency of this package.

## 2.0.0

### Major Changes

- [#5](https://github.com/KalleoPinheiro/still-void/pull/5) [`9d5fdc8`](https://github.com/KalleoPinheiro/still-void/commit/9d5fdc86eba6d04ed568b2fc821f71d3c91aac50) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - **Breaking:** removes the framework-agnostic core entry point (`import ... from '@still-void/ui'`). The package is now React/Next.js-only. Tokens and recipes moved to `@still-void/ui/react`; DOM behaviors (`createThemeManager`, `createScrollSpy`, `createReadingProgress`, `copyToClipboard`) moved to `@still-void/ui/react/client`. `react`/`react-dom` (>=18) are now required peer dependencies instead of optional. No token/design values changed. See `docs/migration-v1-to-v2.md` for the full import map; non-React consumers have no migration path and should stay on `^1`.

### Minor Changes

- [#5](https://github.com/KalleoPinheiro/still-void/pull/5) [`9d5fdc8`](https://github.com/KalleoPinheiro/still-void/commit/9d5fdc86eba6d04ed568b2fc821f71d3c91aac50) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add Tailwind config extending Still Void tokens and shadcn/ui theme integration infrastructure. Includes `tailwind.config.ts` mapping Still Void colors, typography, spacing, and border radii as Tailwind utilities for use with shadcn/ui components.

- [#5](https://github.com/KalleoPinheiro/still-void/pull/5) [`9d5fdc8`](https://github.com/KalleoPinheiro/still-void/commit/9d5fdc86eba6d04ed568b2fc821f71d3c91aac50) Thanks [@KalleoPinheiro](https://github.com/KalleoPinheiro)! - Add shadcn/ui components with Still Void theming. Exports ~40 components from `@still-void/ui/react` (server-safe) and `@still-void/ui/react/client` (client-only). Tailwind config extends Still Void tokens; CSS override layer removes shadows per design spec.

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
