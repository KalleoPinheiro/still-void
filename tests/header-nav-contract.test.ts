import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * Same approach as tests/field-css-contract.test.ts: style.css is read as
 * text and every rule the mobile-nav disclosure promises is asserted to
 * exist, token-only. jsdom has no default stylesheet for <details>/<summary>
 * (verified: no rule matches those tag names in jsdom's UA stylesheet), so
 * asserting the collapse behavior through the DOM would be theatre — the
 * whole point of the pattern is that a real browser's native UA rules do
 * the hiding, and this file's own CSS only has to override them above 640px.
 */

const cssPath = resolve(process.cwd(), 'src/css/style.css');
const css = readFileSync(cssPath, 'utf-8');

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

function section(source: string, name: string): string {
  const marker = `/* ---------- ${name} ---------- */`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Section not found in style.css: ${name}`);
  const rest = source.slice(start + marker.length);
  const next = rest.indexOf('/* ---------- ');
  return next === -1 ? rest : rest.slice(0, next);
}

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

/**
 * `.sv-header__nav-summary` (and a few others) are declared once outside any
 * media query and again inside `@media (max-width: 640px)` with different
 * values — a flat parseRules() map would let the second declaration
 * silently clobber the first. Pull each `@media (...) { ... }` block out by
 * matching balanced braces (one level of nesting) so each scope parses into
 * its own map instead.
 */
function extractMediaBlock(source: string, conditionText: string): { block: string; rest: string } {
  const marker = `@media (${conditionText}) {`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Media block not found: ${conditionText}`);
  const bodyStart = start + marker.length;
  const end = source.indexOf('\n}', bodyStart);
  if (end === -1) throw new Error(`Unterminated media block: ${conditionText}`);
  const block = source.slice(bodyStart, end);
  const rest = source.slice(0, start) + source.slice(end + 2);
  return { block, rest };
}

const headerSection = stripComments(section(css, 'Header'));
const { block: minWidthBlock, rest: withoutMinWidth } = extractMediaBlock(
  headerSection,
  'min-width: 641px',
);
const { block: maxWidthBlock, rest: baseSectionText } = extractMediaBlock(
  withoutMinWidth,
  'max-width: 640px',
);

const header = parseRules(baseSectionText);
const headerMinWidth = parseRules(minWidthBlock);
const headerMaxWidth = parseRules(maxWidthBlock);

function bodyOf(selector: string, scope: Map<string, string> = header): string {
  const body = scope.get(selector);
  if (body === undefined) throw new Error(`Rule not found: ${selector}`);
  return body;
}

function decl(
  selector: string,
  property: string,
  scope: Map<string, string> = header,
): string | undefined {
  const re = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'm');
  const found = bodyOf(selector, scope).match(re);
  return found ? (found[1] as string).trim() : undefined;
}

const BASE_SELECTORS = ['.sv-header__nav', '.sv-header__nav-toggle', '.sv-header__nav-summary'] as const;
const MIN_WIDTH_SELECTORS = [
  '.sv-header__nav-toggle .sv-header__nav',
  '.sv-header__nav-toggle::details-content',
] as const;
const MAX_WIDTH_SELECTORS = [
  '.sv-header__nav-summary',
  '.sv-header__nav-summary:hover',
  '.sv-header__nav-summary:focus-visible',
  '.sv-header__nav-toggle[open] .sv-header__nav',
  '.sv-header__nav-toggle[open] .sv-header__link',
] as const;

describe('style.css Header section — every promised nav-disclosure rule exists', () => {
  test.each(BASE_SELECTORS)('declares %s outside any media query', (selector) => {
    expect([...header.keys()]).toContain(selector);
  });
  test.each(MIN_WIDTH_SELECTORS)('declares %s in the >=641px media query', (selector) => {
    expect([...headerMinWidth.keys()]).toContain(selector);
  });
  test.each(MAX_WIDTH_SELECTORS)('declares %s in the <=640px media query', (selector) => {
    expect([...headerMaxWidth.keys()]).toContain(selector);
  });
  test('declares the native marker resets on .sv-header__nav-summary', () => {
    expect(headerSection).toContain('.sv-header__nav-summary::-webkit-details-marker');
    expect(headerSection).toContain('.sv-header__nav-summary::marker');
  });
});

describe('the disclosure is a no-op wrapper above 640px', () => {
  test('.sv-header__nav-toggle .sv-header__nav is forced visible regardless of [open]', () => {
    expect(decl('.sv-header__nav-toggle .sv-header__nav', 'display', headerMinWidth)).toBe(
      'flex !important',
    );
  });

  test('the summary toggle is hidden by default, outside any media query', () => {
    expect(decl('.sv-header__nav-summary', 'display', header)).toBe('none');
    expect(decl('.sv-header__nav-summary', 'list-style', header)).toBe('none');
  });

  // Newer browsers project non-summary <details> content through a
  // ::details-content pseudo-element the UA stylesheet hides
  // (content-visibility: hidden) while closed — a display override on the
  // light-DOM .sv-header__nav child alone doesn't reach past that shadow
  // ancestor, so it has to be reset separately. A real browser is required
  // to prove this actually renders (jsdom has no ::details-content model at
  // all — see the file-level comment), so this only pins the CSS text
  // exists; it cannot substitute for a browser-rendered check.
  test('::details-content is reset to visible/auto, not just .sv-header__nav', () => {
    expect(decl('.sv-header__nav-toggle::details-content', 'content-visibility', headerMinWidth)).toBe(
      'visible !important',
    );
    expect(decl('.sv-header__nav-toggle::details-content', 'block-size', headerMinWidth)).toBe(
      'auto !important',
    );
    expect(decl('.sv-header__nav-toggle::details-content', 'overflow', headerMinWidth)).toBe(
      'visible !important',
    );
  });
});

describe('the summary becomes a real, focusable tap target below 640px', () => {
  test('shown as an inline-flex button-sized box', () => {
    expect(decl('.sv-header__nav-summary', 'display', headerMaxWidth)).toBe('inline-flex');
    expect(decl('.sv-header__nav-summary', 'width', headerMaxWidth)).toBe('var(--sv-space-10)');
    expect(decl('.sv-header__nav-summary', 'height', headerMaxWidth)).toBe('var(--sv-space-10)');
  });

  test('focus is a real outline, never a ring (matches the rest of the system)', () => {
    expect(decl('.sv-header__nav-summary:focus-visible', 'outline', headerMaxWidth)).toBe(
      '2px solid var(--sv-accent-ink)',
    );
    expect(decl('.sv-header__nav-summary:focus-visible', 'outline-offset', headerMaxWidth)).toBe(
      '2px',
    );
  });
});

describe('the open panel gives every link a real touch target', () => {
  test('the open nav panel is a token-styled surface, not a bare list', () => {
    expect(decl('.sv-header__nav-toggle[open] .sv-header__nav', 'background', headerMaxWidth)).toBe(
      'var(--sv-surface)',
    );
    expect(decl('.sv-header__nav-toggle[open] .sv-header__nav', 'border', headerMaxWidth)).toBe(
      '1px solid var(--sv-border)',
    );
  });

  test('links inside the open panel meet the 44px WCAG 2.5.8 touch target', () => {
    expect(decl('.sv-header__nav-toggle[open] .sv-header__link', 'min-height', headerMaxWidth)).toBe(
      '44px',
    );
  });
});

describe('no rule in the Header section uses box-shadow (Flat-By-Default)', () => {
  test('the whole section is shadow-free', () => {
    expect(headerSection).not.toMatch(/box-shadow/);
  });
});

describe('no rule hardcodes a color literal', () => {
  test.each(BASE_SELECTORS)('%s (base) references only var(--sv-*) colors', (selector) => {
    expect(bodyOf(selector, header)).not.toMatch(/#[0-9a-fA-F]{3}|oklch\(|rgba?\(|hsla?\(/);
  });
  test.each(MAX_WIDTH_SELECTORS)('%s (<=640px) references only var(--sv-*) colors', (selector) => {
    expect(bodyOf(selector, headerMaxWidth)).not.toMatch(/#[0-9a-fA-F]{3}|oklch\(|rgba?\(|hsla?\(/);
  });
});
