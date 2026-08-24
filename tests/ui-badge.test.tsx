import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Badge, type BadgeProps } from '../src/components/ui/badge';

afterEach(cleanup);

const variants: NonNullable<BadgeProps['variant']>[] = ['default', 'secondary', 'destructive', 'outline'];

describe('Badge', () => {
  test('defaults to variant=default', () => {
    render(<Badge>New</Badge>);
    // Same rule as Button: the default variant is the unmodified base class.
    expect(screen.getByText('New')).toHaveClass('sv-badge');
    expect(screen.getByText('New').className).not.toMatch(/sv-badge--/);
  });

  test.each(variants)('applies variant=%s classes', (variant) => {
    render(<Badge variant={variant}>V</Badge>);
    expect(screen.getByText('V')).toBeInTheDocument();
  });

  test('merges custom className', () => {
    render(<Badge className="custom">X</Badge>);
    expect(screen.getByText('X')).toHaveClass('custom');
  });
});

// AC P2-2 (spec.md): every existing variant name must keep producing a
// distinct class after migrating off Tailwind utilities onto sv-* CSS.
describe('Badge variant classes are distinct after the sv-* migration', () => {
  test.each(variants)('variant=%s renders sv-badge and its own modifier (or the bare base for default)', (variant) => {
    render(<Badge variant={variant}>V</Badge>);
    const badge = screen.getByText('V');
    expect(badge).toHaveClass('sv-badge');
    if (variant === 'default') {
      expect(badge.className).not.toMatch(/sv-badge--(secondary|destructive|outline)/);
    } else {
      expect(badge).toHaveClass(`sv-badge--${variant}`);
    }
  });

  test('every non-default variant maps to a unique class name', () => {
    const classesByVariant = variants.map((variant) => {
      render(<Badge variant={variant}>{variant}</Badge>);
      return screen.getByText(variant).className;
    });
    expect(new Set(classesByVariant).size).toBe(variants.length);
  });
});

describe('Badge carries no dead Tailwind class (orchestrator audit, tasks.md pre-T17)', () => {
  const DEAD_CLASSES = ['focus:ring-ring', 'bg-red-500', 'hover:bg-red-600'];

  test.each(variants)('variant=%s never renders a class the audit flagged as dead', (variant) => {
    render(<Badge variant={variant}>V</Badge>);
    const badge = screen.getByText('V');
    for (const dead of DEAD_CLASSES) {
      expect(badge.className).not.toContain(dead);
    }
  });
});

describe('style.css Badge section — CSS contract', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/css/style.css'), 'utf-8');
  const marker = '/* ---------- Badge ---------- */';
  const start = css.indexOf(marker);
  const nextMarker = css.indexOf('/* ---------- ', start + marker.length);
  const badgeSection = css.slice(start, nextMarker === -1 ? undefined : nextMarker);

  test('Badge CSS section exists', () => {
    expect(start).toBeGreaterThan(-1);
  });

  test.each([
    '.sv-badge',
    '.sv-badge:focus-visible',
    '.sv-badge--secondary',
    '.sv-badge--destructive',
    '.sv-badge--outline',
  ])('declares %s', (selector) => {
    expect(badgeSection).toContain(selector);
  });

  test('the default variant background follows data-accent, not a fixed hue', () => {
    expect(badgeSection).toMatch(/\.sv-badge\s*\{[^}]*background:\s*var\(--sv-accent\)/);
  });

  test('no rule in the Badge section uses box-shadow (Flat-By-Default)', () => {
    expect(badgeSection).not.toMatch(/box-shadow/);
  });

  test('no rule in the Badge section hardcodes a color literal', () => {
    expect(badgeSection).not.toMatch(/#[0-9a-fA-F]{3}|oklch\(|rgba?\(|hsla?\(/);
  });
});
