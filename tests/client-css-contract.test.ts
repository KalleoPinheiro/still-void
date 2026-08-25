import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * The client family (Dialog, Select, DropdownMenu, Tabs, Tooltip) renders
 * behind a portal, so its surfaces are the ones a consumer never sees until
 * they open — and the ones that rendered colorless when the consumer had no
 * Tailwind config pointing at the Still Void tokens (CLIENT-02).
 *
 * jsdom never loads style.css, so getComputedStyle cannot resolve var(--sv-*)
 * and asserting through the DOM would be theatre. The contract is verified as
 * text, with the selector -> body parser that field-css-contract.test.ts and
 * component-css-contract.test.ts already use. A substring check would not
 * discriminate here: `.sv-pop__viewport` contains the substring `.sv-pop`, so
 * `toContain('.sv-pop')` stays green with the base rule deleted.
 */

const cssPath = resolve(process.cwd(), 'src/css/style.css');
const css = readFileSync(cssPath, 'utf-8');

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Slice one `/* ---------- Name ---------- *\/` section out of style.css. */
function section(source: string, name: string): string {
  const marker = `/* ---------- ${name} ---------- */`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Section not found in style.css: ${name}`);
  const rest = source.slice(start + marker.length);
  const next = rest.indexOf('/* ---------- ');
  return next === -1 ? rest : rest.slice(0, next);
}

/** selector -> declaration body. Grouped selectors are registered separately. */
function parseRules(block: string): Map<string, string> {
  const rules = new Map<string, string>();
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(block))) {
    const body = (match[2] as string).trim();
    for (const selector of (match[1] as string).split(',')) {
      const key = selector.trim();
      if (key) rules.set(key, body);
    }
  }
  return rules;
}

function rulesOf(name: string): Map<string, string> {
  return parseRules(stripComments(section(css, name)));
}

function bodyOf(rules: Map<string, string>, selector: string): string {
  const body = rules.get(selector);
  if (body === undefined) throw new Error(`Rule not found: ${selector}`);
  return body;
}

function decl(
  rules: Map<string, string>,
  selector: string,
  property: string,
): string | undefined {
  const re = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'm');
  const found = bodyOf(rules, selector).match(re);
  return found ? (found[1] as string).trim() : undefined;
}

/** Every declared property name in a rule body, in source order. */
function properties(rules: Map<string, string>, selector: string): string[] {
  return bodyOf(rules, selector)
    .split(';')
    .map((piece) => piece.split(':')[0]?.trim() ?? '')
    .filter((name) => name.length > 0);
}

/**
 * A hairline is a length the token scale does not carry, so `1px` is legitimate
 * on a border or an outline and nowhere else. Any other literal px is the bug:
 * it breaks the alignment with the spacing scale the rest of the system uses.
 */
const PX_ALLOWED = /^(?:border(?:-(?:top|right|bottom|left))?(?:-width)?|outline(?:-width|-offset)?)$/;

function literalPxDeclarations(body: string): string[] {
  return body
    .split(';')
    .map((piece) => piece.trim())
    .filter((piece) => piece.length > 0 && /\b\d+(?:\.\d+)?px\b/.test(piece))
    .filter((piece) => !PX_ALLOWED.test(piece.split(':')[0]?.trim() ?? ''));
}

/**
 * The rules every new client section owes the design system, checked over every
 * rule in the section rather than over a hand-picked list — a section that
 * grows a shadow later fails here without anyone remembering to add a case.
 */
function expectSystemRules(rules: Map<string, string>): void {
  for (const [selector, body] of rules.entries()) {
    // Flat-By-Default: this is where shadow-lg / shadow-md / shadow-sm died.
    expect(body, selector).not.toMatch(/box-shadow/);
    // A literal color freezes the surface on one theme -- the exact defect that
    // left the shadcn layer stuck on the dark palette.
    expect(body, selector).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(body, selector).not.toMatch(/\boklch\(/);
    expect(body, selector).not.toMatch(/\brgba?\(/);
    // CLIENT-08: no cascade escape hatch, so the sheet never has to win a fight
    // with the consumer's own Tailwind layer.
    expect(body, selector).not.toMatch(/!important/);
    expect(literalPxDeclarations(body), selector).toEqual([]);
    // z-index comes from the named scale; the literal `z-50` these components
    // carried is what made a dialog and a tooltip stack by accident.
    const zIndex = decl(rules, selector, 'z-index');
    if (zIndex !== undefined) expect(zIndex, selector).toMatch(/^var\(--sv-z-[a-z]+\)$/);
    // AD-009: a bare [data-state='open'] would reach into the consumer's own
    // markup, which is the mistake that made shadcn-overrides.css opt-in.
    if (selector.includes('[data-state')) {
      expect(selector, selector).toMatch(/^\.sv-[a-z0-9_-]+\[data-state/);
    }
  }
}

/**
 * The fade is the only motion AD-009 allows: opacity, driven by the Radix
 * [data-state] attribute, at the system's fast duration and hover easing.
 */
function expectFadeContract(rules: Map<string, string>, base: string): void {
  expect(decl(rules, base, 'transition')).toBe(
    'opacity var(--sv-duration-fast) var(--sv-ease-hover)',
  );
  expect(decl(rules, `${base}[data-state='open']`, 'opacity')).toBe('1');
  expect(decl(rules, `${base}[data-state='closed']`, 'opacity')).toBe('0');
}

/**
 * The body of style.css's `@media (prefers-reduced-motion: reduce)` block.
 *
 * It reads style.css and not theme.css on purpose: `@media` adds no
 * specificity, and README documents the import order as theme.css then
 * style.css, so a `transition: none` written in theme.css loses the cascade to
 * the base rule declared here. The override only applies from this sheet —
 * see tests/reduced-motion-contract.test.ts, which pins that property.
 */
function reducedMotionBlock(): string {
  const header = '@media (prefers-reduced-motion: reduce) {';
  const start = css.indexOf(header);
  if (start === -1) throw new Error('No prefers-reduced-motion block in style.css');
  let depth = 0;
  for (let i = start + header.length - 1; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(start + header.length, i);
    }
  }
  throw new Error('Unterminated prefers-reduced-motion block in style.css');
}

const reducedMotion = parseRules(stripComments(reducedMotionBlock()));

// ---------------------------------------------------------------------------
// T5 -- Overlays and Dialog
// ---------------------------------------------------------------------------

const overlays = rulesOf('Overlays');
const dialog = rulesOf('Dialog');

describe('client CSS contract — the overlay and dialog primitives', () => {
  test.each([
    ['.sv-overlay', () => overlays],
    ['.sv-dialog', () => dialog],
  ])('%s exists as an exact selector, not a prefix match', (selector, get) => {
    expect([...get().keys()]).toContain(selector);
  });

  test('.sv-overlay covers the page from the backdrop layer', () => {
    // `bg-background/80` named a color this package never declared, so the
    // overlay rendered fully transparent. color-mix over --sv-bg follows
    // [data-theme] with zero consumer configuration.
    expect(decl(overlays, '.sv-overlay', 'position')).toBe('fixed');
    expect(decl(overlays, '.sv-overlay', 'inset')).toBe('0');
    expect(decl(overlays, '.sv-overlay', 'z-index')).toBe('var(--sv-z-backdrop)');
    expect(decl(overlays, '.sv-overlay', 'background')).toBe(
      'color-mix(in srgb, var(--sv-bg) 80%, transparent)',
    );
  });

  test('.sv-dialog is a token-built panel on the modal layer', () => {
    expect(decl(dialog, '.sv-dialog', 'z-index')).toBe('var(--sv-z-modal)');
    expect(decl(dialog, '.sv-dialog', 'border')).toBe('1px solid var(--sv-border)');
    expect(decl(dialog, '.sv-dialog', 'border-radius')).toBe('var(--sv-radius-lg)');
    expect(decl(dialog, '.sv-dialog', 'background')).toBe('var(--sv-surface)');
    expect(decl(dialog, '.sv-dialog', 'color')).toBe('var(--sv-text)');
  });

  test.each([
    ['.sv-overlay', () => overlays],
    ['.sv-dialog', () => dialog],
  ])('%s fades on [data-state] and nothing else moves', (selector, get) => {
    expectFadeContract(get(), selector);
  });

  test.each([
    ['.sv-dialog__header'],
    ['.sv-dialog__footer'],
    ['.sv-dialog__title'],
    ['.sv-dialog__description'],
    ['.sv-dialog__close'],
  ])('%s exists as an exact selector', (selector) => {
    expect([...dialog.keys()]).toContain(selector);
  });

  test('the dialog title and description carry the system typography', () => {
    expect(decl(dialog, '.sv-dialog__title', 'font-family')).toBe('var(--sv-font-display)');
    expect(decl(dialog, '.sv-dialog__title', 'font-size')).toBe('var(--sv-text-lg)');
    expect(decl(dialog, '.sv-dialog__description', 'font-size')).toBe('var(--sv-text-sm)');
    expect(decl(dialog, '.sv-dialog__description', 'color')).toBe('var(--sv-text-2)');
  });

  test('.sv-dialog__close states focus with an outline, never a ring (CLIENT-11)', () => {
    // AD-005: ring-* is box-shadow based, and the ring color the shadcn layer
    // named was never declared -- the close button would have had no visible
    // focus at all.
    const focus = bodyOf(dialog, '.sv-dialog__close:focus-visible');
    expect(focus).toMatch(/outline:\s*2px solid var\(--sv-accent-ink\)/);
    expect(focus).toMatch(/outline-offset:\s*2px/);
  });

  test.each([
    ['Overlays', () => overlays],
    ['Dialog', () => dialog],
  ])('the %s section obeys the Still Void design rules', (_name, get) => {
    expectSystemRules(get());
  });

  test('prefers-reduced-motion zeroes the overlay and dialog fade (CLIENT-03)', () => {
    for (const selector of ['.sv-overlay', '.sv-dialog']) {
      expect([...reducedMotion.keys()], selector).toContain(selector);
      expect(decl(reducedMotion, selector, 'transition'), selector).toBe('none');
    }
  });
});

// ---------------------------------------------------------------------------
// T6 -- Popovers and Tooltip
// ---------------------------------------------------------------------------

const popovers = rulesOf('Popovers');
const tooltip = rulesOf('Tooltip');

describe('client CSS contract — the floating panel primitive', () => {
  test.each([
    ['.sv-pop', () => popovers],
    ['.sv-pop__viewport', () => popovers],
    ['.sv-pop__scroll', () => popovers],
    ['.sv-tooltip', () => tooltip],
  ])('%s exists as an exact selector, not a prefix match', (selector, get) => {
    // `.sv-pop__viewport` contains the substring `.sv-pop`; only an exact-key
    // lookup proves the base rule itself survived.
    expect([...get().keys()]).toContain(selector);
  });

  test('.sv-pop is a token-built panel on the dropdown layer', () => {
    expect(decl(popovers, '.sv-pop', 'z-index')).toBe('var(--sv-z-dropdown)');
    expect(decl(popovers, '.sv-pop', 'min-width')).toBe('calc(var(--sv-space-16) * 2)');
    expect(decl(popovers, '.sv-pop', 'border')).toBe('1px solid var(--sv-border)');
    expect(decl(popovers, '.sv-pop', 'border-radius')).toBe('var(--sv-radius-md)');
    expect(decl(popovers, '.sv-pop', 'background')).toBe('var(--sv-surface)');
    expect(decl(popovers, '.sv-pop', 'color')).toBe('var(--sv-text)');
  });

  test('.sv-pop fades on [data-state] and nothing else moves', () => {
    expectFadeContract(popovers, '.sv-pop');
  });

  test('.sv-pop__viewport caps its height from the spacing scale and scrolls', () => {
    // Without the cap a long option list runs straight off the viewport, which
    // is what max-h-96 was doing before the migration.
    expect(decl(popovers, '.sv-pop__viewport', 'max-height')).toBe(
      'calc(var(--sv-space-16) * 6)',
    );
    expect(decl(popovers, '.sv-pop__viewport', 'overflow-y')).toBe('auto');
  });

  test('.sv-pop__scroll is a token-sized, centred affordance', () => {
    expect(decl(popovers, '.sv-pop__scroll', 'height')).toBe('var(--sv-space-5)');
    expect(decl(popovers, '.sv-pop__scroll', 'align-items')).toBe('center');
    expect(decl(popovers, '.sv-pop__scroll', 'justify-content')).toBe('center');
  });

  test('.sv-tooltip floats above every other layer', () => {
    expect(decl(tooltip, '.sv-tooltip', 'z-index')).toBe('var(--sv-z-tooltip)');
  });

  test('.sv-tooltip declares only what differs from .sv-pop', () => {
    // A tooltip that restated a .sv-pop value would let the two surfaces drift
    // apart silently; one that added a property .sv-pop does not have would be
    // a second panel design rather than a variant of the shared one.
    const popProperties = properties(popovers, '.sv-pop');
    for (const property of properties(tooltip, '.sv-tooltip')) {
      expect(popProperties, property).toContain(property);
      expect(decl(tooltip, '.sv-tooltip', property), property).not.toBe(
        decl(popovers, '.sv-pop', property),
      );
    }
  });

  test.each([
    ['Popovers', () => popovers],
    ['Tooltip', () => tooltip],
  ])('the %s section obeys the Still Void design rules', (_name, get) => {
    // SelectContent's `shadow-md` dies here (CLIENT-04).
    expectSystemRules(get());
  });

  test('prefers-reduced-motion zeroes the panel fade (CLIENT-03)', () => {
    expect([...reducedMotion.keys()]).toContain('.sv-pop');
    expect(decl(reducedMotion, '.sv-pop', 'transition')).toBe('none');
  });
});

// ---------------------------------------------------------------------------
// T7 -- Menu items
// ---------------------------------------------------------------------------

const menu = rulesOf('Menu items');

describe('client CSS contract — the menu item primitive', () => {
  test.each([
    ['.sv-menu-item'],
    ['.sv-menu-item--inset'],
    ['.sv-menu-item__indicator'],
    ['.sv-menu-item__dot'],
    ['.sv-menu-label'],
    ['.sv-menu-separator'],
    ['.sv-menu-shortcut'],
  ])('%s exists as an exact selector, not a prefix match', (selector) => {
    // `.sv-menu-item__dot` contains the substring `.sv-menu-item`; only an
    // exact-key lookup proves the rule itself is present.
    expect([...menu.keys()]).toContain(selector);
  });

  test('.sv-menu-item is a token-built row', () => {
    expect(decl(menu, '.sv-menu-item', 'gap')).toBe('var(--sv-space-2)');
    expect(decl(menu, '.sv-menu-item', 'padding')).toBe(
      'var(--sv-space-1) var(--sv-space-2)',
    );
    expect(decl(menu, '.sv-menu-item', 'border-radius')).toBe('var(--sv-radius-sm)');
    expect(decl(menu, '.sv-menu-item', 'color')).toBe('var(--sv-text)');
    expect(decl(menu, '.sv-menu-item', 'font-size')).toBe('var(--sv-text-base)');
  });

  test.each([
    ['.sv-menu-item:hover'],
    ['.sv-menu-item[data-highlighted]'],
  ])('%s highlights on the raised surface step', (selector) => {
    // Radix moves [data-highlighted] with the keyboard, so the two input modes
    // have to resolve to the same fill or they drift apart.
    expect(decl(menu, selector, 'background')).toBe('var(--sv-surface-2)');
  });

  test('.sv-menu-item[data-disabled] is dimmed and inert', () => {
    expect(decl(menu, '.sv-menu-item[data-disabled]', 'opacity')).toBe('0.5');
    expect(decl(menu, '.sv-menu-item[data-disabled]', 'pointer-events')).toBe('none');
  });

  test('.sv-menu-item states focus with an outline, never a ring (CLIENT-11)', () => {
    const focus = bodyOf(menu, '.sv-menu-item:focus-visible');
    expect(focus).toMatch(/outline:\s*2px solid var\(--sv-accent-ink\)/);
    expect(focus).toMatch(/outline-offset:\s*2px/);
  });

  test('.sv-menu-item__indicator reserves a token-sized slot (CLIENT-09)', () => {
    expect(decl(menu, '.sv-menu-item__indicator', 'width')).toBe('var(--sv-space-4)');
    expect(decl(menu, '.sv-menu-item__indicator', 'height')).toBe('var(--sv-space-4)');
    expect(decl(menu, '.sv-menu-item__indicator', 'flex-shrink')).toBe('0');
  });

  test('an empty indicator collapses instead of reserving dead space', () => {
    // This is the `pl-8` defect in one rule: without :empty, `icon={null}`
    // would indent the row against an indicator that renders nothing.
    expect(decl(menu, '.sv-menu-item__indicator:empty', 'display')).toBe('none');
  });

  test('.sv-menu-item--inset shifts the row and nothing else', () => {
    // A modifier that also restated the fill or the radius would let inset and
    // non-inset rows diverge visually.
    expect(properties(menu, '.sv-menu-item--inset')).toEqual(['padding-left']);
    expect(decl(menu, '.sv-menu-item--inset', 'padding-left')).toBe('var(--sv-space-8)');
  });

  test('.sv-menu-item__dot is a round, token-sized mark in the row color', () => {
    expect(decl(menu, '.sv-menu-item__dot', 'width')).toBe('var(--sv-space-2)');
    expect(decl(menu, '.sv-menu-item__dot', 'height')).toBe('var(--sv-space-2)');
    expect(decl(menu, '.sv-menu-item__dot', 'border-radius')).toBe('var(--sv-radius-full)');
    expect(decl(menu, '.sv-menu-item__dot', 'background')).toBe('currentColor');
  });

  test('the label, separator and shortcut read from tokens', () => {
    expect(decl(menu, '.sv-menu-label', 'color')).toBe('var(--sv-text-2)');
    expect(decl(menu, '.sv-menu-separator', 'border-top')).toBe(
      '1px solid var(--sv-border)',
    );
    expect(decl(menu, '.sv-menu-shortcut', 'color')).toBe('var(--sv-text-3)');
    expect(decl(menu, '.sv-menu-shortcut', 'font-family')).toBe('var(--sv-font-mono)');
  });

  test('the Menu items section obeys the Still Void design rules', () => {
    expectSystemRules(menu);
  });
});

// ---------------------------------------------------------------------------
// T8 -- Tabs
// ---------------------------------------------------------------------------

const tabs = rulesOf('Tabs');

describe('client CSS contract — the tabs section', () => {
  test.each([
    ['.sv-tabs'],
    ['.sv-tabs__list'],
    ['.sv-tabs__trigger'],
    ['.sv-tabs__content'],
  ])('%s exists as an exact selector, not a prefix match', (selector) => {
    // `.sv-tabs__list` contains the substring `.sv-tabs`; only an exact-key
    // lookup proves the base rule itself is present.
    expect([...tabs.keys()]).toContain(selector);
  });

  test('.sv-tabs__list is a raised strip built from tokens', () => {
    expect(decl(tabs, '.sv-tabs__list', 'background')).toBe('var(--sv-surface-2)');
    expect(decl(tabs, '.sv-tabs__list', 'border-radius')).toBe('var(--sv-radius-md)');
    expect(decl(tabs, '.sv-tabs__list', 'height')).toBe('var(--sv-space-10)');
    expect(decl(tabs, '.sv-tabs__list', 'padding')).toBe('var(--sv-space-1)');
  });

  test('the active trigger lifts by surface step alone (CLIENT-04)', () => {
    // shadow-sm was the shadcn affordance here; the tonal step between
    // --sv-surface-2 and --sv-surface replaces it entirely.
    const active = bodyOf(tabs, ".sv-tabs__trigger[data-state='active']");
    expect(decl(tabs, ".sv-tabs__trigger[data-state='active']", 'background')).toBe(
      'var(--sv-surface)',
    );
    expect(decl(tabs, ".sv-tabs__trigger[data-state='active']", 'color')).toBe(
      'var(--sv-text)',
    );
    expect(active).not.toMatch(/box-shadow/);
  });

  test.each([
    ['.sv-tabs__trigger:focus-visible'],
    ['.sv-tabs__content:focus-visible'],
  ])('%s states focus with an outline, never a ring (CLIENT-11)', (selector) => {
    // ring-ring / ring-offset-background named colors this package never
    // declared, so the strip had no visible keyboard focus at all.
    const focus = bodyOf(tabs, selector);
    expect(focus).toMatch(/outline:\s*2px solid var\(--sv-accent-ink\)/);
    expect(focus).toMatch(/outline-offset:\s*2px/);
  });

  test('.sv-tabs__content is spaced from the strip by a token', () => {
    expect(decl(tabs, '.sv-tabs__content', 'margin-top')).toBe('var(--sv-space-2)');
  });

  test('the Tabs section obeys the Still Void design rules', () => {
    expectSystemRules(tabs);
  });
});
