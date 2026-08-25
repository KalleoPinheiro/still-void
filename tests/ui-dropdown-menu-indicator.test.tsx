import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../src/components/ui/dropdown-menu';

afterEach(cleanup);

/**
 * CLIENT-09/10/14 for the DropdownMenu family. tests/ui-dropdown-menu.test.tsx
 * (kept in place, only its 'pl-8' assertions were updated) already covers
 * render shape; this file covers the indicator behavior it never exercised —
 * whether the checkbox/radio indicator actually renders for the checked
 * state and stays absent for the unchecked one, and the `icon` prop's three
 * branches (omitted / custom node / null).
 */
describe('DropdownMenu — CLIENT-09, checkbox indicator renders only when checked', () => {
  test('a checked item carries a check icon; an unchecked one has no indicator', () => {
    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={false}>Unchecked</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );
    const checked = screen.getByText('Checked').closest('[role="menuitemcheckbox"]') as HTMLElement;
    const unchecked = screen.getByText('Unchecked').closest('[role="menuitemcheckbox"]') as HTMLElement;
    expect(checked).toHaveAttribute('data-state', 'checked');
    expect(checked.querySelector('.sv-menu-item__indicator svg')).toBeInTheDocument();
    expect(unchecked).toHaveAttribute('data-state', 'unchecked');
    expect(unchecked.querySelector('.sv-menu-item__indicator')).not.toBeInTheDocument();
  });
});

describe('DropdownMenu — CLIENT-09, radio indicator is a CSS dot, not an icon', () => {
  test('the selected radio item renders .sv-menu-item__dot; the other does not', () => {
    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="a">
              <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );
    const a = screen.getByText('Option A').closest('[role="menuitemradio"]') as HTMLElement;
    const b = screen.getByText('Option B').closest('[role="menuitemradio"]') as HTMLElement;
    expect(a).toHaveAttribute('data-state', 'checked');
    expect(a.querySelector('.sv-menu-item__indicator .sv-menu-item__dot')).toBeInTheDocument();
    // The heroicons set has no dot glyph on this grid — the radio indicator
    // is a plain CSS circle, not an <svg>.
    expect(a.querySelector('.sv-menu-item__indicator svg')).not.toBeInTheDocument();
    expect(b).toHaveAttribute('data-state', 'unchecked');
    expect(b.querySelector('.sv-menu-item__indicator')).not.toBeInTheDocument();
  });
});

describe('DropdownMenu — CLIENT-10, sub-menu trigger renders a chevron-right', () => {
  test('DropdownMenuSubTrigger carries a chevron icon', () => {
    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>Nested</DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );
    const trigger = screen.getByText('More').closest('[role="menuitem"]') as HTMLElement;
    expect(trigger.querySelector('svg.sv-icon')).toBeInTheDocument();
  });
});

describe('DropdownMenu — CLIENT-14, icon is substitutable on checkbox, radio and sub-trigger', () => {
  test('a custom node on DropdownMenuCheckboxItem replaces the default check', () => {
    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked icon={<span data-testid="custom-check" />}>
              Checked
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );
    const item = screen.getByText('Checked').closest('[role="menuitemcheckbox"]') as HTMLElement;
    expect(within(item).getByTestId('custom-check')).toBeInTheDocument();
    expect(item.querySelector('svg.sv-icon')).not.toBeInTheDocument();
  });

  test('icon={null} on a checked DropdownMenuCheckboxItem renders no indicator', () => {
    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked icon={null}>
              Checked
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );
    const item = screen.getByText('Checked').closest('[role="menuitemcheckbox"]') as HTMLElement;
    expect(item.querySelector('.sv-menu-item__indicator')).not.toBeInTheDocument();
  });

  test('a custom node on DropdownMenuRadioItem replaces the default dot', () => {
    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="a">
              <DropdownMenuRadioItem value="a" icon={<span data-testid="custom-dot" />}>
                Option A
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );
    const item = screen.getByText('Option A').closest('[role="menuitemradio"]') as HTMLElement;
    expect(within(item).getByTestId('custom-dot')).toBeInTheDocument();
    expect(item.querySelector('.sv-menu-item__dot')).not.toBeInTheDocument();
  });

  test('icon={null} on a checked DropdownMenuRadioItem renders no indicator', () => {
    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="a">
              <DropdownMenuRadioItem value="a" icon={null}>
                Option A
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );
    const item = screen.getByText('Option A').closest('[role="menuitemradio"]') as HTMLElement;
    expect(item.querySelector('.sv-menu-item__indicator')).not.toBeInTheDocument();
  });

  test('icon={null} on DropdownMenuSubTrigger renders no chevron', () => {
    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger icon={null}>More</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>Nested</DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );
    const trigger = screen.getByText('More').closest('[role="menuitem"]') as HTMLElement;
    expect(trigger.querySelector('svg')).not.toBeInTheDocument();
  });
});
