import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * SBC-02: four literal inline-style values in Storybook demo code sat off
 * DESIGN.md's type/radius scale (real advisories flagged by
 * `detect.mjs`, even though none reached shipped CSS). Each must now
 * reference the real token instead of the hardcoded literal.
 */

function read(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf-8');
}

describe('Icon.stories.tsx name caption uses the type scale', () => {
  const source = read('src/react/stories/Icon.stories.tsx');

  test('references var(--sv-text-xs), the smallest real type step', () => {
    expect(source).toContain("fontSize: 'var(--sv-text-xs)'");
  });

  test('no longer hardcodes the off-scale 0.6875rem literal', () => {
    expect(source).not.toContain('0.6875rem');
  });
});

describe('Select.stories.tsx "Small" trigger uses the type scale', () => {
  const source = read('src/react/stories/Select.stories.tsx');

  test('references var(--sv-text-sm) for the smaller trigger', () => {
    expect(source).toContain("fontSize: 'var(--sv-text-sm)'");
  });

  test('no longer hardcodes the off-scale 0.875rem literal', () => {
    expect(source).not.toContain('0.875rem');
  });
});

describe('Tooltip.stories.tsx keyboard-shortcut <kbd> uses the radius scale', () => {
  const source = read('src/react/stories/Tooltip.stories.tsx');

  test('both <kbd> elements reference var(--sv-radius-sm)', () => {
    const matches = source.match(/borderRadius: 'var\(--sv-radius-sm\)'/g) ?? [];
    expect(matches).toHaveLength(2);
  });

  test('no longer hardcodes the off-scale 3px literal', () => {
    expect(source).not.toContain("'3px'");
  });
});
