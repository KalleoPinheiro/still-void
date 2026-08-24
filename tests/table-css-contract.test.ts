import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * Same text-contract approach as tests/field-css-contract.test.ts: jsdom never
 * loads style.css, so the table's theme-awareness is verified by proving every
 * color, spacing and radius in the section resolves through var(--sv-*) rather
 * than a literal that would freeze the table on one palette.
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
      const key = selector.trim().replace(/\s+/g, ' ');
      if (key) rules.set(key, body);
    }
  }
  return rules;
}

function bodyOf(selector: string): string {
  const body = tableRules.get(selector);
  if (body === undefined) throw new Error(`Rule not found in Table section: ${selector}`);
  return body;
}

function decl(selector: string, property: string): string | undefined {
  const re = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'm');
  const found = bodyOf(selector).match(re);
  return found ? (found[1] as string).trim() : undefined;
}

const tableSection = stripComments(section(css, 'Table'));
const tableRules = parseRules(tableSection);

const REQUIRED_SELECTORS = [
  '.sv-table-container',
  '.sv-table',
  '.sv-table__head',
  '.sv-table__th',
  '.sv-table__td',
  '.sv-table__row',
  '.sv-table__body .sv-table__row:last-child',
  '.sv-table__row:hover',
  '.sv-table__foot',
  '.sv-table__caption',
] as const;

/** The 9 classes the table() recipe will hand out — none may be a ghost class. */
const REQUIRED_CLASSES = [
  'sv-table-container',
  'sv-table',
  'sv-table__head',
  'sv-table__body',
  'sv-table__foot',
  'sv-table__row',
  'sv-table__th',
  'sv-table__td',
  'sv-table__caption',
] as const;

describe('style.css Table section — every promised rule exists', () => {
  test.each(REQUIRED_SELECTORS)('declares %s', (selector) => {
    expect([...tableRules.keys()]).toContain(selector);
  });

  test.each(REQUIRED_CLASSES)('%s is styled, not a ghost class', (className) => {
    expect(tableSection).toMatch(new RegExp(`\\.${className}(?![\\w-])`));
  });
});

describe('a wide table scrolls inside its own block', () => {
  test('the container scrolls horizontally at full width', () => {
    expect(decl('.sv-table-container', 'overflow-x')).toBe('auto');
    expect(decl('.sv-table-container', 'width')).toBe('100%');
  });
});

describe('.sv-table base', () => {
  test('collapses borders, fills the container and renders the caption below', () => {
    expect(decl('.sv-table', 'width')).toBe('100%');
    expect(decl('.sv-table', 'border-collapse')).toBe('collapse');
    expect(decl('.sv-table', 'caption-side')).toBe('bottom');
  });

  test('type and color come from tokens', () => {
    expect(decl('.sv-table', 'font-size')).toBe('var(--sv-text-sm)');
    expect(decl('.sv-table', 'color')).toBe('var(--sv-text)');
  });
});

describe('header, body and footer decoration', () => {
  test('the header band uses the page background token', () => {
    expect(decl('.sv-table__head', 'background')).toBe('var(--sv-bg)');
  });

  test('column headers are uppercase micro-type on a token separator', () => {
    expect(decl('.sv-table__th', 'height')).toBe('var(--sv-space-10)');
    expect(decl('.sv-table__th', 'padding')).toBe('0 var(--sv-space-3)');
    expect(decl('.sv-table__th', 'text-align')).toBe('start');
    expect(decl('.sv-table__th', 'font-size')).toBe('var(--sv-text-xs)');
    expect(decl('.sv-table__th', 'text-transform')).toBe('uppercase');
    expect(decl('.sv-table__th', 'color')).toBe('var(--sv-text-3)');
    expect(decl('.sv-table__th', 'border-bottom')).toBe('1px solid var(--sv-border)');
  });

  test('cells pad on the token scale and align middle', () => {
    expect(decl('.sv-table__td', 'padding')).toBe('var(--sv-space-3)');
    expect(decl('.sv-table__td', 'vertical-align')).toBe('middle');
  });

  test('rows are separated by a token border and the last body row drops it', () => {
    expect(decl('.sv-table__row', 'border-bottom')).toBe('1px solid var(--sv-border)');
    expect(decl('.sv-table__body .sv-table__row:last-child', 'border-bottom')).toBe('0');
  });

  test('row hover tints with a token surface on token motion', () => {
    expect(decl('.sv-table__row:hover', 'background')).toBe('var(--sv-surface-2)');
    expect(decl('.sv-table__row', 'transition')).toBe(
      'background var(--sv-duration-fast) var(--sv-ease-hover)',
    );
  });

  test('the footer separates upward and reads as a total row', () => {
    expect(decl('.sv-table__foot', 'border-top')).toBe('1px solid var(--sv-border)');
    expect(decl('.sv-table__foot', 'background')).toBe('var(--sv-surface)');
    expect(decl('.sv-table__foot', 'font-weight')).toBe('600');
  });

  test('the caption reads as muted secondary text below the table', () => {
    expect(decl('.sv-table__caption', 'margin-top')).toBe('var(--sv-space-4)');
    expect(decl('.sv-table__caption', 'color')).toBe('var(--sv-text-2)');
    expect(decl('.sv-table__caption', 'font-size')).toBe('var(--sv-text-sm)');
  });
});

describe('the table stays flat and theme-driven', () => {
  test('no Table rule uses box-shadow (Flat-By-Default)', () => {
    expect(tableSection).not.toMatch(/box-shadow/);
  });

  test.each(REQUIRED_SELECTORS)('%s references only var(--sv-*) colors', (selector) => {
    expect(bodyOf(selector)).not.toMatch(/#[0-9a-fA-F]{3}|oklch\(|rgba?\(|hsla?\(/);
  });
});
