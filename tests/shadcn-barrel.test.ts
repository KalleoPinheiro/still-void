import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
  'AlertDialog',
  'AlertDialogPortal',
  'AlertDialogOverlay',
  'AlertDialogTrigger',
  'AlertDialogContent',
  'AlertDialogHeader',
  'AlertDialogFooter',
  'AlertDialogTitle',
  'AlertDialogDescription',
  'AlertDialogAction',
  'AlertDialogCancel',
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

/**
 * ALERT-06: round 1 shipped a doc line ("`AlertDialog` family") describing a
 * component that did not exist in `src/` (AD-007) — nothing checked that the
 * catalog the doc promises matches the barrel it describes. This is that
 * check, and it is deliberately generic: it parses whatever families
 * `docs/design-system.md` claims at the moment it runs and asserts each one
 * resolves from the barrel, so a *future* doc/artifact drift on any family —
 * not just AlertDialog — fails here too.
 */
describe('docs/design-system.md ↔ client barrel cross-check (ALERT-06)', () => {
  const doc = readFileSync(resolve(process.cwd(), 'docs/design-system.md'), 'utf-8');
  const docFamilyLine = doc.split('\n').find((line) => line.includes('shadcn/ui:'));

  if (docFamilyLine === undefined) {
    throw new Error(
      'docs/design-system.md no longer has a "shadcn/ui:" row — update this cross-check alongside the doc',
    );
  }

  // Each claimed family reads as e.g. "`AlertDialog` family" in the doc row.
  const docFamilies = [...docFamilyLine.matchAll(/`(\w+)` family/g)]
    .map((match) => match[1])
    .filter((name): name is string => name !== undefined);

  test('the doc row lists at least one family (guards the parser against silently matching nothing)', () => {
    expect(docFamilies.length).toBeGreaterThan(0);
  });

  test.each(docFamilies)('the doc-claimed family "%s" actually resolves from the barrel', (family) => {
    expect(shadcnClient[family as keyof typeof shadcnClient]).toBeDefined();
  });
});
