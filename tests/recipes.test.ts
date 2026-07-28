import { describe, expect, test } from 'vitest';
import { cx } from '../src/recipes/cx';
import { header } from '../src/recipes/shell';
import { categoryPill, postCard } from '../src/recipes/content';
import { callout, tocLink } from '../src/recipes/article';
import { resolveCategoryColor } from '../src/tokens/categories';
import { accents } from '../src/tokens/colors';

describe('cx', () => {
  test('joins truthy parts and drops falsy ones', () => {
    expect(cx('a', false, undefined, null, 'b')).toBe('a b');
  });
});

describe('recipes', () => {
  test('postCard applies dense modifier', () => {
    expect(postCard({ dense: true })).toContain('sv-post-card--dense');
    expect(postCard()).not.toContain('sv-post-card--dense');
  });

  test('postCard includes hover class unless disabled', () => {
    expect(postCard()).toContain('sv-card-hover');
    expect(postCard({ hover: false })).not.toContain('sv-card-hover');
  });

  test('header applies glass by default and allows opting out', () => {
    expect(header()).toContain('sv-glass');
    expect(header({ glass: false })).not.toContain('sv-glass');
  });

  test('callout maps each kind to its modifier', () => {
    expect(callout('note')).toContain('sv-callout--note');
    expect(callout('warn')).toContain('sv-callout--warn');
    expect(callout('aha')).toContain('sv-callout--aha');
  });

  test('tocLink marks active and indents depth 3', () => {
    expect(tocLink({ active: true })).toContain('sv-toc__link--active');
    expect(tocLink({ depth: 3 })).toContain('sv-toc__link--depth-3');
    expect(tocLink()).toBe('sv-toc__link');
  });

  test('categoryPill toggles interactive and active states', () => {
    expect(categoryPill({ interactive: true, active: true })).toBe(
      'sv-pill sv-pill--interactive sv-pill--active',
    );
  });
});

describe('resolveCategoryColor', () => {
  test('maps category names to accent values', () => {
    expect(resolveCategoryColor('ia')).toBe(accents.violet);
  });

  test('maps accent names to their oklch values', () => {
    expect(resolveCategoryColor('cyan')).toBe(accents.cyan);
  });

  test('passes raw CSS colors through unchanged', () => {
    expect(resolveCategoryColor('#ff0000')).toBe('#ff0000');
  });
});
