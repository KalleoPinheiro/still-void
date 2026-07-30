import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { accents, accentsInk, colors, semantic, semanticInk } from '../src/tokens/colors';

/**
 * theme.css duplicates every color value from tokens/colors.ts by hand (CSS
 * custom properties can't import a .ts module). Nothing else catches drift
 * between the two — this test parses theme.css's :root and
 * [data-theme='light'] blocks and asserts every value still matches its TS
 * source. If this test breaks, the fix is almost always "the CSS value
 * wasn't updated to match the token that was", not the other way around.
 */

const themeCssPath = resolve(process.cwd(), 'src/css/theme.css');
const css = readFileSync(themeCssPath, 'utf-8');

function extractBlock(source: string, selector: string): string {
  const start = source.indexOf(selector);
  if (start === -1) throw new Error(`Selector not found in theme.css: ${selector}`);
  const braceStart = source.indexOf('{', start);
  const braceEnd = source.indexOf('}', braceStart);
  return source.slice(braceStart + 1, braceEnd);
}

function parseVars(block: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const re = /--sv-([\w-]+):\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(block))) {
    const [, name, value] = match;
    vars[name as string] = (value as string).trim();
  }
  return vars;
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s*,\s*/g, ',')
    // "0.10" and "0.1" are the same number — don't fail on trailing-zero
    // style differences between hand-written CSS and TS literals.
    .replace(/-?\d+\.?\d*/g, (n) => String(parseFloat(n)));
}

/**
 * Some -ink vars alias another var in the same block instead of repeating a
 * literal (e.g. dark-mode `--sv-danger-ink: var(--sv-danger);`, since ink and
 * surface are identical in dark mode). Follow one level of `var(--sv-x)`
 * indirection so the parity check still reaches a literal to compare.
 */
function resolveVar(cssVars: Record<string, string>, varName: string): string | undefined {
  const raw = cssVars[varName];
  if (raw === undefined) return undefined;
  const alias = raw.match(/^var\(--sv-([\w-]+)\)$/);
  if (!alias) return raw;
  const [, aliasName] = alias;
  const resolved = cssVars[aliasName as string];
  if (resolved === undefined) {
    throw new Error(`--sv-${varName} aliases undeclared --sv-${aliasName}`);
  }
  return resolved;
}

function expectMatch(cssVars: Record<string, string>, varName: string, tsValue: string): void {
  const cssValue = resolveVar(cssVars, varName);
  if (cssValue === undefined) {
    throw new Error(`--sv-${varName} is not declared in this block`);
  }
  expect(normalize(cssValue)).toBe(normalize(tsValue));
}

const root = parseVars(extractBlock(css, ':root {'));
const light = parseVars(extractBlock(css, "[data-theme='light'] {"));

describe('theme.css :root matches tokens/colors.ts (dark)', () => {
  test.each([
    ['bg', colors.dark.bg],
    ['bg-elev', colors.dark.bgElev],
    ['surface', colors.dark.surface],
    ['surface-2', colors.dark.surface2],
    ['border', colors.dark.border],
    ['border-strong', colors.dark.borderStrong],
    ['text', colors.dark.text],
    ['text-2', colors.dark.text2],
    ['text-3', colors.dark.text3],
    ['accent-cyan', accents.cyan],
    ['accent-violet', accents.violet],
    ['accent-mint', accents.mint],
    ['accent-amber', accents.amber],
    ['accent-cyan-ink', accentsInk.dark.cyan],
    ['accent-violet-ink', accentsInk.dark.violet],
    ['accent-mint-ink', accentsInk.dark.mint],
    ['accent-amber-ink', accentsInk.dark.amber],
    ['danger', semantic.dark.danger],
    ['success', semantic.dark.success],
    ['info', semantic.dark.info],
    ['warning', semantic.dark.warning],
    ['danger-ink', semanticInk.dark.danger],
    ['success-ink', semanticInk.dark.success],
    ['info-ink', semanticInk.dark.info],
    ['warning-ink', semanticInk.dark.warning],
  ])('--sv-%s', (name, tsValue) => {
    expectMatch(root, name, tsValue);
  });
});

describe("theme.css [data-theme='light'] matches tokens/colors.ts (light)", () => {
  test.each([
    ['bg', colors.light.bg],
    ['bg-elev', colors.light.bgElev],
    ['surface', colors.light.surface],
    ['surface-2', colors.light.surface2],
    ['border', colors.light.border],
    ['border-strong', colors.light.borderStrong],
    ['text', colors.light.text],
    ['text-2', colors.light.text2],
    ['text-3', colors.light.text3],
    ['accent-cyan-ink', accentsInk.light.cyan],
    ['accent-violet-ink', accentsInk.light.violet],
    ['accent-mint-ink', accentsInk.light.mint],
    ['accent-amber-ink', accentsInk.light.amber],
    ['danger-ink', semanticInk.light.danger],
    ['success-ink', semanticInk.light.success],
    ['info-ink', semanticInk.light.info],
    ['warning-ink', semanticInk.light.warning],
  ])('--sv-%s', (name, tsValue) => {
    expectMatch(light, name, tsValue);
  });
});
