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

  test('renders the sv-field base class', () => {
    render(<Input placeholder="Base" />);
    expect(screen.getByPlaceholderText('Base')).toHaveClass('sv-field');
  });

  test('composes className with sv-field instead of replacing it', () => {
    render(<Input className="custom" placeholder="Compose" />);
    const input = screen.getByPlaceholderText('Compose');
    expect(input).toHaveClass('sv-field');
    expect(input).toHaveClass('custom');
  });

  test('renders no leftover Tailwind color utilities in the class list', () => {
    render(<Input placeholder="NoUtils" />);
    const classList = Array.from(screen.getByPlaceholderText('NoUtils').classList);
    // (^|:) rather than startsWith: `focus-visible:ring-2` was the original
    // D5 defect on this very component, and startsWith would not have seen it.
    const leftoverColorUtility = classList.find((cls) =>
      /(^|:)(bg-sv-|border-sv-|text-sv-|ring-)/.test(cls),
    );
    expect(leftoverColorUtility).toBeUndefined();
  });
});
