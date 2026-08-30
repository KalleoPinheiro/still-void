# LESSONS — auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation — do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 — When wrapping a third-party primitive, assert in the rendered DOM the a11y attribute the spec names (aria-live, role) — computing a mapping value is not the same as passing it to the primitive.
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `src/react/client` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: src/react/client/ToastProvider.tsx:235 (AC R5-05.3) (src/react/client)
- last seen: 2026-08-29T20:25:14Z

### L-002 — Validate a numeric prop by rejecting invalid input only; Math.max(default, value) silently clamps legitimate values below the default.
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `src/react/client` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: src/react/client/ToastProvider.tsx:123 (AC R5-06.3) (src/react/client)
- last seen: 2026-08-29T20:25:14Z

### L-003 — A test named for a no-op must perform the action and assert the state is unchanged; asserting only the initial state proves nothing.
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: tests/app-sidebar-collapsible.test.tsx:66 (AC R5-03.4) (tests)
- last seen: 2026-08-29T20:25:15Z

### L-004 — When an AC says an attribute stays hardcoded, keep it written after the props spread; moving it to 'propX ?? default' hands precedence to the consumer and is a silent behaviour change.
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `src/components/ui` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: src/components/ui/alert.tsx:27 (AC R5-09.1) (src/components/ui)
- last seen: 2026-08-29T20:25:15Z

### L-005 — When a spec names an exact icon per variant, assert which icon renders; toBeInTheDocument cannot distinguish a scrambled mapping.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: M8/M9: src/components/ui/alert.tsx:15-18, src/react/client/ToastProvider.tsx:58-61 (tests)
- last seen: 2026-08-29T20:25:15Z

### L-006 — If a derived view already truncates a list, an eviction side effect on the source state is unobservable; assert the source state, not only the derived length.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `src/react/client` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: M3: src/react/client/ToastProvider.tsx:172 (AC R5-06.2) (src/react/client)
- last seen: 2026-08-29T20:25:15Z

### L-007 — Never let a v8-ignore pragma stand in for an acceptance criterion; if the AC states an SSR behaviour, exercise it with renderToString.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `src/react/client` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: src/react/client/hooks.ts:81 (AC R5-01.4) (src/react/client)
- last seen: 2026-08-29T20:25:15Z

### L-008 — A global test stub that pins one branch makes 100% coverage meaningless for the other; assert the mode-specific contract per branch with a local stub override.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: tests/app-sidebar-panel.test.tsx:46 (AC R5-02.4/5/6/10) (tests)
- last seen: 2026-08-29T20:25:15Z

### L-009 — A production fix is not done until a mutation that undoes it fails a test; ship the fix and its discriminating assertion in the same commit.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `src/react/client` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: M10/M10b: src/react/client/ToastProvider.tsx:247 (AC R5-05.3) (src/react/client)
- last seen: 2026-08-29T23:44:28Z

### L-010 — Test a numeric limit prop at a value that differs from the default in both directions; a test using the default value cannot detect a clamp.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: M11: src/react/client/ToastProvider.tsx:125 (AC R5-06.3) (tests)
- last seen: 2026-08-29T23:44:28Z

### L-011 — Never assert a CSS rule with a greedy .* regex across the stylesheet; anchor on the exact selector string or a neighbouring rule will satisfy the match.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `tests` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: M24: tests/app-sidebar-css-contract.test.ts:141 (tests)
- last seen: 2026-08-29T23:44:28Z

### L-012 — Radix Dialog restores focus only to its own Dialog.Trigger ref; a custom trigger outside the Dialog needs an explicit onCloseAutoFocus handler or focus lands on body.
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `src/react/client` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: src/react/client/SidebarProvider.tsx:155 (AC R5-02.5) (src/react/client)
- last seen: 2026-08-29T23:44:28Z

### L-013 — Key a collapsed-state CSS rule on every data attribute the AC names; omitting the open/closed attribute makes the rule fire in states the spec excludes.
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `src/css` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: src/css/style.css:1730 (AC R5-03.1) (src/css)
- last seen: 2026-08-29T23:44:28Z

### L-014 — When a component branches on a responsive breakpoint, test every collapsible/variant mode on BOTH sides of the breakpoint, not just the default one
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `react-client` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: R5-03 AC-1 / M59 (react-client)
- last seen: 2026-08-30T00:24:27Z

### L-015 — A CSS-contract test that pins a selector must be paired with a component test asserting the element actually carries that class
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `css-contract` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: M38/M55 SidebarProvider.tsx:195 (css-contract)
- last seen: 2026-08-30T00:24:27Z

### L-016 — Every invalid-input edge case listed in the spec needs its own test; 100% branch coverage does not imply the guard's rejected values were exercised
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `react-client` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: spec.md:453 edge case / M56 (react-client)
- last seen: 2026-08-30T00:24:27Z

### L-017 — When the spec fixes a default prop value, assert that literal with the prop omitted, not only that an explicitly-passed override works
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `react-client` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: R5-05 AC-9 / M23 (react-client)
- last seen: 2026-08-30T00:24:27Z

### L-018 — For an ARIA id reference (aria-controls, aria-labelledby), assert the referenced id resolves to the intended element, not just that the attribute is non-empty
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `a11y` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: R5-02 AC-7 / M53 (a11y)
- last seen: 2026-08-30T00:24:27Z

### L-019 — Re-check each v8-ignore pragma against the suite; a pragma that can be removed without breaking the coverage threshold is masking a path that is already tested
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `coverage` · harmful: 0
- features: still-void-gaps-round-5-app-shell-feedback
- evidence: ToastProvider.tsx:132 v8-ignore audit (coverage)
- last seen: 2026-08-30T00:24:27Z

## Quarantined (failed when applied — ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
