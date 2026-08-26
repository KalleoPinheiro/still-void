import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * R4-06 AC6: `.sv-chart` must be REAL CSS, `overflow: visible` (axis labels
 * at the edge of the viewBox must not clip), grid/axis colors from
 * `var(--sv-border)`/`var(--sv-text-2)`, and no box-shadow anywhere in the
 * section (series color is a caller prop, not something this section fixes).
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

const rules = parseRules(stripComments(section(css, 'Chart')));

function bodyOf(selector: string): string {
  const body = rules.get(selector);
  if (body === undefined) throw new Error(`Rule not found in Chart section: ${selector}`);
  return body;
}

function decl(selector: string, property: string): string | undefined {
  const re = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'm');
  const found = bodyOf(selector).match(re);
  return found ? (found[1] as string).trim() : undefined;
}

describe('Chart CSS contract (R4-06 AC6)', () => {
  test('.sv-chart is overflow: visible', () => {
    expect(decl('.sv-chart', 'overflow')).toBe('visible');
  });

  test('.sv-chart__grid-line reads var(--sv-border)', () => {
    expect(decl('.sv-chart__grid-line', 'stroke')).toBe('var(--sv-border)');
  });

  test('.sv-chart__axis and .sv-chart__axis-label read var(--sv-text-2)', () => {
    expect(decl('.sv-chart__axis', 'stroke')).toBe('var(--sv-text-2)');
    expect(decl('.sv-chart__axis-label', 'fill')).toBe('var(--sv-text-2)');
  });

  test('no box-shadow anywhere in the Chart section', () => {
    const section_ = stripComments(section(css, 'Chart'));
    expect(section_).not.toMatch(/box-shadow\s*:\s*(?!none)/);
  });
});
