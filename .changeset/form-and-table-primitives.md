---
"@still-void/ui": minor
---

Add server-safe form and table primitives: `Textarea`, `NativeSelect`, `FileInput`, `Checkbox`, `RadioGroup`/`RadioGroupItem`, and the `Table` family (`Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`). All of them import from `@still-void/ui/react`, render without `'use client'`, hooks, or a Radix dependency, and work inside a plain `<form>` — no new runtime dependencies were added.

- `Textarea` shares `Input`'s frame and adds the `rows` attribute.
- `NativeSelect` is a real `<select>` — serializes into `FormData` and works with `userEvent.selectOptions`. It coexists on purpose with the existing client-only `Select` (Radix combobox): `NativeSelect` is a form field, `Select` is a rich combobox — see the design-system docs for when to use each.
- `FileInput` is `<input type="file">` with a styled native file-selector button; passing another `type` has no effect.
- `Checkbox` is a bare `<input type="checkbox">` — pair it with your own `<label>` or the new `sv-choice` class.
- `RadioGroup`/`RadioGroupItem` render a `<fieldset>`/`<legend>` group of native radios; the group's `name` is injected into direct-child items only (a nested item needs its own `name`).
- `Table` renders inside a horizontally-scrolling container so a wide table never breaks page layout.

New recipes, also exported from `@still-void/ui/react`: `field()`/`fieldClasses` (the single source of truth for the form-field frame shared by all four field components) and `table()`/`tableClasses` (the class map behind the `Table` family, for consumers composing their own `<table>`).

Two new export subpaths: `@still-void/ui/tailwind-preset` (a Tailwind preset mapping Still Void's `sv-*` tokens to `var(--sv-*)`, for consumers who compose their own markup with Tailwind utilities) and `@still-void/ui/shadcn-overrides.css` (an opt-in `box-shadow` reset for bare shadcn elements — not imported automatically by anything in the package). `tailwindcss` is now declared as an **optional** peer dependency: none of the package's own components require it.
