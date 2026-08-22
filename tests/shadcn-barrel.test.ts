import { describe, expect, test } from 'vitest';
import * as shadcnClient from '../src/react/client/shadcn';

const expectedExports = [
  'Dialog',
  'DialogPortal',
  'DialogOverlay',
  'DialogClose',
  'DialogTrigger',
  'DialogContent',
  'DialogHeader',
  'DialogFooter',
  'DialogTitle',
  'DialogDescription',
  'Select',
  'SelectGroup',
  'SelectValue',
  'SelectTrigger',
  'SelectContent',
  'SelectItem',
  'SelectLabel',
  'SelectSeparator',
  'SelectScrollUpButton',
  'SelectScrollDownButton',
  'DropdownMenu',
  'DropdownMenuTrigger',
  'DropdownMenuContent',
  'DropdownMenuItem',
  'DropdownMenuCheckboxItem',
  'DropdownMenuRadioItem',
  'DropdownMenuLabel',
  'DropdownMenuSeparator',
  'DropdownMenuShortcut',
  'DropdownMenuGroup',
  'DropdownMenuPortal',
  'DropdownMenuSub',
  'DropdownMenuSubContent',
  'DropdownMenuSubTrigger',
  'DropdownMenuRadioGroup',
  'Tabs',
  'TabsList',
  'TabsTrigger',
  'TabsContent',
  'Tooltip',
  'TooltipTrigger',
  'TooltipContent',
  'TooltipProvider',
] as const;

describe('react/client/shadcn re-export barrel', () => {
  test.each(expectedExports)('exports %s as a defined value', (name) => {
    expect(shadcnClient[name as keyof typeof shadcnClient]).toBeDefined();
  });

  test('exports exactly the expected named bindings (no accidental additions or omissions)', () => {
    expect(Object.keys(shadcnClient).sort()).toEqual([...expectedExports].sort());
  });
});
