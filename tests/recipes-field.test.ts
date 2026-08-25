import { describe, expect, test } from 'vitest';
import { field, fieldClasses, fieldMessage } from '../src/recipes/field';

describe('field()', () => {
  test('returns the bare frame class when called with no options', () => {
    expect(field()).toBe('sv-field');
  });

  test("variant 'input' adds no redundant modifier", () => {
    expect(field({ variant: 'input' })).toBe('sv-field');
  });

  test.each([
    ['textarea', 'sv-field sv-field--textarea'],
    ['select', 'sv-field sv-field--select'],
    ['file', 'sv-field sv-field--file'],
  ] as const)('variant %s composes the base class with its modifier', (variant, expected) => {
    expect(field({ variant })).toBe(expected);
  });
});

describe('fieldClasses', () => {
  test('exposes exactly the choice and screen-reader helper classes', () => {
    expect(Object.keys(fieldClasses).sort()).toEqual(['choice', 'srOnly']);
    expect(fieldClasses.choice).toBe('sv-choice');
    expect(fieldClasses.srOnly).toBe('sv-sr-only');
  });

  test('is declared as const, so each value keeps its literal type', () => {
    // These annotations fail `tsc --noEmit` (part of this task's gate) if the
    // `as const` is dropped and the values widen to `string`.
    const choice: 'sv-choice' = fieldClasses.choice;
    const srOnly: 'sv-sr-only' = fieldClasses.srOnly;
    expect([choice, srOnly]).toEqual(['sv-choice', 'sv-sr-only']);
  });
});

describe('fieldMessage()', () => {
  test('returns the bare message class when called with no options', () => {
    expect(fieldMessage()).toBe('sv-field-message');
  });

  test("variant 'hint' adds no redundant modifier", () => {
    expect(fieldMessage({ variant: 'hint' })).toBe('sv-field-message');
  });

  test("variant 'error' composes the base class with its modifier", () => {
    expect(fieldMessage({ variant: 'error' })).toBe('sv-field-message sv-field-message--error');
  });
});
