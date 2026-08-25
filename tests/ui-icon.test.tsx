import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Icon, type IconProps } from '../src/components/ui/icon';
import { ICON_NAMES, type IconName } from '../src/components/ui/icon-set';

afterEach(cleanup);

/** The single <svg> an Icon render produces. */
function renderIcon(props: IconProps): SVGSVGElement {
  const { container } = render(<Icon {...props} />);
  const svg = container.querySelector('svg');
  if (svg === null) throw new Error('Icon rendered no <svg>');
  return svg;
}

/** The geometry of a rendered icon — what distinguishes one glyph from another. */
function geometryOf(svg: SVGSVGElement): string {
  return [...svg.querySelectorAll('path')].map((path) => path.getAttribute('d')).join('|');
}

function classOf(svg: SVGSVGElement): string {
  return svg.getAttribute('class') ?? '';
}

const iconSetSource = readFileSync(
  resolve(process.cwd(), 'src/components/ui/icon-set.ts'),
  'utf-8',
);

describe('Icon — the rendered element (ICON-01)', () => {
  test('renders an <svg> carrying sv-icon, currentColor stroke and aria-hidden', () => {
    const svg = renderIcon({ name: 'x' });
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(classOf(svg)).toContain('sv-icon');
    // Heroicons sets stroke="currentColor" itself, but the spec promises it to
    // the consumer — a change of library or grade could drop it silently.
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  test('every curated name maps to a real, distinct glyph', () => {
    // A copy-pasted line in the map — two names pointing at one heroicon — is
    // invisible without this: both names still render something.
    const drawn = new Map<IconName, string>();
    for (const name of ICON_NAMES) {
      const geometry = geometryOf(renderIcon({ name }));
      expect(geometry, name).not.toBe('');
      drawn.set(name, geometry);
    }
    expect(drawn.size).toBe(ICON_NAMES.length);
    expect(new Set(drawn.values()).size).toBe(ICON_NAMES.length);
  });
});

describe('Icon — the size scale (ICON-02)', () => {
  test('size="md" is the default and emits no modifier', () => {
    expect(classOf(renderIcon({ name: 'check' }))).not.toMatch(/sv-icon--/);
    expect(classOf(renderIcon({ name: 'check', size: 'md' }))).not.toMatch(/sv-icon--/);
  });

  test.each([
    ['sm', 'sv-icon--sm'],
    ['lg', 'sv-icon--lg'],
  ] as const)('size="%s" adds %s on top of the base class', (size, modifier) => {
    const svg = renderIcon({ name: 'check', size });
    expect(classOf(svg)).toContain('sv-icon');
    expect(classOf(svg)).toContain(modifier);
  });
});

describe('Icon — the accessible name (ICON-03)', () => {
  test('label swaps aria-hidden for role="img" + aria-label', () => {
    const svg = renderIcon({ name: 'x', label: 'Fechar' });
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Fechar');
    // The swap is the whole point: an announceable icon that is still
    // aria-hidden is announced by nothing.
    expect(svg.hasAttribute('aria-hidden')).toBe(false);
  });

  test('without label the icon stays decorative — no role, no aria-label', () => {
    const svg = renderIcon({ name: 'x' });
    expect(svg.hasAttribute('role')).toBe(false);
    expect(svg.hasAttribute('aria-label')).toBe(false);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  test('a caller-supplied aria-hidden/role cannot override the mode label selects', () => {
    // `label` is the only thing that should decide whether the icon is
    // announced. A stray aria-hidden/role passed through `...props` (the
    // rest of IconProps forwards straight to the <svg>) must not silence a
    // labeled icon or announce an unlabeled one.
    const labeled = renderIcon({ name: 'x', label: 'Fechar', 'aria-hidden': 'true' });
    expect(labeled.getAttribute('aria-hidden')).not.toBe('true');
    expect(labeled.getAttribute('role')).toBe('img');
    expect(labeled.getAttribute('aria-label')).toBe('Fechar');

    const unlabeled = renderIcon({ name: 'x', role: 'img' });
    expect(unlabeled.getAttribute('aria-hidden')).toBe('true');
    expect(unlabeled.hasAttribute('role')).toBe(false);
  });
});

describe('Icon — invalid name at runtime (ICON-05)', () => {
  test('an unknown name renders the fallback glyph instead of throwing', () => {
    // The TS union blocks this at compile time; a value arriving from JSON, a
    // CMS or a JS consumer never went through the compiler.
    expect(() => renderIcon({ name: 'not-an-icon' as IconName })).not.toThrow();

    const svg = renderIcon({ name: 'not-an-icon' as IconName });
    expect(classOf(svg)).toContain('sv-icon');
    expect(geometryOf(svg)).toBe(geometryOf(renderIcon({ name: 'alert-circle' })));
  });
});

describe('Icon — consumer props', () => {
  test('a consumer className is added to sv-icon, never replaces it', () => {
    const svg = renderIcon({ name: 'menu', className: 'mine', size: 'lg' });
    expect(classOf(svg)).toContain('sv-icon');
    expect(classOf(svg)).toContain('sv-icon--lg');
    expect(classOf(svg)).toContain('mine');
  });

  test('arbitrary SVG props pass through to the element', () => {
    const svg = renderIcon({ name: 'search', 'data-testid': 'glyph' } as IconProps);
    expect(svg.getAttribute('data-testid')).toBe('glyph');
  });
});

describe('Icon — tree-shakeable imports (ICON-06)', () => {
  test('icon-set.ts imports named bindings from @heroicons/react/24/outline only', () => {
    // A namespace import, or the package root barrel, pulls all ~1200 icons
    // into the consumer's bundle; only named imports from the grade subpath
    // tree-shake.
    expect(iconSetSource).toMatch(
      /import\s*\{[^}]+\}\s*from\s*['"]@heroicons\/react\/24\/outline['"]/,
    );
    expect(iconSetSource).not.toMatch(/import\s*\*\s*as\s+\w+\s*from\s*['"]@heroicons/);
    expect(iconSetSource).not.toMatch(/from\s*['"]@heroicons\/react['"]/);
  });
});

describe('Icon — component identity', () => {
  test('displayName is Icon, the name React DevTools shows', () => {
    expect(Icon.displayName).toBe('Icon');
  });
});
