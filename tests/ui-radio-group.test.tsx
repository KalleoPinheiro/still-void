import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import { RadioGroup, RadioGroupItem } from '../src/components/ui/radio-group';

afterEach(cleanup);

describe('RadioGroup', () => {
  // AC P1-Escolhas #4
  test('renders a fieldset with a legend and is locatable by group role + name', () => {
    render(
      <RadioGroup legend="Tipo de diagnóstico">
        <RadioGroupItem value="a">A</RadioGroupItem>
      </RadioGroup>
    );
    const group = screen.getByRole('group', { name: 'Tipo de diagnóstico' });
    expect(group.tagName).toBe('FIELDSET');
    expect(screen.getByText('Tipo de diagnóstico').tagName).toBe('LEGEND');
  });

  // AC P1-Escolhas #5 — legend stays in the DOM, never display:none/removed
  test('legendHidden keeps the legend in the DOM with the sr-only class', () => {
    render(
      <RadioGroup legend="Hidden legend" legendHidden>
        <RadioGroupItem value="a">A</RadioGroupItem>
      </RadioGroup>
    );
    const legend = screen.getByText('Hidden legend');
    expect(legend.tagName).toBe('LEGEND');
    expect(legend).toHaveClass('sv-sr-only');
    expect(legend).not.toHaveStyle({ display: 'none' });
  });

  // Branch: legendHidden false with a legend present still renders without sr-only
  test('legend without legendHidden does not receive the sr-only class', () => {
    render(
      <RadioGroup legend="Visible legend">
        <RadioGroupItem value="a">A</RadioGroupItem>
      </RadioGroup>
    );
    expect(screen.getByText('Visible legend')).not.toHaveClass('sv-sr-only');
  });

  // Branch: no legend prop at all — fieldset renders without a <legend>
  test('without a legend prop, no legend element is rendered', () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem value="a">A</RadioGroupItem>
      </RadioGroup>
    );
    expect(container.querySelector('legend')).toBeNull();
  });

  // AC P1-Escolhas #6
  test('group name is injected into each direct-child RadioGroupItem', () => {
    render(
      <RadioGroup name="nanda" legend="Group">
        <RadioGroupItem value="a">A</RadioGroupItem>
        <RadioGroupItem value="b">B</RadioGroupItem>
      </RadioGroup>
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    for (const radio of radios) {
      expect(radio).toHaveAttribute('name', 'nanda');
    }
  });

  // AC P1-Escolhas #6 — same-name radios are mutually exclusive in a form
  test('items sharing the injected group name are mutually exclusive', async () => {
    render(
      <form>
        <RadioGroup name="nanda" legend="Group">
          <RadioGroupItem value="a">A</RadioGroupItem>
          <RadioGroupItem value="b">B</RadioGroupItem>
        </RadioGroup>
      </form>
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    const [radioA, radioB] = radios as [HTMLElement, HTMLElement];
    await userEvent.click(radioA);
    expect(radioA).toBeChecked();
    await userEvent.click(radioB);
    expect(radioB).toBeChecked();
    expect(radioA).not.toBeChecked();
  });

  // AC P1-Escolhas #7
  test("an item's own name prevails over the group name", () => {
    render(
      <RadioGroup name="nanda" legend="Group">
        <RadioGroupItem value="a" name="own-name">A</RadioGroupItem>
      </RadioGroup>
    );
    expect(screen.getByRole('radio')).toHaveAttribute('name', 'own-name');
  });

  // AC P1-Escolhas #8
  test('an item nested inside a wrapper does not receive the group name', () => {
    render(
      <RadioGroup name="nanda" legend="Group">
        <div>
          <RadioGroupItem value="a">A</RadioGroupItem>
        </div>
      </RadioGroup>
    );
    const radio = screen.getByRole('radio');
    expect(radio).not.toHaveAttribute('name');
  });

  // AC P1-Escolhas #9 — text child passes through untouched
  test('a plain text child renders intact without throwing', () => {
    expect(() =>
      render(
        <RadioGroup legend="Group">
          Some helper text
          <RadioGroupItem value="a">A</RadioGroupItem>
        </RadioGroup>
      )
    ).not.toThrow();
    expect(screen.getByText('Some helper text')).toBeInTheDocument();
  });

  // AC P1-Escolhas #9 — a non-RadioGroupItem element passes through untouched
  test('a non-RadioGroupItem element child (hr) renders intact without throwing', () => {
    const { container } = render(
      <RadioGroup legend="Group">
        <hr />
        <RadioGroupItem value="a">A</RadioGroupItem>
      </RadioGroup>
    );
    expect(container.querySelector('hr')).not.toBeNull();
  });

  // AC P1-Escolhas #9 — null/false children render without throwing
  test('null and false children render without throwing', () => {
    expect(() =>
      render(
        <RadioGroup legend="Group">
          {null}
          {false}
          <RadioGroupItem value="a">A</RadioGroupItem>
        </RadioGroup>
      )
    ).not.toThrow();
    expect(screen.getAllByRole('radio')).toHaveLength(1);
  });

  // AC P1-Escolhas #11
  test('orientation="horizontal" applies the horizontal modifier class', () => {
    const { container } = render(
      <RadioGroup legend="Group" orientation="horizontal">
        <RadioGroupItem value="a">A</RadioGroupItem>
      </RadioGroup>
    );
    expect(container.querySelector('fieldset')).toHaveClass('sv-radio-group--horizontal');
  });

  // AC P1-Escolhas #11 — default is vertical, no modifier class
  test('default orientation is vertical with no modifier class', () => {
    const { container } = render(
      <RadioGroup legend="Group">
        <RadioGroupItem value="a">A</RadioGroupItem>
      </RadioGroup>
    );
    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toHaveClass('sv-radio-group');
    expect(fieldset).not.toHaveClass('sv-radio-group--horizontal');
  });

  // Edge case: no name on group, no name on items — nothing is invented
  test('without a group name and without item names, no name is invented', () => {
    render(
      <RadioGroup legend="Group">
        <RadioGroupItem value="a">A</RadioGroupItem>
      </RadioGroup>
    );
    expect(screen.getByRole('radio')).not.toHaveAttribute('name');
  });

  // Edge case: no children at all
  test('renders an empty fieldset when there are no children', () => {
    const { container } = render(<RadioGroup legend="Group" />);
    const fieldset = container.querySelector('fieldset');
    expect(fieldset).not.toBeNull();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  test('forwards ref to the underlying fieldset element', () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(
      <RadioGroup ref={ref} legend="Group">
        <RadioGroupItem value="a">A</RadioGroupItem>
      </RadioGroup>
    );
    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
  });

  test('composes className on the fieldset instead of replacing it', () => {
    const { container } = render(
      <RadioGroup legend="Group" className="custom">
        <RadioGroupItem value="a">A</RadioGroupItem>
      </RadioGroup>
    );
    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toHaveClass('sv-radio-group');
    expect(fieldset).toHaveClass('custom');
  });

  test('source file has no "use client", no createContext, no useId and no Radix import', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/ui/radio-group.tsx'),
      'utf-8'
    );
    expect(source).not.toContain('use client');
    expect(source).not.toMatch(/createContext/);
    expect(source).not.toMatch(/useId/);
    expect(source).not.toMatch(/@radix-ui/);
  });
});

describe('RadioGroupItem', () => {
  // AC P1-Escolhas #10
  test('children become the label associated with the radio input', () => {
    render(<RadioGroupItem value="real">Real</RadioGroupItem>);
    const input = screen.getByLabelText('Real');
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(input).toHaveAttribute('type', 'radio');
  });

  test('type passed via props does not override type="radio"', () => {
    const props = { type: 'checkbox' } as unknown as React.ComponentProps<typeof RadioGroupItem>;
    render(<RadioGroupItem {...props}>Forced</RadioGroupItem>);
    expect(screen.getByLabelText('Forced')).toHaveAttribute('type', 'radio');
  });

  test('forwards ref to the underlying input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <RadioGroupItem ref={ref} value="a">
        A
      </RadioGroupItem>
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  test('composes className on the input instead of replacing it', () => {
    render(
      <RadioGroupItem value="a" className="custom">
        A
      </RadioGroupItem>
    );
    const input = screen.getByLabelText('A');
    expect(input).toHaveClass('sv-radio');
    expect(input).toHaveClass('custom');
  });

  test('disabled prop disables the radio input', () => {
    render(
      <RadioGroupItem value="a" disabled>
        A
      </RadioGroupItem>
    );
    expect(screen.getByLabelText('A')).toBeDisabled();
  });
});
