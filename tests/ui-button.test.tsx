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
