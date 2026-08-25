import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * ICON-02: the icon size scale is CSS-only by construction. Heroicons ship on
 * the 24 grid with no width/height attribute and no `size` prop, so `.sv-icon`
 * is the ONLY thing that sizes an icon — a missing or hollowed-out rule renders
 * every icon at the SVG default, silently, in every consumer.
 *
 * jsdom never loads style.css, so getComputedStyle cannot resolve var(--sv-*).
 * The contract is therefore verified as text, with the selector -> body parser
 * that tests/component-css-contract.test.ts and tests/field-css-contract.test.ts
 * already use. Substring checks are not enough here: `.sv-icon--sm` contains the
 * substring `.sv-icon`, so `toContain('.sv-icon')` would stay green with the
 * base rule deleted.
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

const icons = parseRules(stripComments(section(css, 'Icons')));

function bodyOf(selector: string): string {
  const body = icons.get(selector);
  if (body === undefined) throw new Error(`Rule not found in Icons section: ${selector}`);
  return body;
}

function decl(selector: string, property: string): string | undefined {
  const re = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'm');
  const found = bodyOf(selector).match(re);
  return found ? (found[1] as string).trim() : undefined;
}

/** Every declared property name in a rule body, in source order. */
function properties(selector: string): string[] {
  return bodyOf(selector)
    .split(';')
    .map((piece) => piece.split(':')[0]?.trim() ?? '')
    .filter((name) => name.length > 0);
}

/**
 * The scale: `md` is the default and has no modifier, so the base rule carries
 * it. Each step is a spacing token, never a literal — that is what keeps an icon
 * aligned with the control it sits inside.
 */
const sizeRules = [
  { selector: '.sv-icon', size: 'var(--sv-space-5)' },
  { selector: '.sv-icon--sm', size: 'var(--sv-space-4)' },
  { selector: '.sv-icon--lg', size: 'var(--sv-space-6)' },
];

describe('icon CSS contract — the size scale', () => {
  test.each(sizeRules)(
    '$selector exists as an exact selector and sizes from $size',
    ({ selector, size }) => {
      // Exact-key lookup, not a substring: `.sv-icon--sm` satisfies a
      // `toContain('.sv-icon')` check while the base rule is gone.
      expect([...icons.keys()]).toContain(selector);
      expect(decl(selector, 'width')).toBe(size);
      expect(decl(selector, 'height')).toBe(size);
    },
  );

  test('.sv-icon inherits its color and refuses to be squeezed by flex', () => {
    // currentColor is what makes an icon follow the text it sits next to, in
    // both themes and under every [data-accent], with no consumer config.
    expect(decl('.sv-icon', 'color')).toBe('currentColor');
    expect(decl('.sv-icon', 'flex-shrink')).toBe('0');
  });

  test('the size modifiers change the size and nothing else', () => {
    // A modifier that also restated color or display would let the two sizes
    // drift apart visually; the scale must be one axis only.
    for (const selector of ['.sv-icon--sm', '.sv-icon--lg']) {
      expect(properties(selector)).toEqual(['width', 'height']);
    }
  });
});

describe('icon CSS contract — Still Void design rules', () => {
  test('the Icons section uses tokens only, with no shadow and no !important', () => {
    for (const [selector, body] of icons.entries()) {
      // A literal length here would break the alignment with the spacing scale
      // the rest of the system is built on; a literal color would freeze the
      // icon on one theme.
      expect(body, selector).not.toMatch(/\b\d+(?:\.\d+)?px\b/);
      expect(body, selector).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(body, selector).not.toMatch(/\boklch\(/);
      expect(body, selector).not.toMatch(/\brgba?\(/);
      // Flat-By-Default, and no cascade escape hatch (CLIENT-08's rule, applied
      // here too since this section ships in the same sheet).
      expect(body, selector).not.toMatch(/box-shadow/);
      expect(body, selector).not.toMatch(/!important/);
    }
  });
});
