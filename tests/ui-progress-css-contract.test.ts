import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * R4-04 AC6: `.sv-progress` (track) and `.sv-progress__indicator` (fill)
 * must be REAL CSS in style.css, colored from `var(--sv-surface-2)` and
 * `var(--sv-accent)` respectively, never a box-shadow.
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

const rules = parseRules(stripComments(section(css, 'Progress')));

function bodyOf(selector: string): string {
  const body = rules.get(selector);
  if (body === undefined) throw new Error(`Rule not found in Progress section: ${selector}`);
  return body;
}

function decl(selector: string, property: string): string | undefined {
  const re = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'm');
  const found = bodyOf(selector).match(re);
  return found ? (found[1] as string).trim() : undefined;
}

describe('Progress CSS contract (R4-04 AC6)', () => {
  test('.sv-progress (track) reads its background from var(--sv-surface-2)', () => {
    expect(decl('.sv-progress', 'background')).toBe('var(--sv-surface-2)');
  });

  test('.sv-progress__indicator (fill) reads its background from var(--sv-accent)', () => {
    expect(decl('.sv-progress__indicator', 'background')).toBe('var(--sv-accent)');
  });

  test('no box-shadow anywhere in the Progress section', () => {
    const section_ = stripComments(section(css, 'Progress'));
    expect(section_).not.toMatch(/box-shadow\s*:\s*(?!none)/);
  });
});
