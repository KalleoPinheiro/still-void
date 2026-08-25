import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../src/components/ui/select';

afterEach(cleanup);

function renderSelect(position: 'popper' | 'item-aligned') {
  return render(
    <Select open>
      <SelectTrigger>
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent position={position}>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectSeparator />
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>,
  );
}

describe('Select family', () => {
  test('renders trigger placeholder', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  test('position=popper (default) renders items, label and separator', () => {
    renderSelect('popper');
    expect(screen.getByText('Fruits')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    // sv-menu-separator replaces the Tailwind `bg-sv-border` utility this
    // assertion used to check for — same element, styled through style.css
    // instead of an arbitrary-color utility (round 2, CLIENT-01).
    expect(document.querySelector('[aria-hidden="true"].sv-menu-separator')).toBeInTheDocument();
  });

  // These two used to assert the literal Tailwind arbitrary-variant strings
  // (`data-[side=bottom]:translate-y-1`, `h-[var(--radix-select-trigger-height)]`)
  // that position="popper" used to emit. Round 2 replaces every Tailwind
  // utility in this component with sv-* classes (CLIENT-01), so the same
  // positioning behavior — the panel nudges toward the side it flipped to,
  // and the viewport matches the trigger's own width/height — now lives in
  // .sv-pop--popper[data-side] and .sv-pop__viewport--popper in style.css.
  // These assertions were rewritten, not weakened: they still prove the
  // modifier is present only in "popper" mode and absent in "item-aligned".
  test('position=popper applies the popper offset and viewport sizing modifiers', () => {
    renderSelect('popper');
    const content = screen.getByRole('listbox');
    expect(content.className).toContain('sv-pop--popper');
    const viewport = document.querySelector('[data-radix-select-viewport]') as HTMLElement;
    expect(viewport.className).toContain('sv-pop__viewport--popper');
  });

  test('position=item-aligned omits the popper offset and viewport sizing modifiers', () => {
    renderSelect('item-aligned');
    const content = screen.getByRole('listbox');
    expect(content.className).not.toContain('sv-pop--popper');
    const viewport = document.querySelector('[data-radix-select-viewport]') as HTMLElement;
    expect(viewport.className).not.toContain('sv-pop__viewport--popper');
  });
});
