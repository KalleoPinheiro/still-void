import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * The Pagination section must be REAL CSS, tokens-only (var(--sv-*)), no
 * box-shadow, and the active state must read the surface/text tokens the
 * rest of the catalog uses for "current" (never a hardcoded color).
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

const rules = parseRules(stripComments(section(css, 'Pagination')));

function bodyOf(selector: string): string {
  const body = rules.get(selector);
  if (body === undefined) throw new Error(`Rule not found in Pagination section: ${selector}`);
  return body;
}

function decl(selector: string, property: string): string | undefined {
  const re = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'm');
  const found = bodyOf(selector).match(re);
  return found ? (found[1] as string).trim() : undefined;
}

describe('Pagination CSS contract', () => {
  test('.sv-pagination__link--active reads surface/text tokens', () => {
    expect(decl('.sv-pagination__link--active', 'background')).toBe('var(--sv-surface)');
    expect(decl('.sv-pagination__link--active', 'color')).toBe('var(--sv-text)');
  });

  test('.sv-pagination__link:hover reads var(--sv-surface-2)', () => {
    expect(decl('.sv-pagination__link:hover', 'background')).toBe('var(--sv-surface-2)');
  });

  test('.sv-pagination__link:focus-visible uses an outline, never a shadow', () => {
    expect(decl('.sv-pagination__link:focus-visible', 'outline')).toBe(
      '2px solid var(--sv-accent-ink)',
    );
  });

  test('no box-shadow anywhere in the Pagination section', () => {
    const section_ = stripComments(section(css, 'Pagination'));
    expect(section_).not.toMatch(/box-shadow\s*:\s*(?!none)/);
  });
});
