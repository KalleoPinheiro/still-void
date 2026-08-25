import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

/**
 * AD-002 / AC "P1 Campos" #1 / AC "P1 Escolhas" #1: everything reachable from
 * the '@still-void/ui/react' entry must render inside a Next.js Server
 * Component — no 'use client', no Radix, no React hooks.
 *
 * This is the property that regresses silently. It costs nothing at test time
 * and only surfaces in a consumer's Next.js build, so per-file assertions in
 * per-component test files are not enough: they cover only the components
 * somebody remembered to write them for. A discrimination sensor proved that
 * exact gap — prepending 'use client' to file-input.tsx or table.tsx passed
 * the entire suite.
 *
 * So instead of asserting per file, walk the real import graph from the entry
 * and assert over every module it reaches. A new server-safe component is
 * covered the moment it is exported, without anyone remembering to add a test.
 *
 * Importing a module under vitest proves nothing here — a 'use client' module
 * imports perfectly well outside a bundler. The directive is a build-time
 * marker, so it has to be checked as source text.
 *
 * ICON-07: the walk follows BARE specifiers too, not only relative ones. A
 * dependency is exactly as capable of dragging a client boundary into this
 * entry as a first-party file is, and until this existed nothing would have
 * said so — lucide-react marks its base Icon and context modules 'use client'
 * and would have walked straight in behind a named import (AD-013).
 */

const entry = resolve(process.cwd(), 'src/react/index.ts');
const requireFrom = (fromFile: string) => createRequire(fromFile);

/**
 * The peers, excluded from the third-party scan by name.
 *
 * React is where hooks are DEFINED, so scanning it for hook names says nothing
 * about whether this package uses one — and Next.js owns the client boundary
 * of the framework itself. Every other dependency is fair game: this list is a
 * statement about the two peers, not an escape hatch to grow when a scan fails.
 */
const PEER_FRAMEWORK_PACKAGES = new Set(['react', 'react-dom']);

/**
 * The whole hook surface, plus two names AD-002 rejects as project policy.
 * Declared once so the first-party and third-party checks can never drift into
 * testing different lists — round 1 shipped a sample by accident, and a hook
 * left out is a hole, because these fail only in a real Server Component
 * render and never in this environment, where they all work fine.
 *
 * `useId` and `createContext` are here as explicit PROJECT POLICY, which is
 * what AD-002 decided: RadioGroup could have generated ids or used context, and
 * chose the label-wrapping and Children.map designs precisely so the
 * server-safe entry stays free of both. `createContext` is a React API, not a
 * hook — it is in this list for the same policy reason, not because it is one.
 * `use` is deliberately absent: reading a Promise is allowed here.
 */
const REACT_HOOK_NAMES = [
  'useState', 'useEffect', 'useLayoutEffect', 'useInsertionEffect',
  'useRef', 'useReducer', 'useContext', 'useMemo', 'useCallback',
  'useImperativeHandle', 'useDebugValue', 'useTransition',
  'useDeferredValue', 'useSyncExternalStore', 'useOptimistic',
  'useActionState', 'useFormStatus',
  'useId', 'createContext',
];
const reactHookPattern = new RegExp(`\\b(?:${REACT_HOOK_NAMES.join('|')})\\b`);
const useClientPattern = /['"]use client['"]/;

/** 'react', '@heroicons/react' — the installed package a specifier belongs to. */
function packageNameOf(specifier: string): string {
  const segments = specifier.split('/');
  return specifier.startsWith('@')
    ? segments.slice(0, 2).join('/')
    : (segments[0] as string);
}

/** Resolve a relative specifier the way the TS/bundler resolution would. */
function resolveModule(fromFile: string, specifier: string): string | undefined {
  const base = resolve(dirname(fromFile), specifier);
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    // Published packages are JavaScript, so the walk has to know those
    // extensions to keep following relative imports once it is inside one.
    `${base}.js`,
    `${base}.mjs`,
    `${base}.cjs`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
    `${base}/index.js`,
  ]) {
    try {
      const source = readFileSync(candidate, 'utf-8');
      if (source !== undefined) return candidate;
    } catch {
      // try the next extension
    }
  }
  return undefined;
}

/**
 * Every build of a bare specifier a consumer could end up loading.
 *
 * All of them, not one, because the builds differ in exactly the way this file
 * cares about: @heroicons/react maps `import` and `require` to different
 * directories, and lucide-react ships no `exports` map at all, so Node resolves
 * its CJS `main` while a bundler reads the `module` field — and the 'use client'
 * directives live only in that ESM build. Resolving one branch would let the
 * other ship a client boundary unseen.
 */
function resolveBare(fromFile: string, specifier: string): string[] {
  const found = new Set<string>();

  try {
    found.add(fileURLToPath(import.meta.resolve(specifier)));
  } catch {
    // not resolvable under the import condition
  }
  try {
    const resolved = requireFrom(fromFile).resolve(specifier);
    // A builtin resolves to its own name rather than a path; nothing to read.
    if (resolved.includes(sep)) found.add(resolved);
  } catch {
    // not resolvable under the require condition
  }

  // The `module` field is bundler-only, so it applies to the package entry
  // itself; a subpath specifier is already routed by the exports map.
  if (specifier === packageNameOf(specifier)) {
    try {
      const manifestPath = requireFrom(fromFile).resolve(`${specifier}/package.json`);
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as { module?: string };
      if (manifest.module !== undefined) {
        found.add(resolve(dirname(manifestPath), manifest.module));
      }
    } catch {
      // no manifest reachable, or no `module` field to follow
    }
  }

  return [...found];
}

interface ImportGraph {
  /** Modules under src/ — asserted one test per file, as they always were. */
  firstParty: Map<string, string>;
  /** Modules under node_modules/ — asserted in aggregate, they are too many. */
  thirdParty: Map<string, string>;
  /** Every package name the entry reaches, peers included. */
  packages: Set<string>;
}

/** Every module reachable from `entry`, first-party and vendored, entry included. */
function collectGraph(entryFile: string): ImportGraph {
  const firstParty = new Map<string, string>();
  const thirdParty = new Map<string, string>();
  const packages = new Set<string>();
  const seen = new Set<string>();
  const queue = [entryFile];

  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    seen.add(file);

    let source: string;
    try {
      source = readFileSync(file, 'utf-8');
    } catch {
      continue;
    }
    const vendored = file.includes(`${sep}node_modules${sep}`);
    (vendored ? thirdParty : firstParty).set(file, source);

    // Our own files document their sibling entries in prose — Shell.tsx says
    // "pass <ThemeToggle /> from '@still-void/ui/react/client'" — and Node
    // resolves a package self-reference happily, so an unstripped scan walks
    // into the built client bundle and reports every Radix module in it.
    // Published bundles carry no such prose, and stripping `//` out of a
    // minified string literal would corrupt them, so they are scanned raw.
    const scanned = vendored ? source : stripComments(source);

    // Covers static (`from 'x'`), bare side-effect (`import 'x'`), dynamic
    // (`import('x')`) and `require('x')`. A dynamic import is still a
    // reachable module, so missing it would leave a hole the same size as the
    // one this file exists to close.
    const specifierRe = /(?:\bfrom|\bimport|\brequire)\s*\(?\s*['"]([^'"]+)['"]/g;
    let match: RegExpExecArray | null;
    while ((match = specifierRe.exec(scanned))) {
      const specifier = match[1] as string;

      if (specifier.startsWith('.')) {
        const resolved = resolveModule(file, specifier);
        if (resolved !== undefined && !seen.has(resolved)) queue.push(resolved);
        continue;
      }
      if (specifier.startsWith('node:')) continue;

      packages.add(packageNameOf(specifier));
      if (PEER_FRAMEWORK_PACKAGES.has(packageNameOf(specifier))) continue;

      for (const resolved of resolveBare(file, specifier)) {
        if (!seen.has(resolved)) queue.push(resolved);
      }
    }
  }

  return { firstParty, thirdParty, packages };
}

const graph = collectGraph(entry);
const graphEntries = [...graph.firstParty.entries()].map(
  ([file, source]) => [file.slice(process.cwd().length + 1), source] as const,
);
const vendorEntries = [...graph.thirdParty.entries()].map(
  ([file, source]) => [file.slice(file.lastIndexOf(`${sep}node_modules${sep}`) + 14), source] as const,
);

/** Files in the vendored graph whose source matches `pattern`. */
function vendorOffenders(pattern: RegExp): string[] {
  return vendorEntries.filter(([, source]) => pattern.test(stripComments(source))).map(([file]) => file);
}

/** Strip comments so a directive named in prose is not mistaken for a real one. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

describe('server-safe entry (@still-void/ui/react)', () => {
  test('the walked graph actually reached the new primitives', () => {
    // Guards the walker itself: if resolution silently broke, every assertion
    // below would pass over an empty graph and prove nothing.
    const reached = graphEntries.map(([file]) => file);
    expect(reached).toContain('src/components/ui/file-input.tsx');
    expect(reached).toContain('src/components/ui/table.tsx');
    expect(reached).toContain('src/components/ui/textarea.tsx');
    expect(reached).toContain('src/components/ui/native-select.tsx');
    expect(reached).toContain('src/components/ui/checkbox.tsx');
    expect(reached).toContain('src/components/ui/radio-group.tsx');
    expect(reached).toContain('src/components/ui/input.tsx');
    expect(reached).toContain('src/recipes/field.ts');
    expect(reached).toContain('src/recipes/table.ts');
  });

  test.each(graphEntries)('%s carries no "use client" directive', (_file, source) => {
    expect(stripComments(source)).not.toMatch(/['"]use client['"]/);
  });

  test.each(graphEntries)('%s imports no @radix-ui package', (_file, source) => {
    // Match the specifier itself rather than the `from` form: a bare
    // `import '@radix-ui/x'`, a dynamic import and a `require` all pull the
    // package in just as effectively.
    expect(stripComments(source)).not.toMatch(/['"]@radix-ui\//);
  });

  test.each(graphEntries)('%s uses no React hook or context constructor', (_file, source) => {
    // REACT_HOOK_NAMES is the whole hook surface, not a sample, and it is
    // declared once at the top of this file so this check and the third-party
    // one below can never end up testing different lists.
    expect(stripComments(source)).not.toMatch(reactHookPattern);
  });
});

/**
 * ICON-07: the same three properties, over the packages the entry pulls in.
 *
 * Asserted in aggregate rather than one case per file, because a single named
 * import from a grade subpath reaches hundreds of vendored modules — the check
 * is the same, only the reporting differs, and an offender is named in the
 * failure output.
 */
describe('server-safe entry — the third-party modules it reaches', () => {
  test('the walk left the first-party tree and reached the icon dependency', () => {
    // Without this the two assertions below would pass over an empty list and
    // prove nothing — which is precisely how the old walker, following only
    // relative specifiers, looked green while covering no dependency at all.
    const reached = vendorEntries.map(([file]) => file);
    expect([...graph.packages]).toContain('@heroicons/react');
    // Not just the barrel: reaching an individual glyph proves the walk kept
    // following imports INSIDE the package, which is where lucide-react hides
    // its directive — three hops below the named import.
    expect(reached.some((file) => /^@heroicons\/react\/24\/outline\//.test(file))).toBe(true);
    expect(reached.some((file) => /XMarkIcon/.test(file))).toBe(true);
  });

  test('no third-party module reachable from the entry carries a "use client" directive', () => {
    // The lucide-react case exactly: the directive sits on a module three
    // hops below the named import, so only walking the graph finds it.
    expect(vendorOffenders(useClientPattern)).toEqual([]);
  });

  test('no third-party module reachable from the entry uses a React hook', () => {
    // React and react-dom are excluded by PEER_FRAMEWORK_PACKAGES — they
    // define the hooks rather than calling them.
    expect(vendorOffenders(reactHookPattern)).toEqual([]);
  });
});
