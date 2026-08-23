import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import stillVoidPreset from '../src/tailwind-preset';

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
  files: string[];
  peerDependencies: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  typesVersions?: { '*'?: Record<string, string[]> };
};
const themeCss = readFileSync(resolve(root, 'src/css/theme.css'), 'utf-8');
const styleCss = readFileSync(resolve(root, 'src/css/style.css'), 'utf-8');
const tailwindConfigSource = readFileSync(resolve(root, 'tailwind.config.ts'), 'utf-8');
const tailwindPresetSource = readFileSync(resolve(root, 'src/tailwind-preset.ts'), 'utf-8');

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

/**
 * D2/D3: the Tailwind preset was never published (no subpath, no `files`
 * coverage) and `tailwindcss` was never declared as a peer, so a consumer
 * following DESIGN.md had to copy the config by hand. These checks pin the
 * fix at the same text/JSON level as the checks above.
 */

describe('package.json exposes the ./tailwind-preset subpath, ESM and CJS', () => {
  test('exports["./tailwind-preset"] declares import and require conditions with types', () => {
    expect(packageJson.exports['./tailwind-preset']).toEqual({
      import: {
        types: './dist/tailwind-preset.d.ts',
        default: './dist/tailwind-preset.js',
      },
      require: {
        types: './dist/tailwind-preset.d.cts',
        default: './dist/tailwind-preset.cjs',
      },
    });
  });

  test('typesVersions maps tailwind-preset like the existing react/react-client subpaths', () => {
    expect(packageJson.typesVersions?.['*']?.['tailwind-preset']).toEqual([
      './dist/tailwind-preset.d.ts',
    ]);
  });

  test('files includes dist, so the built preset ships in the tarball', () => {
    expect(packageJson.files).toContain('dist');
  });
});

describe('tailwindcss is declared as an optional peer dependency', () => {
  test('peerDependencies.tailwindcss is present', () => {
    expect(packageJson.peerDependencies.tailwindcss).toBeDefined();
  });

  test('peerDependenciesMeta.tailwindcss.optional is true', () => {
    expect(packageJson.peerDependenciesMeta?.tailwindcss?.optional).toBe(true);
  });
});

describe('src/tailwind-preset.ts is the single source of truth for the preset', () => {
  test('tailwind.config.ts only re-exports src/tailwind-preset.ts', () => {
    expect(tailwindConfigSource).toMatch(
      /export\s*\{\s*default\s*\}\s*from\s*['"]\.\/src\/tailwind-preset['"]/,
    );
    // No duplicate copy of the theme.extend.colors block left behind at the root.
    expect(tailwindConfigSource).not.toMatch(/colors:\s*\{/);
  });

  test('src/tailwind-preset.ts does not import a type from tailwindcss (avoids the v3/v4 Config mismatch)', () => {
    // Anchored to an actual `import ... from 'tailwindcss'` statement, not
    // the doc comment that explains why that import is deliberately absent.
    expect(tailwindPresetSource).not.toMatch(/^\s*import\b[^\n]*from\s*['"]tailwindcss['"]/m);
  });

  test('the imported preset default-exports the same color binding tailwind.config.ts used to declare literally', () => {
    expect(stillVoidPreset.theme.extend.colors['sv-bg']).toBe('var(--sv-bg)');
    expect(stillVoidPreset.corePlugins.preflight).toBe(false);
  });
});
