import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { NativeSelect } from '../src/components/ui/native-select';

afterEach(cleanup);

describe('NativeSelect', () => {
  test('renders a select element', () => {
    render(
      <NativeSelect aria-label="Fruit">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </NativeSelect>
    );
    const select = screen.getByRole('combobox');
    expect(select).toBeInstanceOf(HTMLSelectElement);
  });

  test('changes value when a different option is selected', () => {
    render(
      <NativeSelect aria-label="Fruit" defaultValue="apple">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </NativeSelect>
    );
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'banana' } });
    expect(select).toHaveValue('banana');
  });

  test('name reaches the DOM and the value is serialized by FormData', () => {
    render(
      <form>
        <NativeSelect name="fruit" defaultValue="banana">
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
        </NativeSelect>
      </form>
    );
    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('name', 'fruit');
    const form = select.closest('form') as HTMLFormElement;
    const data = new FormData(form);
    expect(data.get('fruit')).toBe('banana');
  });

  test('forwards ref to the underlying select element', () => {
    const ref = createRef<HTMLSelectElement>();
    render(<NativeSelect ref={ref} aria-label="Ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  test('disabled prop disables the select', () => {
    render(<NativeSelect disabled aria-label="Off" />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  test('composes className with sv-field sv-field--select instead of replacing it', () => {
    render(<NativeSelect className="custom" aria-label="Cls" />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('sv-field');
    expect(select).toHaveClass('sv-field--select');
    expect(select).toHaveClass('custom');
  });

  test('passes through the multiple attribute and renders all options', () => {
    render(
      <NativeSelect multiple aria-label="Multi">
        <option value="a">A</option>
        <option value="b">B</option>
        <option value="c">C</option>
      </NativeSelect>
    );
    const select = screen.getByRole('listbox');
    expect(select).toHaveAttribute('multiple');
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  test('renders an empty select without any options without throwing', () => {
    expect(() => render(<NativeSelect aria-label="Empty" />)).not.toThrow();
    expect(screen.getByRole('combobox')).toBeEmptyDOMElement();
  });

  test('source file has no "use client" directive and no Radix import', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/ui/native-select.tsx'),
      'utf-8'
    );
    expect(source).not.toContain('use client');
    expect(source).not.toMatch(/@radix-ui/);
  });
});
