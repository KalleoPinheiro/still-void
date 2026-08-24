import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * D1: the Tailwind color tokens used to be hex/oklch/rgba literals copied from
 * the dark palette, so anything styled through the Tailwind layer stayed
 * near-black under [data-theme='light'] no matter what theme.css said. This
 * test pins the fix at the source — a literal reintroduced here fails CI
 * instead of reaching a consumer's light-mode page.
 *
 * The config is read as text rather than imported: it is a v3-style config in
 * a repo that declares tailwindcss v4, and importing it would drag that
 * (separately scoped) type mismatch into this feature's typecheck gate.
 *
 * T16 moved the config object out of the root `tailwind.config.ts` (now a
 * one-line re-export) into `src/tailwind-preset.ts`, the published
 * `./tailwind-preset` entry — that file is the source of truth this test
 * reads now.
 */

const configPath = resolve(process.cwd(), 'src/tailwind-preset.ts');
const source = readFileSync(configPath, 'utf-8');
const themeCss = readFileSync(resolve(process.cwd(), 'src/css/theme.css'), 'utf-8');

/** Names of the custom properties theme.css declares (a `--sv-x:` on the left). */
const declaredVars = new Set(themeCss.match(/--sv-[\w-]+(?=\s*:)/g) ?? []);

function colorsBlock(src: string): string {
  const start = src.indexOf('colors: {');
  if (start === -1) throw new Error('theme.extend.colors not found in tailwind.config.ts');
  const braceStart = src.indexOf('{', start);
  const braceEnd = src.indexOf('}', braceStart);
  return src.slice(braceStart + 1, braceEnd).replace(/\/\/[^\n]*/g, '');
}

function parseEntries(block: string): Array<[string, string]> {
  const entries: Array<[string, string]> = [];
  const re = /'([\w-]+)'\s*:\s*'([^']*)'/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(block))) {
    entries.push([match[1] as string, match[2] as string]);
  }
  return entries;
}

const entries = parseEntries(colorsBlock(source));

describe('theme.extend.colors is bound to theme.css, not to literals', () => {
  test('declares no hex, oklch or rgba literal', () => {
    expect(entries.map(([, value]) => value).join(' ')).not.toMatch(/#|oklch\(|rgba?\(|hsla?\(/);
  });

  test.each(entries)('%s resolves through %s, a variable theme.css declares', (key, value) => {
    expect(value).toMatch(/^var\(--sv-[a-z0-9-]+\)$/);
    expect(declaredVars).toContain(value.slice('var('.length, -1));
  });
});

describe('the inert light-mode aliases are gone', () => {
  test('no color key ends in -light', () => {
    expect(entries.map(([key]) => key).filter((key) => key.endsWith('-light'))).toEqual([]);
  });

  test('exactly the thirteen live keys remain', () => {
    expect(entries.map(([key]) => key).sort()).toEqual([
      'sv-bg',
      'sv-bg-elev',
      'sv-border',
      'sv-border-strong',
      'sv-quiet-mint',
      'sv-signal-cyan',
      'sv-surface',
      'sv-surface-2',
      'sv-text',
      'sv-text-2',
      'sv-text-3',
      'sv-twilight-violet',
      'sv-warm-amber',
    ]);
  });
});
