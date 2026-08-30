import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * D4: `shadcn-overrides.css` existed in `src/css/` but was never copied to
 * `dist/` and never given an export subpath, even though DESIGN.md:226
 * claims the layer is active. This contract pins the fix at the source —
 * text-level checks on the build script and `package.json`, in the style of
 * `tests/tokenParity.test.ts`.
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
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  typesVersions?: { '*'?: Record<string, string[]> };
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

describe('attw excludes every CSS-only entrypoint, tailwind.css included', () => {
  test('lint:package passes --exclude-entrypoints for all four CSS subpaths', () => {
    // attw flags any subpath with no type declarations as NoResolution
    // unless it's listed here — confirmed the hard way when tailwind.css
    // (T19) shipped without being added and lint:package started failing.
    const lintScript = packageJson.scripts['lint:package'];
    expect(lintScript).toContain('--exclude-entrypoints');
    expect(lintScript).toMatch(/--exclude-entrypoints[^&]*\btheme\.css\b/);
    expect(lintScript).toMatch(/--exclude-entrypoints[^&]*\bstyle\.css\b/);
    expect(lintScript).toMatch(/--exclude-entrypoints[^&]*\btailwind\.css\b/);
    expect(lintScript).toMatch(/--exclude-entrypoints[^&]*\bshadcn-overrides\.css\b/);
  });
});

/**
 * AD-012: the Tailwind surface went v4-only in round 2 — the v3-format
 * `./tailwind-preset` export, `src/tailwind-preset.ts` and `tailwind.config.ts`
 * were removed outright (not deprecated), and the peer range moved from
 * `>=3 <4` to `>=4`, kept optional (a consumer with no Tailwind at all still
 * gets every component styled through style.css's sv-* classes, AD-001).
 * These checks pin the removal as a permanent state, not a one-time diff —
 * this is the one place editing a check IS the point, not a regression: the
 * API being gone is the decision.
 */

describe('the v3 tailwind-preset surface is gone (AD-012)', () => {
  test('exports has no ./tailwind-preset entry', () => {
    expect(packageJson.exports['./tailwind-preset']).toBeUndefined();
  });

  test('typesVersions has no tailwind-preset entry', () => {
    expect(packageJson.typesVersions?.['*']?.['tailwind-preset']).toBeUndefined();
  });
});

describe('tailwindcss is a required-major, optional peer dependency (AD-012)', () => {
  test('peerDependencies.tailwindcss requires v4+', () => {
    expect(packageJson.peerDependencies.tailwindcss).toBe('>=4');
  });

  test('peerDependenciesMeta.tailwindcss.optional is true', () => {
    expect(packageJson.peerDependenciesMeta?.tailwindcss?.optional).toBe(true);
  });
});

describe('no v3-format artifact survives on disk (TW-07)', () => {
  test.each(['src/tailwind-preset.ts', 'tailwind.config.ts'])('%s does not exist', (relPath) => {
    expect(existsSync(resolve(root, relPath))).toBe(false);
  });

  test('tsup.config.ts has no tailwind-preset entry', () => {
    const tsupConfig = readFileSync(resolve(root, 'tsup.config.ts'), 'utf-8');
    expect(tsupConfig).not.toMatch(/tailwind-preset/);
  });
});

/**
 * ICON-06: the icons the package renders itself come from `@heroicons/react`,
 * so the consumer has to receive it from `npm install @still-void/ui` without
 * asking. Which section it sits in is the whole contract: a devDependency is
 * not installed for consumers and a peerDependency makes them install it by
 * hand — either one publishes a package whose Icon renders nothing.
 */

describe('@heroicons/react ships as a direct runtime dependency', () => {
  test('dependencies["@heroicons/react"] is a caret-2 range', () => {
    // AD-013 pinned the major line: 2.x is the release verified to carry no
    // 'use client' and no hook, which is what keeps Icon server-safe.
    expect(packageJson.dependencies['@heroicons/react']).toMatch(/^\^2(?:\.|$)/);
  });

  test('it is declared in neither devDependencies nor peerDependencies', () => {
    expect(packageJson.devDependencies['@heroicons/react']).toBeUndefined();
    expect(packageJson.peerDependencies['@heroicons/react']).toBeUndefined();
  });
});

/**
 * AD-006 / AD-015. Design.md's original plan was to promote
 * @radix-ui/react-slot to a direct dependency for Card's `asChild`. That plan
 * changed after verifying (against the installed package's own dist) that
 * Slot calls useComposedRefs, which calls React.useCallback — a real hook,
 * `'use client'` directive or not — which would throw in a real Server
 * Component. src/components/ui/slot.tsx ports only the hook-free ref-merge
 * logic instead, with no import of either @radix-ui/react-slot or
 * @radix-ui/react-compose-refs. This pins that neither package re-enters
 * `dependencies` by accident in a future change.
 */
describe('Card does not depend on @radix-ui/react-slot or react-compose-refs (AD-015)', () => {
  test('neither package is a direct dependency', () => {
    expect(packageJson.dependencies['@radix-ui/react-slot']).toBeUndefined();
    expect(packageJson.dependencies['@radix-ui/react-compose-refs']).toBeUndefined();
  });
});

/**
 * AD-016: `@radix-ui/react-toast@^1.2.23` is the foundation of the Toast family
 * (`ToastProvider`, `useToast`, viewport rendering). The package carries `'use client'`
 * in its dist and is rendered exclusively from `src/react/client/ToastProvider.tsx`,
 * so it never reaches `src/react/index.ts` (the server-safe entry). Verified by
 * `npm pack` inspection: all 12 transitive dependencies are already installed,
 * the dist marks client-only, and `dist/index.mjs` contains `'use client'` directives.
 */

describe('@radix-ui/react-toast ships as a direct runtime dependency (AD-016)', () => {
  test('dependencies["@radix-ui/react-toast"] is a caret-1 range', () => {
    expect(packageJson.dependencies['@radix-ui/react-toast']).toMatch(/^\^1(?:\.|$)/);
  });

  test('it is declared in neither devDependencies nor peerDependencies', () => {
    expect(packageJson.devDependencies['@radix-ui/react-toast']).toBeUndefined();
    expect(packageJson.peerDependencies['@radix-ui/react-toast']).toBeUndefined();
  });
});
