import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Badge, type BadgeProps } from '../src/components/ui/badge';

afterEach(cleanup);

const variants: NonNullable<BadgeProps['variant']>[] = ['default', 'secondary', 'destructive', 'outline'];

describe('Badge', () => {
  test('defaults to variant=default', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toHaveClass('bg-sv-signal-cyan');
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
