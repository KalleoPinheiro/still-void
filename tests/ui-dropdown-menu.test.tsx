import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../src/components/ui/dropdown-menu';

afterEach(cleanup);

describe('DropdownMenu family', () => {
  test('renders every sub-component when open, including inset and sub-menu branches', () => {
    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuLabel inset>Inset label</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>Plain item</DropdownMenuItem>
              <DropdownMenuItem inset>Inset item</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>Checkbox item</DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup value="a">
              <DropdownMenuRadioItem value="a">Radio A</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="b">Radio B</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Plain sub trigger</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>Unopened sub content</DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub open>
              <DropdownMenuSubTrigger inset>Inset sub trigger</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  Sub item
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );

    expect(screen.getByText('Actions')).toBeInTheDocument();
    // 'pl-8' was the Tailwind indent utility `inset` used to add. Round 2
    // replaces every Tailwind utility in this component with sv-* classes
    // (CLIENT-01), same as the identical conflict already resolved in
    // tests/ui-select.test.tsx: the visual behavior — an inset item is
    // indented, a plain one is not — is unchanged, only the class name that
    // proves it moved to '.sv-menu-item--inset'.
    expect(screen.getByText('Inset label')).toHaveClass('sv-menu-item--inset');
    expect(screen.getByText('Plain item')).toBeInTheDocument();
    expect(screen.getByText('Inset item')).toHaveClass('sv-menu-item--inset');
    expect(screen.getByText('Checkbox item')).toBeInTheDocument();
    expect(screen.getByText('Radio A')).toBeInTheDocument();
    expect(screen.getByText('Radio B')).toBeInTheDocument();
    expect(screen.getByText('Plain sub trigger')).not.toHaveClass('sv-menu-item--inset');
    expect(screen.getByText('Inset sub trigger')).toHaveClass('sv-menu-item--inset');
    expect(screen.getByText('Sub item')).toBeInTheDocument();
    expect(screen.getByText('⌘S')).toBeInTheDocument();
  });
});

describe('DropdownMenu — component identity (R3-01)', () => {
  test('every member carries a literal displayName equal to its export name', () => {
    // Radix ships these primitives without a displayName (`X.displayName =
    // DropdownMenuPrimitive.Y.displayName` used to resolve to `undefined`),
    // so every member is now assigned a literal string instead of inheriting
    // from the primitive.
    expect(DropdownMenuSubTrigger.displayName).toBe('DropdownMenuSubTrigger');
    expect(DropdownMenuSubContent.displayName).toBe('DropdownMenuSubContent');
    expect(DropdownMenuContent.displayName).toBe('DropdownMenuContent');
    expect(DropdownMenuItem.displayName).toBe('DropdownMenuItem');
    expect(DropdownMenuCheckboxItem.displayName).toBe('DropdownMenuCheckboxItem');
    expect(DropdownMenuRadioItem.displayName).toBe('DropdownMenuRadioItem');
    expect(DropdownMenuLabel.displayName).toBe('DropdownMenuLabel');
    expect(DropdownMenuSeparator.displayName).toBe('DropdownMenuSeparator');
    expect(DropdownMenuShortcut.displayName).toBe('DropdownMenuShortcut');
  });
});
