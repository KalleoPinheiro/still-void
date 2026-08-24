import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Textarea } from '../src/components/ui/textarea';

afterEach(cleanup);

describe('Textarea', () => {
  test('renders a textarea element', () => {
    render(<Textarea placeholder="Notes" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInstanceOf(HTMLTextAreaElement);
  });

  test('forwards the rows prop to the DOM as an attribute', () => {
    render(<Textarea rows={6} placeholder="Notes" />);
    expect(screen.getByPlaceholderText('Notes')).toHaveAttribute('rows', '6');
  });

  test('forwards ref to the underlying textarea element', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  test('disabled prop disables the textarea', () => {
    render(<Textarea disabled placeholder="Off" />);
    expect(screen.getByPlaceholderText('Off')).toBeDisabled();
  });

  test('composes className with sv-field sv-field--textarea instead of replacing it', () => {
    render(<Textarea className="custom" placeholder="Cls" />);
    const textarea = screen.getByPlaceholderText('Cls');
    expect(textarea).toHaveClass('sv-field');
    expect(textarea).toHaveClass('sv-field--textarea');
    expect(textarea).toHaveClass('custom');
  });

  test('passes through placeholder, name, defaultValue, aria-* and data-* without filtering', () => {
    render(
      <Textarea
        placeholder="Bio"
        name="bio"
        defaultValue="hello"
        aria-label="Biography"
        data-testid="bio-field"
      />
    );
    const textarea = screen.getByTestId('bio-field');
    expect(textarea).toHaveAttribute('placeholder', 'Bio');
    expect(textarea).toHaveAttribute('name', 'bio');
    expect(textarea).toHaveValue('hello');
    expect(textarea).toHaveAttribute('aria-label', 'Biography');
  });

  test('source file has no "use client" directive', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/ui/textarea.tsx'),
      'utf-8'
    );
    expect(source).not.toContain('use client');
  });

  test('source file imports only from react and internal lib/recipes, no client-only or Radix packages', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/ui/textarea.tsx'),
      'utf-8'
    );
    expect(source).not.toMatch(/@radix-ui/);
    expect(source).not.toMatch(/from ["']react-dom/);
  });
});
