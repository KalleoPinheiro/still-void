import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * `prefers-reduced-motion` only works if the override actually wins the
 * cascade. A media query adds **no specificity**, so `.sv-overlay { transition:
 * none }` inside `@media (prefers-reduced-motion: reduce)` in `theme.css` loses
 * to `.sv-overlay { transition: … }` in `style.css` — same specificity, later
 * document order, and README.md documents the import order as theme.css first.
 *
 * That is not hypothetical: five classes shipped in v2 with a reduced-motion
 * rule that never applied. This contract pins the property that makes the
 * override real — the reduce block that names a class must live in the same
 * file as that class's base rule, and after it.
 */

const root = process.cwd();
const files = {
  'theme.css': readFileSync(resolve(root, 'src/css/theme.css'), 'utf-8'),
  'style.css': readFileSync(resolve(root, 'src/css/style.css'), 'utf-8'),
} as const;

type SheetName = keyof typeof files;

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** The body of every `@media (prefers-reduced-motion: reduce)` block, with its offsets. */
function reduceBlocks(source: string): { body: string; start: number; end: number }[] {
  const clean = stripComments(source);
  const blocks: { body: string; start: number; end: number }[] = [];
  const opener = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = opener.exec(clean))) {
    // Walk braces so the nested rules inside the media block are not cut short.
    let depth = 1;
    let index = match.index + match[0].length;
    const bodyStart = index;
    while (depth > 0 && index < clean.length) {
      const char = clean[index];
      if (char === '{') depth += 1;
      else if (char === '}') depth -= 1;
      index += 1;
    }
    // `end` is the block's real closing brace, not `start + body.length` —
    // that undercounts by the length of the `@media (...) {` header itself,
    // which sits between `start` and `bodyStart`. Undercounting shrinks the
    // "inside reduce" range short of the block's actual end, so a selector
    // near the close of a reduce block could be misread as a base rule.
    blocks.push({ body: clean.slice(bodyStart, index - 1), start: match.index, end: index });
  }
  return blocks;
}

/** Every `.sv-*` class named inside a reduce block of this sheet. */
function classesUnderReduce(sheet: SheetName): Set<string> {
  const named = new Set<string>();
  for (const block of reduceBlocks(files[sheet])) {
    for (const found of block.body.matchAll(/\.(sv-[a-z0-9_-]+)/g)) {
      named.add(found[1] as string);
    }
  }
  return named;
}

/** Offset of a class's first base declaration (a rule outside any media block). */
function baseRuleOffset(sheet: SheetName, className: string): number {
  const clean = stripComments(files[sheet]);
  const reduceRanges = reduceBlocks(files[sheet]).map(({ start, end }) => ({ start, end }));
  const pattern = new RegExp(`(^|[\\s,>+~])\\.${className}(?![a-z0-9_-])`, 'gm');
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(clean))) {
    const offset = match.index;
    const insideReduce = reduceRanges.some((r) => offset >= r.start && offset <= r.end);
    if (!insideReduce) return offset;
  }
  return -1;
}

const sheets: SheetName[] = ['theme.css', 'style.css'];

describe('reduced-motion overrides win the cascade', () => {
  test.each(sheets)('%s names at least one class under reduce', (sheet) => {
    // Guards the extractor: an empty set would make every assertion below vacuous.
    expect(classesUnderReduce(sheet).size).toBeGreaterThan(0);
  });

  test.each(sheets)('every class %s zeroes is declared in that same sheet', (sheet) => {
    const orphans = [...classesUnderReduce(sheet)].filter(
      (className) => baseRuleOffset(sheet, className) === -1,
    );
    expect(orphans).toEqual([]);
  });

  test.each(sheets)('%s declares each class before it zeroes it', (sheet) => {
    const tooEarly: string[] = [];
    for (const className of classesUnderReduce(sheet)) {
      const base = baseRuleOffset(sheet, className);
      const override = reduceBlocks(files[sheet]).find(({ body }) =>
        new RegExp(`\\.${className}(?![a-z0-9_-])`).test(body),
      );
      if (override !== undefined && base > override.start) tooEarly.push(className);
    }
    expect(tooEarly).toEqual([]);
  });
});

describe('the portal family and the menu chrome are covered', () => {
  test.each(['sv-overlay', 'sv-dialog', 'sv-pop', 'sv-menu-item', 'sv-tabs__trigger'])(
    '%s has its transition zeroed under reduce',
    (className) => {
      expect(classesUnderReduce('style.css')).toContain(className);
    },
  );

  test.each(['sv-card-hover', 'sv-skeleton'])(
    '%s stays in theme.css, where it is declared',
    (className) => {
      expect(classesUnderReduce('theme.css')).toContain(className);
    },
  );
});
