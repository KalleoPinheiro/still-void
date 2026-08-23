import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import { Checkbox, type CheckboxProps } from '../src/components/ui/checkbox';

afterEach(cleanup);

describe('Checkbox', () => {
  // AC P1-Escolhas #2
  test('renders an input with role checkbox', () => {
    render(<Checkbox aria-label="Ativo" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInstanceOf(HTMLInputElement);
  });

  // AC P1-Escolhas #2
  test('defaultChecked marks the checkbox as initially checked', () => {
    render(<Checkbox aria-label="Ativo" defaultChecked />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  // AC P1-Escolhas #2
  test('userEvent.click toggles the checked state', async () => {
    render(<Checkbox aria-label="Ativo" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test('name is present and the checked value is serialized by FormData', () => {
    render(
      <form>
        <Checkbox name="ativo" defaultChecked value="yes" />
      </form>
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('name', 'ativo');
    const form = checkbox.closest('form') as HTMLFormElement;
    const data = new FormData(form);
    expect(data.get('ativo')).toBe('yes');
  });

  // AC P1-Escolhas #3 — type stays "checkbox" even if the consumer passes an
  // override. Cast through CheckboxProps & { type?: string } to simulate an
  // untyped JS consumer, since the TS type already omits `type`.
  test('type passed via props does not override type="checkbox"', () => {
    const props = { type: 'radio' } as unknown as CheckboxProps;
    render(<Checkbox aria-label="Forced" {...props} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('type', 'checkbox');
  });

  test('forwards ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} aria-label="Ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  test('disabled prop disables the checkbox', () => {
    render(<Checkbox disabled aria-label="Off" />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  test('composes className with sv-check instead of replacing it', () => {
    render(<Checkbox className="custom" aria-label="Cls" />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveClass('sv-check');
    expect(checkbox).toHaveClass('custom');
  });

  // AC P1-Escolhas #1
  test('source file has no "use client" directive and no Radix import', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/ui/checkbox.tsx'),
      'utf-8'
    );
    expect(source).not.toContain('use client');
    expect(source).not.toMatch(/@radix-ui/);
  });
});
