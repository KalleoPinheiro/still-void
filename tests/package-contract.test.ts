import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * D4: `shadcn-overrides.css` existed in `src/css/` but was never copied to
 * `dist/` and never given an export subpath, even though DESIGN.md:226
 * claims the layer is active. This contract pins the fix at the source —
 * text-level checks on the build script and `package.json`, in the style of
 * `tests/tokenParity.test.ts` and `tests/tailwind-config-contract.test.ts`.
 *
 * The sheet must stay **opt-in**: it applies `box-shadow: none !important`
 * to bare `button`/`input`/`select`/`textarea` selectors (see design.md's
 * Risks & Concerns), so nothing in `src/css/` may import it — auto-loading
 * it would reach into a consumer's own components, not just the package's.
 */

const root = process.cwd();
const copyCssScript = readFileSync(resolve(root, 'scripts/copy-css.mjs'), 'utf-8');
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8')) as {
  exports: Record<string, unknown>;
  scripts: Record<string, string>;
};
const themeCss = readFileSync(resolve(root, 'src/css/theme.css'), 'utf-8');
const styleCss = readFileSync(resolve(root, 'src/css/style.css'), 'utf-8');

describe('scripts/copy-css.mjs copies all three CSS files', () => {
  test.each(['theme.css', 'style.css', 'shadcn-overrides.css'])(
    'copies src/css/%s to dist/',
    (fileName) => {
      const escaped = fileName.replace('.', '\\.');
      const copyCallPattern = new RegExp(
        `copyFile\\([\\s\\S]*?['"\`]src/css/${escaped}['"\`][\\s\\S]*?['"\`]${escaped}['"\`][\\s\\S]*?\\)`,
      );
      expect(copyCssScript).toMatch(copyCallPattern);
    },
  );
});

describe('package.json exposes the shadcn-overrides.css subpath', () => {
  test('exports["./shadcn-overrides.css"] points at dist/shadcn-overrides.css', () => {
    expect(packageJson.exports['./shadcn-overrides.css']).toBe('./dist/shadcn-overrides.css');
  });
});

describe('shadcn-overrides.css stays opt-in, never auto-loaded', () => {
  test('theme.css does not reference shadcn-overrides.css', () => {
    expect(themeCss).not.toMatch(/shadcn-overrides/);
  });

  test('style.css does not reference shadcn-overrides.css', () => {
    expect(styleCss).not.toMatch(/shadcn-overrides/);
  });
});

describe('attw excludes the CSS-only entrypoints, including the new subpath', () => {
  test('lint:package passes --exclude-entrypoints theme.css style.css shadcn-overrides.css', () => {
    const lintScript = packageJson.scripts['lint:package'];
    expect(lintScript).toContain('--exclude-entrypoints');
    expect(lintScript).toMatch(/--exclude-entrypoints[^&]*\btheme\.css\b/);
    expect(lintScript).toMatch(/--exclude-entrypoints[^&]*\bstyle\.css\b/);
    expect(lintScript).toMatch(/--exclude-entrypoints[^&]*\bshadcn-overrides\.css\b/);
  });
});
