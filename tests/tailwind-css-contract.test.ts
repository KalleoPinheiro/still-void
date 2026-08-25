import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * TW-01, TW-02, TW-03, TW-05. src/css/tailwind.css is the v4 CSS-first entry
 * a consumer imports to get sv-* Tailwind utilities in their OWN markup — it
 * plays no part in styling this package's own components (those are sv-*
 * classes in style.css, AD-001). This file checks the four properties the
 * spec pins: the block uses `@theme inline` (required — see the file's own
 * header comment for why a bare `@theme` would freeze on one theme), every
 * value traces back to a `var(--sv-*)`, no `@source` and none of the four
 * dead aliases the original report's literal block carried (AD-011), and
 * every `--color-sv-*` key has a real token behind it in theme.css.
 */

const root = process.cwd();
const tailwindCss = readFileSync(resolve(root, 'src/css/tailwind.css'), 'utf-8');
const themeCss = readFileSync(resolve(root, 'src/css/theme.css'), 'utf-8');
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8')) as {
  exports: Record<string, unknown>;
};
const copyCssScript = readFileSync(resolve(root, 'scripts/copy-css.mjs'), 'utf-8');

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** The body of the (first, only) `@theme inline { ... }` block. */
function themeBlock(): string {
  const clean = stripComments(tailwindCss);
  const header = clean.match(/@theme\s+inline\s*\{/);
  if (header === null) throw new Error('No @theme inline block found in tailwind.css');
  const start = (header.index ?? 0) + header[0].length;
  const end = clean.indexOf('}', start);
  return clean.slice(start, end);
}

/** `--key: value;` pairs inside a block, key without the leading `--`. */
function parseDeclarations(block: string): Map<string, string> {
  const decls = new Map<string, string>();
  const re = /--([\w-]+):\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(block))) {
    decls.set(match[1] as string, (match[2] as string).trim());
  }
  return decls;
}

describe('tailwind.css uses @theme inline, not a bare @theme (TW-02)', () => {
  test('the block is declared with the inline modifier', () => {
    expect(stripComments(tailwindCss)).toMatch(/@theme\s+inline\s*\{/);
  });

  test('no second, non-inline @theme block exists', () => {
    const matches = stripComments(tailwindCss).match(/@theme(?!\s+inline)\s*\{/g);
    expect(matches).toBeNull();
  });
});

describe('every declared value traces back to a design token (TW-02)', () => {
  const decls = parseDeclarations(themeBlock());

  test('the block declares at least one variable', () => {
    // Guards the parser: an empty map would make the loop below vacuous.
    expect(decls.size).toBeGreaterThan(0);
  });

  test.each([...decls.entries()])('--%s is var(--sv-*), never a literal', (_key, value) => {
    expect(value).toMatch(/^var\(--sv-[\w-]+\)$/);
  });
});

describe('tailwind.css carries none of the report\'s dead aliases (AD-011)', () => {
  test.each([
    '--color-background',
    '--color-ring',
    '--color-destructive',
    '--color-destructive-foreground',
  ])('%s is not declared', (deadAlias) => {
    expect(stripComments(tailwindCss)).not.toContain(`${deadAlias}:`);
  });

  test('no @source directive is present', () => {
    expect(stripComments(tailwindCss)).not.toMatch(/@source/);
  });
});

describe('color and radius keys are namespaced sv-*, not overriding Tailwind defaults', () => {
  const decls = parseDeclarations(themeBlock());
  const colorKeys = [...decls.keys()].filter((k) => k.startsWith('color-'));
  const radiusKeys = [...decls.keys()].filter((k) => k.startsWith('radius-'));

  test('at least one color and one radius key exist', () => {
    expect(colorKeys.length).toBeGreaterThan(0);
    expect(radiusKeys.length).toBeGreaterThan(0);
  });

  test.each(colorKeys)('color-%s is namespaced sv-', (key) => {
    expect(key).toMatch(/^color-sv-/);
  });

  test.each(radiusKeys)('radius-%s is namespaced sv-', (key) => {
    expect(key).toMatch(/^radius-sv-/);
  });
});

describe('spacing ties to the token scale through the single multiplier', () => {
  test('--spacing is declared as var(--sv-space-1), not redeclared per step', () => {
    const decls = parseDeclarations(themeBlock());
    expect(decls.get('spacing')).toBe('var(--sv-space-1)');
  });
});

describe('every --color-sv-* key has a real token behind it in theme.css (TW-05)', () => {
  const decls = parseDeclarations(themeBlock());
  const colorRefs = [...decls.entries()]
    .filter(([key]) => key.startsWith('color-sv-'))
    .map(([, value]) => (value.match(/^var\((--sv-[\w-]+)\)$/) as RegExpMatchArray)[1] as string);

  test('at least one color token reference was extracted', () => {
    expect(colorRefs.length).toBeGreaterThan(0);
  });

  test.each(colorRefs)('%s is declared in theme.css', (token) => {
    expect(stripComments(themeCss)).toContain(`${token}:`);
  });
});

describe('package.json and the build script publish tailwind.css (TW-03)', () => {
  test('exports["./tailwind.css"] points at dist/tailwind.css', () => {
    expect(packageJson.exports['./tailwind.css']).toBe('./dist/tailwind.css');
  });

  test('copy-css.mjs copies src/css/tailwind.css to dist/', () => {
    const copyCallPattern =
      /copyFile\([\s\S]*?['"`]src\/css\/tailwind\.css['"`][\s\S]*?['"`]tailwind\.css['"`][\s\S]*?\)/;
    expect(copyCssScript).toMatch(copyCallPattern);
  });
});

/**
 * TW-01. Everything above checks tailwind.css as text; this actually compiles
 * it with the installed tailwindcss engine and inspects the generated
 * utility rules — proof, not inference, that a consumer's `bg-sv-surface`
 * resolves the way the spec says it must.
 */
describe('a real Tailwind v4 compile resolves the sv-* utilities (TW-01)', () => {
  test('bg-*, text-*, rounded-*, p-* and font-* utilities compile to var(--sv-*)', async () => {
    const { compile } = await import('tailwindcss');
    const { readFileSync } = await import('node:fs');
    const { resolve: resolvePath, dirname, join } = await import('node:path');
    const { createRequire } = await import('node:module');

    const requireFromRoot = createRequire(resolvePath(root, 'package.json'));

    async function loadStylesheet(id: string, base: string) {
      let file: string;
      if (id.startsWith('.') || id.startsWith('/')) {
        file = resolvePath(base, id);
      } else {
        // Bare specifier ("tailwindcss"): resolve the package root, then
        // read its "style" export condition — the CSS entry, not the JS one
        // require.resolve() would hand back.
        const pkgJsonPath = requireFromRoot.resolve(join(id, 'package.json'));
        const pkgDir = dirname(pkgJsonPath);
        const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8')) as {
          exports?: { '.'?: { style?: string } };
          style?: string;
        };
        const styleEntry = pkg.exports?.['.']?.style ?? pkg.style;
        if (styleEntry === undefined) throw new Error(`No "style" export found for ${id}`);
        file = resolvePath(pkgDir, styleEntry);
      }
      return { content: readFileSync(file, 'utf-8'), base: dirname(file), path: file };
    }

    const cssSource = `@import "tailwindcss";\n${tailwindCss}`;
    const compiled = await compile(cssSource, { base: root, loadStylesheet });
    const output = compiled.build([
      'bg-sv-surface',
      'text-sv-text',
      'rounded-sv-lg',
      'p-6',
      'font-sv-display',
    ]);

    // Whitespace-tolerant: exact formatting of the generated CSS is the
    // compiler's business, not this contract's. What matters is that each
    // utility resolves to a declaration referencing the right token.
    function rule(selector: string, declaration: string): RegExp {
      const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`${escapedSelector}\\s*\\{[^}]*${declaration}[^}]*\\}`);
    }

    expect(output).toMatch(rule('.bg-sv-surface', 'background-color:\\s*var\\(--sv-surface\\)'));
    expect(output).toMatch(rule('.text-sv-text', 'color:\\s*var\\(--sv-text\\)'));
    expect(output).toMatch(rule('.rounded-sv-lg', 'border-radius:\\s*var\\(--sv-radius-lg\\)'));
    expect(output).toMatch(rule('.p-6', 'padding:\\s*calc\\(var\\(--sv-space-1\\)\\s*\\*\\s*6\\)'));
    expect(output).toMatch(rule('.font-sv-display', 'font-family:\\s*var\\(--sv-font-display\\)'));
  });
});
