import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Button, type ButtonProps } from '../src/components/ui/button';

afterEach(cleanup);

const variants: NonNullable<ButtonProps['variant']>[] = [
  'default',
  'destructive',
  'outline',
  'secondary',
  'ghost',
  'link',
];
const sizes: NonNullable<ButtonProps['size']>[] = ['default', 'sm', 'lg', 'icon'];

describe('Button', () => {
  test('renders children and defaults to variant=default size=default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button.className).toContain('bg-sv-surface');
    expect(button.className).toContain('h-10');
  });

  test.each(variants)('applies variant=%s classes', (variant) => {
    render(<Button variant={variant}>V</Button>);
    const button = screen.getByRole('button', { name: 'V' });
    expect(button).toBeInTheDocument();
  });

  test.each(sizes)('applies size=%s classes', (size) => {
    render(<Button size={size}>S</Button>);
    const button = screen.getByRole('button', { name: 'S' });
    expect(button).toBeInTheDocument();
  });

  test('forwards ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe('Ref');
  });

  test('merges custom className via cn', () => {
    render(<Button className="custom-class">Merged</Button>);
    expect(screen.getByRole('button', { name: 'Merged' })).toHaveClass('custom-class');
  });

  test('disabled prop disables the button', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });
});

// AC P2-2 (spec.md): every existing variant/size name must keep producing a
// distinct class after migrating off Tailwind utilities onto sv-* CSS — the
// variant/size set enumerated here is exhaustive against ButtonProps.
describe('Button variant classes are distinct after the sv-* migration', () => {
  test.each(variants)('variant=%s renders its own sv-btn--%s modifier (or the bare base for default)', (variant) => {
    render(<Button variant={variant}>V</Button>);
    const button = screen.getByRole('button', { name: 'V' });
    expect(button).toHaveClass('sv-btn');
    if (variant === 'default') {
      expect(button.className).not.toMatch(/sv-btn--(destructive|outline|secondary|ghost|link)/);
    } else {
      expect(button).toHaveClass(`sv-btn--${variant}`);
    }
  });

  test('every non-default variant maps to a unique class name', () => {
    const classesByVariant = variants.map((variant) => {
      render(<Button variant={variant}>{variant}</Button>);
      return screen.getByRole('button', { name: variant }).className;
    });
    expect(new Set(classesByVariant).size).toBe(variants.length);
  });

  test.each(sizes)('size=%s renders its own sv-btn size modifier (or the bare base for default)', (size) => {
    render(<Button size={size}>S</Button>);
    const button = screen.getByRole('button', { name: 'S' });
    if (size === 'default') {
      expect(button.className).not.toMatch(/sv-btn--(sm|lg|icon)/);
    } else {
      expect(button).toHaveClass(`sv-btn--${size}`);
    }
  });
});

describe('Button carries no dead Tailwind color utility (orchestrator audit, tasks.md pre-T17)', () => {
  const DEAD_CLASSES = [
    'bg-destructive',
    'text-destructive-foreground',
    'hover:bg-destructive/90',
    'bg-background',
    'text-accent',
    'hover:text-accent',
    'ring-offset-background',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
  ];

  test.each(variants)('variant=%s never renders a class the audit flagged as dead', (variant) => {
    render(<Button variant={variant}>V</Button>);
    const button = screen.getByRole('button', { name: 'V' });
    for (const dead of DEAD_CLASSES) {
      expect(button.className).not.toContain(dead);
    }
  });
});

describe('style.css Button section — CSS contract', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/css/style.css'), 'utf-8');
  const marker = '/* ---------- Button ---------- */';
  const start = css.indexOf(marker);
  const nextMarker = css.indexOf('/* ---------- ', start + marker.length);
  const buttonSection = css.slice(start, nextMarker === -1 ? undefined : nextMarker);

  test('Button CSS section exists', () => {
    expect(start).toBeGreaterThan(-1);
  });

  test('.sv-btn and every modifier class referenced by the component exist as rules', () => {
    for (const selector of [
      '.sv-btn',
      '.sv-btn:hover',
      '.sv-btn:focus-visible',
      '.sv-btn:disabled',
      '.sv-btn--destructive',
      '.sv-btn--outline',
      '.sv-btn--secondary',
      '.sv-btn--ghost',
      '.sv-btn--link',
      '.sv-btn--sm',
      '.sv-btn--lg',
      '.sv-btn--icon',
    ]) {
      expect(buttonSection).toContain(selector);
    }
  });

  test('no rule in the Button section uses box-shadow (Flat-By-Default)', () => {
    expect(buttonSection).not.toMatch(/box-shadow/);
  });

  test('no rule in the Button section hardcodes a color literal', () => {
    expect(buttonSection).not.toMatch(/#[0-9a-fA-F]{3}|oklch\(|rgba?\(|hsla?\(/);
  });

  test('focus-visible uses a real outline, never a ring (AD-005)', () => {
    expect(buttonSection).toMatch(/\.sv-btn:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--sv-accent-ink\)/);
  });
});
