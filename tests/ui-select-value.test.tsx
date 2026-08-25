import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../src/components/ui/select';

afterEach(cleanup);

/**
 * CLIENT-13's defect only shows up once a value is actually picked: the round
 * 1 Select rendered fine while closed, and none of tests/ui-select.test.tsx's
 * existing cases ever selected an item, so the blank trigger shipped
 * undetected. This file drives the interaction end to end — `<Select open>`
 * keeps the panel mounted without needing to open it via pointer events on
 * the trigger, so userEvent only has to click the option itself.
 *
 * While the panel is open, Radix hides everything outside it from assistive
 * tech (`aria-hidden` on the trigger's ancestor — verified in the rendered
 * DOM), so the trigger drops out of the accessibility tree and
 * `getByRole('combobox')` cannot find it. That is correct ARIA behaviour for
 * an open listbox, not a testing gap, so these tests reach the trigger by its
 * stable `.sv-field` class instead of by role.
 */
function trigger(): HTMLElement {
  const found = document.querySelector('button.sv-field');
  if (found === null) throw new Error('Select trigger (.sv-field) not found');
  return found as HTMLElement;
}

function ControlledSelect(props: { onValueChange?: (value: string) => void }) {
  const [value, setValue] = React.useState<string | undefined>(undefined);
  return (
    <Select
      open
      value={value}
      onValueChange={(next) => {
        setValue(next);
        props.onValueChange?.(next);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe('Select — CLIENT-13, the trigger stays blank after picking a value', () => {
  test('picking an item calls onValueChange with that value', async () => {
    const onValueChange = vi.fn();
    render(<ControlledSelect onValueChange={onValueChange} />);
    await userEvent.click(screen.getByText('Apple'));
    expect(onValueChange).toHaveBeenCalledWith('apple');
  });

  test("after picking a value, the trigger renders that value's text", async () => {
    render(<ControlledSelect />);
    // Before selection the trigger shows only the placeholder — the defect
    // this AC guards against is what happens to this same node afterward.
    expect(within(trigger()).getByText('Pick one')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Apple'));

    // The spec-defined outcome: the trigger's own text includes the picked
    // item's label. Without SelectItem's ItemText wrapper this node stays
    // empty — CLIENT-13's exact failure mode.
    expect(trigger()).toHaveTextContent('Apple');
    expect(within(trigger()).queryByText('Pick one')).not.toBeInTheDocument();
  });

  test('switching the picked value updates the trigger to the new label', async () => {
    render(<ControlledSelect />);
    await userEvent.click(screen.getByText('Apple'));
    expect(trigger()).toHaveTextContent('Apple');

    await userEvent.click(screen.getByText('Banana'));
    expect(trigger()).toHaveTextContent('Banana');
    expect(trigger()).not.toHaveTextContent('Apple');
  });
});

describe('Select — CLIENT-09/10, indicators and chevrons render', () => {
  test('the selected item carries a check indicator; the unselected one does not', async () => {
    render(<ControlledSelect />);
    await userEvent.click(screen.getByText('Apple'));

    const apple = screen.getByRole('option', { name: 'Apple' });
    const banana = screen.getByRole('option', { name: 'Banana' });
    expect(apple).toHaveAttribute('data-state', 'checked');
    expect(apple.querySelector('.sv-menu-item__indicator svg')).toBeInTheDocument();
    expect(banana).toHaveAttribute('data-state', 'unchecked');
    // Radix's ItemIndicator only renders when checked — the slot really
    // collapses for the unselected item, not just visually hides.
    expect(banana.querySelector('.sv-menu-item__indicator')).not.toBeInTheDocument();
  });

  test('the trigger renders a chevron-down icon', () => {
    render(<ControlledSelect />);
    expect(trigger().querySelector('svg.sv-icon')).toBeInTheDocument();
  });
});

describe('Select — CLIENT-14, icon is substitutable per item and per trigger', () => {
  test('a custom node passed as icon replaces the default check', () => {
    render(
      <Select open value="apple" onValueChange={() => {}}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple" icon={<span data-testid="custom-check" />}>
            Apple
          </SelectItem>
        </SelectContent>
      </Select>,
    );
    const apple = screen.getByRole('option', { name: 'Apple' });
    expect(within(apple).getByTestId('custom-check')).toBeInTheDocument();
    expect(apple.querySelector('svg.sv-icon')).not.toBeInTheDocument();
  });

  test('icon={null} on an item renders no indicator even when selected', () => {
    render(
      <Select open value="apple" onValueChange={() => {}}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple" icon={null}>
            Apple
          </SelectItem>
        </SelectContent>
      </Select>,
    );
    const apple = screen.getByRole('option', { name: 'Apple' });
    expect(apple.querySelector('.sv-menu-item__indicator')).not.toBeInTheDocument();
  });

  test('a custom node passed as icon on the trigger replaces the default chevron', () => {
    render(
      <Select open>
        <SelectTrigger icon={<span data-testid="custom-chevron" />}>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(within(trigger()).getByTestId('custom-chevron')).toBeInTheDocument();
    expect(trigger().querySelector('svg.sv-icon')).not.toBeInTheDocument();
  });

  test('icon={null} on the trigger renders no chevron at all', () => {
    render(
      <Select open>
        <SelectTrigger icon={null}>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(trigger().querySelector('svg')).not.toBeInTheDocument();
  });
});
