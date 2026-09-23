import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * Text contract for the two narrow-viewport rules that consumers were
 * re-implementing locally (VittaFlow `sv-gap: layout-grid-min-content` and
 * `sv-gap: touch-target-size`). jsdom computes no layout, so the rules are
 * proven as text here and as rendered boxes in the consumer's browser tests.
 */

const css = readFileSync(resolve(process.cwd(), 'src/css/style.css'), 'utf-8').replace(
  /\/\*[\s\S]*?\*\//g,
  '',
);

/** Body of every `@media <query> { … }` block whose query matches exactly. */
function mediaBlocks(source: string, query: string): string[] {
  const blocks: string[] = [];
  const opener = `@media ${query} {`;
  let from = source.indexOf(opener);
  while (from !== -1) {
    let depth = 1;
    let i = from + opener.length;
    while (depth > 0 && i < source.length) {
      if (source[i] === '{') depth += 1;
      if (source[i] === '}') depth -= 1;
      i += 1;
    }
    blocks.push(source.slice(from + opener.length, i - 1));
    from = source.indexOf(opener, i);
  }
  return blocks;
}

/** Top-level rules only (outside any @media): selector -> body. */
function topLevelRules(source: string): Map<string, string> {
  const rules = new Map<string, string>();
  let depth = 0;
  let start = 0;
  for (let i = 0; i < source.length; i += 1) {
    if (source[i] === '{') {
      if (depth === 0) {
        const selector = source.slice(start, i).trim();
        const end = source.indexOf('}', i);
        if (!selector.startsWith('@')) {
          for (const s of selector.split(',')) rules.set(s.trim(), source.slice(i + 1, end).trim());
          start = end + 1;
          i = end;
          continue;
        }
      }
      depth += 1;
    } else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) start = i + 1;
    }
  }
  return rules;
}

function declIn(body: string, property: string): string | undefined {
  const found = body.match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'm'));
  return found ? (found[1] as string).trim() : undefined;
}

function ruleIn(block: string, selector: string): string | undefined {
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(block))) {
    const selectors = (match[1] as string).split(',').map((s) => s.trim());
    if (selectors.includes(selector)) return (match[2] as string).trim();
  }
  return undefined;
}

const TOUCH_TARGET = 'calc(var(--sv-space-10) + var(--sv-space-1))';

describe('.sv-layout on narrow viewports', () => {
  test('sv-layout usa minmax(0, 1fr)', () => {
    const body = topLevelRules(css).get('.sv-layout');
    expect(body).toBeDefined();
    expect(declIn(body as string, 'grid-template-columns')).toBe('minmax(0, 1fr)');
  });
});

describe('touch targets', () => {
  const blocks = mediaBlocks(css, '(width < 40rem), (pointer: coarse)');

  test('alvo de toque de 44px em sv-btn e sv-field', () => {
    expect(blocks.length).toBeGreaterThan(0);
    const joined = blocks.join('\n');
    for (const selector of ['.sv-btn', '.sv-field']) {
      const body = ruleIn(joined, selector);
      expect(body, `${selector} inside the touch media query`).toBeDefined();
      expect(declIn(body as string, 'min-height')).toBe(TOUCH_TARGET);
    }
  });

  test('icon buttons also reach 44px wide', () => {
    const body = ruleIn(blocks.join('\n'), '.sv-btn--icon');
    expect(body).toBeDefined();
    expect(declIn(body as string, 'min-width')).toBe(TOUCH_TARGET);
  });

  test('pointer-fine desktop keeps the base heights', () => {
    const top = topLevelRules(css);
    expect(declIn(top.get('.sv-btn') as string, 'min-height')).toBeUndefined();
    expect(declIn(top.get('.sv-field') as string, 'min-height')).toBeUndefined();
  });
});
