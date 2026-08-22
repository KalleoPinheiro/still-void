import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Input } from '../src/components/ui/input';

afterEach(cleanup);

describe('Input', () => {
  test('renders a text input by default props', () => {
    render(<Input placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });

  test('forwards the type prop', () => {
    render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');
  });

  test('forwards ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  test('disabled prop disables the input', () => {
    render(<Input disabled placeholder="Off" />);
    expect(screen.getByPlaceholderText('Off')).toBeDisabled();
  });

  test('merges custom className', () => {
    render(<Input className="custom" placeholder="Cls" />);
    expect(screen.getByPlaceholderText('Cls')).toHaveClass('custom');
  });
});
