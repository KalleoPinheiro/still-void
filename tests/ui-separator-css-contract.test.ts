import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * R4-03 AC5: `.sv-separator` must be REAL CSS in style.css, colored from
 * `var(--sv-border)` (the same hairline every other border in the system
 * reads), never a box-shadow. Parsed the same way
 * tests/component-css-contract.test.ts does, so a ghost class (rule name
 * present, no declarations behind it) cannot pass silently.
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

const rules = parseRules(stripComments(section(css, 'Separator')));

function bodyOf(selector: string): string {
  const body = rules.get(selector);
  if (body === undefined) throw new Error(`Rule not found in Separator section: ${selector}`);
  return body;
}

function decl(selector: string, property: string): string | undefined {
  const re = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'm');
  const found = bodyOf(selector).match(re);
  return found ? (found[1] as string).trim() : undefined;
}

describe('Separator CSS contract (R4-03 AC5)', () => {
  test('.sv-separator reads its color from var(--sv-border)', () => {
    expect(decl('.sv-separator', 'background')).toBe('var(--sv-border)');
  });

  test('.sv-separator carries no box-shadow anywhere in the section', () => {
    const section_ = stripComments(section(css, 'Separator'));
    expect(section_).not.toMatch(/box-shadow\s*:\s*(?!none)/);
  });

  test('.sv-separator--vertical flips the axis (width/height swap)', () => {
    expect(decl('.sv-separator', 'height')).toBe('1px');
    expect(decl('.sv-separator', 'width')).toBe('100%');
    expect(decl('.sv-separator--vertical', 'height')).toBe('100%');
    expect(decl('.sv-separator--vertical', 'width')).toBe('1px');
  });
});
