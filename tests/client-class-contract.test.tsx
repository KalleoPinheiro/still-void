import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../src/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../src/components/ui/dropdown-menu';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../src/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../src/components/ui/tooltip';

afterEach(cleanup);

/**
 * CLIENT-01's single hard requirement, checked once across the whole client
 * family instead of piecemeal per component: every class token this family
 * emits starts with `sv-`, except a token the *consumer* supplied through
 * `className` (the control case that proves cn() still merges instead of
 * replacing).
 *
 * Named explicitly, because these are the exact dead classes the round set
 * out to remove and a regression here is the failure mode that shipped
 * undetected before: `bg-background`, `ring-ring`, `ring-accent`,
 * `ring-offset-background` (referenced a color this package never declared —
 * no visible focus at all), `shadow-lg`, `shadow-md`, `shadow-sm` (all three
 * violate the Flat-By-Default rule).
 *
 * Radix renders panels into a portal attached to `document.body`, not inside
 * the component under test's own container, so the sweep reads the whole
 * document rather than the render() return value.
 */

const CONSUMER_CLASS = 'consumer-supplied';
const DEAD_CLASSES = [
  'bg-background',
  'ring-ring',
  'ring-accent',
  'ring-offset-background',
  'shadow-lg',
  'shadow-md',
  'shadow-sm',
];

/**
 * Every class token on every element in `root`, `class` attribute included.
 *
 * Reads `getAttribute('class')` rather than `.className`: on an SVG element
 * (every icon renders one) `.className` is an `SVGAnimatedString`, not a
 * plain string, and has no `.split`. The attribute is a plain string on both
 * HTML and SVG elements.
 */
function allClassTokens(root: ParentNode): string[] {
  const tokens: string[] = [];
  for (const el of root.querySelectorAll('[class]')) {
    tokens.push(...(el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean));
  }
  return tokens;
}

function assertOnlySystemClasses(): void {
  const tokens = allClassTokens(document.body);
  // Guards the sweep itself: an empty result would make every assertion
  // below vacuously true.
  expect(tokens.length).toBeGreaterThan(0);

  const foreign = tokens.filter(
    (token) => token !== CONSUMER_CLASS && !token.startsWith('sv-'),
  );
  expect(foreign).toEqual([]);

  for (const dead of DEAD_CLASSES) {
    expect(tokens).not.toContain(dead);
  }

  expect(tokens).toContain(CONSUMER_CLASS);
}

describe('Client family — every emitted class is sv-* (CLIENT-01)', () => {
  test('Dialog', () => {
    render(
      <Dialog open>
        <DialogTrigger className={CONSUMER_CLASS}>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    assertOnlySystemClasses();
  });

  test('Tabs', () => {
    render(
      <Tabs defaultValue="a" className={CONSUMER_CLASS}>
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );
    assertOnlySystemClasses();
  });

  test('Tooltip', () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger className={CONSUMER_CLASS}>Hover</TooltipTrigger>
          <TooltipContent>Tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    assertOnlySystemClasses();
  });

  test('Select', () => {
    render(
      <Select open>
        <SelectTrigger className={CONSUMER_CLASS}>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectSeparator />
            <SelectItem value="banana">Banana</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    assertOnlySystemClasses();
  });

  test('DropdownMenu', () => {
    render(
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger className={CONSUMER_CLASS}>Menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Plain item</DropdownMenuItem>
            <DropdownMenuItem inset>Inset item</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>Checkbox item</DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup value="a">
              <DropdownMenuRadioItem value="a">Radio A</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="b">Radio B</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSub open>
              <DropdownMenuSubTrigger>Sub trigger</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );
    assertOnlySystemClasses();
  });
});
