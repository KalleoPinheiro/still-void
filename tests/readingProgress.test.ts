import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createReadingProgress, type ReadingProgress } from '../src/behaviors/readingProgress';

function setScrollExtent(scrollHeight: number, innerHeight: number, scrollY: number): void {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true });
  Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true });
}

describe('createReadingProgress', () => {
  let progress: ReadingProgress | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    setScrollExtent(2000, 800, 0);
  });

  afterEach(() => {
    progress?.destroy();
    progress = null;
    vi.useRealTimers();
  });

  test('measures progress immediately on creation', () => {
    setScrollExtent(2000, 800, 600);
    const onChange = vi.fn();
    progress = createReadingProgress({ onChange });
    expect(progress.getPercent()).toBeCloseTo(0.5);
    expect(onChange).toHaveBeenCalledWith(0.5);
  });

  test('coalesces bursts of scroll events into a single update per frame', () => {
    const onChange = vi.fn();
    progress = createReadingProgress({ onChange });
    onChange.mockClear();

    setScrollExtent(2000, 800, 1200);
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));

    vi.advanceTimersByTime(20);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(1);
  });

  test('destroy cancels a pending frame and stops future updates', () => {
    const onChange = vi.fn();
    progress = createReadingProgress({ onChange });
    onChange.mockClear();

    window.dispatchEvent(new Event('scroll'));
    progress.destroy();
    vi.advanceTimersByTime(20);

    expect(onChange).not.toHaveBeenCalled();
  });

  test('writes the CSS var on the var target', () => {
    setScrollExtent(2000, 800, 1200);
    const target = document.createElement('div');
    progress = createReadingProgress({ varTarget: target });
    expect(target.style.getPropertyValue('--sv-reading-progress')).toBe('1');
  });
});
