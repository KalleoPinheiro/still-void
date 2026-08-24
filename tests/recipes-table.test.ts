import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { table, tableClasses } from '../src/recipes/table';

const styleCss = readFileSync(resolve(process.cwd(), 'src/css/style.css'), 'utf-8');

describe('table()', () => {
  test('returns the base table class', () => {
    expect(table()).toBe('sv-table');
  });
});

describe('tableClasses', () => {
  test('covers exactly the eight table slots', () => {
    expect(Object.keys(tableClasses).sort()).toEqual([
      'body',
      'caption',
      'container',
      'foot',
      'head',
      'row',
      'td',
      'th',
    ]);
  });

  test.each([
    ['container', 'sv-table-container'],
    ['head', 'sv-table__head'],
    ['body', 'sv-table__body'],
    ['foot', 'sv-table__foot'],
    ['row', 'sv-table__row'],
    ['th', 'sv-table__th'],
    ['td', 'sv-table__td'],
    ['caption', 'sv-table__caption'],
  ] as const)('%s maps to %s', (slot, className) => {
    expect(tableClasses[slot]).toBe(className);
  });

  test('is declared as const, so each value keeps its literal type', () => {
    // Fails `tsc --noEmit` (part of this task's gate) if the `as const` is
    // dropped and the values widen to `string`.
    const container: 'sv-table-container' = tableClasses.container;
    const caption: 'sv-table__caption' = tableClasses.caption;
    expect([container, caption]).toEqual(['sv-table-container', 'sv-table__caption']);
  });
});

describe('every class the recipe hands out is a real rule in style.css', () => {
  // A recipe returning a class with no matching CSS rule is a ghost class:
  // it type-checks, renders, and silently styles nothing.
  test.each([table(), ...Object.values(tableClasses)])('.%s is styled', (className) => {
    expect(styleCss).toMatch(new RegExp(`\\.${className}(?![\\w-])`));
  });
});
