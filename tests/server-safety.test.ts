import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
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
 */

const entry = resolve(process.cwd(), 'src/react/index.ts');

/** Resolve a relative specifier the way the TS/bundler resolution would. */
function resolveModule(fromFile: string, specifier: string): string | undefined {
  const base = resolve(dirname(fromFile), specifier);
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
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

/** Every first-party module reachable from `entry`, entry included. */
function collectGraph(entryFile: string): Map<string, string> {
  const modules = new Map<string, string>();
  const queue = [entryFile];

  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (modules.has(file)) continue;
    const source = readFileSync(file, 'utf-8');
    modules.set(file, source);

    const specifierRe = /(?:from|import)\s*['"](\.[^'"]+)['"]/g;
    let match: RegExpExecArray | null;
    while ((match = specifierRe.exec(source))) {
      const resolved = resolveModule(file, match[1] as string);
      if (resolved !== undefined && !modules.has(resolved)) queue.push(resolved);
    }
  }

  return modules;
}

const graph = collectGraph(entry);
const graphEntries = [...graph.entries()].map(
  ([file, source]) => [file.slice(process.cwd().length + 1), source] as const,
);

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
    expect(stripComments(source)).not.toMatch(/from\s*['"]@radix-ui\//);
  });

  test.each(graphEntries)('%s uses no React hook or context constructor', (_file, source) => {
    // createContext and useId are the two that would silently work in the test
    // environment and only fail in a real Server Component render.
    expect(stripComments(source)).not.toMatch(
      /\b(?:useState|useEffect|useLayoutEffect|useRef|useId|useReducer|useContext|createContext)\b/,
    );
  });
});
