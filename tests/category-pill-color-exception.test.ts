import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * SBC-01: the `RawColor` story's `#ff5566` is a documented passthrough demo
 * (DESIGN.md's One-Accent Rule exempts CategoryPill from the accent
 * constraint), not drift — it must stay marked with the impeccable detector's
 * inline ignore comment, on the line immediately before the flagged value,
 * and the story must keep demonstrating the real passthrough value.
 */

const storyPath = resolve(process.cwd(), 'src/react/stories/CategoryPill.stories.tsx');
const source = readFileSync(storyPath, 'utf-8');
const lines = source.split('\n');

describe('CategoryPill RawColor story documents its detector exception', () => {
  test('still renders the raw #ff5566 passthrough (no behavior change)', () => {
    expect(source).toMatch(/args:\s*\{\s*label:\s*'Custom',\s*color:\s*'#ff5566'\s*\}/);
  });

  test('the flagged line is immediately preceded by the inline ignore directive', () => {
    const colorLineIndex = lines.findIndex((line) => line.includes("color: '#ff5566'"));
    expect(colorLineIndex).toBeGreaterThan(-1);
    const precedingLine = lines[colorLineIndex - 1];
    expect(precedingLine).toMatch(/impeccable-disable-next-line design-system-color:/);
  });
});
