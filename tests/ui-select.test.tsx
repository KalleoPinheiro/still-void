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
    expect(document.querySelector('[aria-hidden="true"].bg-sv-border')).toBeInTheDocument();
  });

  test('position=popper applies the popper translate and viewport sizing classes', () => {
    renderSelect('popper');
    const content = screen.getByRole('listbox');
    expect(content.className).toContain('data-[side=bottom]:translate-y-1');
    const viewport = document.querySelector('[data-radix-select-viewport]') as HTMLElement;
    expect(viewport.className).toContain('h-[var(--radix-select-trigger-height)]');
  });

  test('position=item-aligned omits the popper translate and viewport sizing classes', () => {
    renderSelect('item-aligned');
    const content = screen.getByRole('listbox');
    expect(content.className).not.toContain('data-[side=bottom]:translate-y-1');
    const viewport = document.querySelector('[data-radix-select-viewport]') as HTMLElement;
    expect(viewport.className).not.toContain('h-[var(--radix-select-trigger-height)]');
  });
});
