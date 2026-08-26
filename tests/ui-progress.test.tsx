import type { ComponentProps } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Progress } from '../src/components/ui/progress';

afterEach(cleanup);

function renderProgress(props: ComponentProps<typeof Progress> = {}) {
  const { container } = render(<Progress {...props} />);
  const root = container.firstElementChild as HTMLElement;
  const indicator = root.querySelector('.sv-progress__indicator') as HTMLElement;
  return { root, indicator };
}

describe('Progress — ARIA (R4-04 AC1)', () => {
  test('value=9 max=17 sets the full aria progressbar trio', () => {
    const { root } = renderProgress({ value: 9, max: 17 });
    expect(root.getAttribute('role')).toBe('progressbar');
    expect(root.getAttribute('aria-valuenow')).toBe('9');
    expect(root.getAttribute('aria-valuemin')).toBe('0');
    expect(root.getAttribute('aria-valuemax')).toBe('17');
  });
});

describe('Progress — defaults (R4-04 AC2/AC3)', () => {
  test('max defaults to 100 (native <progress> parity)', () => {
    const { root } = renderProgress({ value: 5 });
    expect(root.getAttribute('aria-valuemax')).toBe('100');
  });

  test('value defaults to 0', () => {
    const { root } = renderProgress();
    expect(root.getAttribute('aria-valuenow')).toBe('0');
  });
});

describe('Progress — indicator width (R4-04 AC4)', () => {
  test.each([
    [9, 17, `${(9 / 17) * 100}%`],
    [0, 100, '0%'],
    [50, 100, '50%'],
    [15, 15, '100%'],
  ])('value=%s max=%s -> width %s', (value, max, expected) => {
    const { indicator } = renderProgress({ value, max });
    expect(indicator.style.width).toBe(expected);
  });
});

describe('Progress — clamping (edge cases)', () => {
  test('value above max clamps to 100% and aria-valuenow to max', () => {
    const { root, indicator } = renderProgress({ value: 25, max: 17 });
    expect(indicator.style.width).toBe('100%');
    expect(root.getAttribute('aria-valuenow')).toBe('17');
  });

  test('negative value clamps to 0% and aria-valuenow to 0', () => {
    const { root, indicator } = renderProgress({ value: -5, max: 10 });
    expect(indicator.style.width).toBe('0%');
    expect(root.getAttribute('aria-valuenow')).toBe('0');
  });

  test('max=0 renders 0% instead of dividing by zero', () => {
    const { indicator } = renderProgress({ value: 5, max: 0 });
    expect(indicator.style.width).toBe('0%');
  });
});

describe('Progress — consumer className (R4-04 AC5)', () => {
  test('is merged onto sv-progress on the root, never replaces it', () => {
    const { root } = renderProgress({ className: 'mine' });
    expect(root.className).toContain('sv-progress');
    expect(root.className).toContain('mine');
  });
});

describe('Progress — component identity', () => {
  test('displayName is Progress', () => {
    expect(Progress.displayName).toBe('Progress');
  });

  test('forwards ref to the underlying div', () => {
    let node: HTMLDivElement | null = null;
    render(<Progress ref={(el) => { node = el; }} />);
    expect(node).not.toBeNull();
    expect((node as unknown as HTMLDivElement).className).toContain('sv-progress');
  });
});
