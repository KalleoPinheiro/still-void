import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Button, type ButtonProps } from '../src/components/ui/button';

afterEach(cleanup);

// T17 / BTN-01..04: `variant="accent"` is additive to the six variants
// `tests/ui-button.test.tsx` already covers. Kept as a sibling file rather
// than an edit to that protected file — no existing assertion there needed
// to change (AD-014 does not apply here; nothing pins stale syntax).
const allVariants: NonNullable<ButtonProps['variant']>[] = [
  'default',
  'destructive',
  'outline',
  'secondary',
  'ghost',
  'link',
  'accent',
];

describe('Button variant="accent" (BTN-01, BTN-04)', () => {
  test('BTN-01: emits sv-btn and sv-btn--accent', () => {
    render(<Button variant="accent">Accent</Button>);
    const button = screen.getByRole('button', { name: 'Accent' });
    expect(button).toHaveClass('sv-btn');
    expect(button).toHaveClass('sv-btn--accent');
  });

  test('BTN-04: default variant (no prop passed) never renders the accent modifier', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button', { name: 'Default' });
    expect(button.className).not.toMatch(/sv-btn--accent/);
  });

  test('all 7 variants (6 existing + accent) render a distinct className', () => {
    const classesByVariant = allVariants.map((variant) => {
      render(<Button variant={variant}>{variant}</Button>);
      return screen.getByRole('button', { name: variant }).className;
    });
    expect(new Set(classesByVariant).size).toBe(allVariants.length);
  });
});

describe('style.css .sv-btn--accent — CSS contract (BTN-02, BTN-03)', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/css/style.css'), 'utf-8');
  const marker = '/* ---------- Button ---------- */';
  const start = css.indexOf(marker);
  const nextMarker = css.indexOf('/* ---------- ', start + marker.length);
  const buttonSection = css.slice(start, nextMarker === -1 ? undefined : nextMarker);

  test('BTN-02: .sv-btn--accent sets background and color from tokens', () => {
    const match = buttonSection.match(/\.sv-btn--accent\s*\{([^}]*)\}/);
    expect(match).not.toBeNull();
    const body = match ? match[1] : '';
    expect(body).toMatch(/background:\s*var\(--sv-accent-ink\)/);
    expect(body).toMatch(/color:\s*var\(--sv-bg\)/);
  });

  test('BTN-02: hover state derives from the same token via color-mix, no second literal hex', () => {
    const match = buttonSection.match(/\.sv-btn--accent:hover\s*\{([^}]*)\}/);
    expect(match).not.toBeNull();
    const body = match ? match[1] : '';
    expect(body).toMatch(/color-mix\(in srgb, var\(--sv-accent-ink\)/);
    expect(body).not.toMatch(/#[0-9a-fA-F]{3,6}/);
  });

  test('BTN-03: accent color comes from var(), not a literal, so it tracks [data-theme]/[data-accent] automatically', () => {
    const match = buttonSection.match(/\.sv-btn--accent\s*\{([^}]*)\}/);
    const body = match ? match[1] : '';
    expect(body).not.toMatch(/#[0-9a-fA-F]{3,6}|oklch\(|rgba?\(|hsla?\(/);
  });
});
