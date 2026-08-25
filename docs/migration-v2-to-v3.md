# Migration Guide — `@still-void/ui` 2.x → 3.0

`3.0` finishes what `2.0` started for Tailwind: **no component this package ships needs
Tailwind at all**, in either entry, in any version. The client-only Radix family
(`Dialog`, `DropdownMenu`, `Select`, `Tabs`, `Tooltip`) migrated from Tailwind utility
classes to real `sv-*` CSS in `style.css`, the same mechanism the server-safe family
already used. Two breaking changes fall out of that: the `tailwindcss` peer moves to
`>=4`, and the v3-format Tailwind preset is gone. A third, smaller breaking change rides
along: `DialogContent` now renders a close button by default. No token **value** changed —
this is a Tailwind-integration and a11y migration, not a redesign.

## Who is affected

- **Consumers who never installed `tailwindcss`, or who never imported anything from
  `@still-void/ui/react/client`'s shadcn family:** no changes needed beyond bumping the
  version. Every server-safe component already needed zero Tailwind before `3.0`, and still
  does.
- **Consumers on Tailwind `3.x`:** breaks. `tailwindcss` is a peer dependency at `>=4` now.
  See Step 1.
- **Consumers importing `@still-void/ui/tailwind-preset`:** breaks — the subpath, and
  `src/tailwind-preset.ts` behind it, no longer exist. See Step 2.
- **Consumers who query for `Close` text inside a `DialogContent`** (e.g. a test that does
  `getByText('Close')` against their own dismiss control rendered alongside ours): may
  break if the query becomes ambiguous now that `DialogContent` renders its own close
  button by default. See Step 3.

## Step 1 — upgrade to Tailwind v4 (only if you use the client-only family with Tailwind)

If your app used `@still-void/ui/tailwind-preset` against `Dialog`/`Select`/etc, or styled
those components' generated classes yourself, upgrade Tailwind first:

```sh
npm install tailwindcss@^4
```

Follow [Tailwind's own v3 → v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide)
for your app's own utilities — that migration is unrelated to this package and out of
scope here.

If you don't use `tailwindcss` at all, skip this step. Every component in this package's
catalog renders fully styled with zero Tailwind, in `3.0` as in `2.x`.

## Step 2 — drop the Tailwind preset import

`@still-void/ui/tailwind-preset` no longer exists. What replaces it depends on why you
were importing it:

- **You were only loading it so the client-only family (`Dialog`, `Select`, `DropdownMenu`,
  `Tabs`, `Tooltip`) would render styled:** delete the import. Those components style
  themselves through `style.css` now — no Tailwind config needed for them at all.
- **You want Still Void's tokens as Tailwind utilities in your OWN markup**
  (`bg-sv-surface`, `text-sv-text`, …): replace the preset with the new CSS-first entry:

  ```diff
  - // tailwind.config.ts (Tailwind v3)
  - import stillVoidPreset from '@still-void/ui/tailwind-preset';
  - export default { presets: [stillVoidPreset] };
  ```

  ```diff
  + /* app.css (Tailwind v4) */
  + @import "tailwindcss";
  + @import "@still-void/ui/tailwind.css";
  ```

  `tailwind.css` is a `@theme inline` block, so the utilities it adds keep following
  `[data-theme]`/`[data-accent]` at runtime, the same as every `sv-*` class in `style.css`
  — a bare `@theme` would have frozen on whichever value was in scope at build time. See
  [design-system.md](design-system.md#tailwind-is-optional) for the full token map.

## Step 3 — check for a `Close` text query against `DialogContent`

`DialogContent` now renders a close button by default: an `<Icon name="x" />` with the
accessible name **`Close dialog`**, wrapped in `.sv-dialog__close`. If your own tests or
code query the dialog for text/role `Close` and now get an ambiguous match against ours,
either:

- **Opt out** and keep rendering your own close control, unchanged:

  ```diff
  - <DialogContent>
  + <DialogContent showCloseButton={false}>
  ```

- **Or** query more specifically — `getByRole('button', { name: 'Close dialog' })` for
  ours, or scope your own query to your own control's container.

`AlertDialogContent` never renders a close button, in `2.x` or `3.0` — a destructive
confirmation resolves through explicit `AlertDialogAction`/`AlertDialogCancel`, so there
was nothing to opt out of there.

## Step 4 — verify

```sh
npm install         # peer resolution fails loudly if tailwindcss is still <4
npm run build        # or your app's build
npm run typecheck
```

A residual `@still-void/ui/tailwind-preset` import fails module resolution immediately —
that is how you find every remaining call site.

## What did not change

- Every token **value** (colors, spacing, typography, motion) — pixel/hex/oklch-identical.
- Every component's **props and behavior**, except the new `showCloseButton` prop on
  `DialogContent` (Step 3) and the new catalog additions from this same release (`Icon`,
  `AlertDialog`, `Button variant="accent"`, `Card`'s `as`/`asChild`) — all additive, none
  of them change an existing component's default behavior.
- `theme.css` / `style.css` — every class the server-safe family emitted is unchanged;
  the client-only family's classes changed from Tailwind utilities to `sv-*`, which was
  never a documented, stable contract to depend on in the first place.
- The `@still-void/ui/react` vs `@still-void/ui/react/client` split.

## If you can't migrate yet

Pin to the last `2.x` release: `npm install @still-void/ui@^2`. It keeps the
`tailwindcss@>=3 <4` peer range and the `./tailwind-preset` export, and works with the
client-only family styled through Tailwind utilities as before. It will not receive `3.x`
features or further defect fixes going forward.
