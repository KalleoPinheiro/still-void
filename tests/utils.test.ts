import { describe, expect, test } from 'vitest';
import { cn } from '../src/lib/utils';

describe('cn', () => {
  test('joins multiple class strings', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  test('drops falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  test('resolves conflicting Tailwind utility classes, last wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  test('merges conditional object-style class inputs from clsx', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active');
  });
});
