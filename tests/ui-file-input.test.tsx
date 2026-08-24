import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { FileInput } from '../src/components/ui/file-input';

afterEach(cleanup);

describe('FileInput', () => {
  test('renders an input with type="file"', () => {
    render(<FileInput data-testid="file" />);
    expect(screen.getByTestId('file')).toHaveAttribute('type', 'file');
  });

  test('forwards the accept prop to the DOM', () => {
    render(<FileInput data-testid="file" accept="image/*" />);
    expect(screen.getByTestId('file')).toHaveAttribute('accept', 'image/*');
  });

  test('forwards the multiple prop to the DOM', () => {
    render(<FileInput data-testid="file" multiple />);
    expect(screen.getByTestId('file')).toHaveAttribute('multiple');
  });

  test('passing type via an untyped-consumer cast does not change the rendered type', () => {
    const UntypedFileInput = FileInput as unknown as React.ComponentType<
      { type?: string; 'data-testid'?: string } & Record<string, unknown>
    >;
    render(<UntypedFileInput data-testid="file" type="text" />);
    expect(screen.getByTestId('file')).toHaveAttribute('type', 'file');
  });

  test('forwards ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<FileInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  test('disabled prop disables the input', () => {
    render(<FileInput data-testid="file" disabled />);
    expect(screen.getByTestId('file')).toBeDisabled();
  });

  test('composes className with sv-field sv-field--file instead of replacing it', () => {
    render(<FileInput data-testid="file" className="custom" />);
    const input = screen.getByTestId('file');
    expect(input).toHaveClass('sv-field');
    expect(input).toHaveClass('sv-field--file');
    expect(input).toHaveClass('custom');
  });
});
