import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { ReadingProgress } from '../src/react/client/ReadingProgress';

afterEach(cleanup);

function setScrollExtent(scrollHeight: number, innerHeight: number, scrollY: number): void {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true });
  Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true });
}

describe('ReadingProgress wrapper', () => {
  test('default (announce=false) is aria-hidden with no progressbar role', () => {
    setScrollExtent(2000, 800, 0);
    const { container } = render(<ReadingProgress />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('role');
  });

  test('announce=true exposes role=progressbar with valuenow reflecting scroll percent', () => {
    setScrollExtent(2000, 800, 600);
    const { container } = render(<ReadingProgress announce />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('role', 'progressbar');
    expect(root).toHaveAttribute('aria-valuemin', '0');
    expect(root).toHaveAttribute('aria-valuemax', '100');
    expect(root).toHaveAttribute('aria-valuenow', '50');
    expect(root).toHaveAttribute('aria-label', 'Reading progress');
  });

  test('target prop is forwarded to the underlying progress measurement', () => {
    const target = document.createElement('div');
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
    target.getBoundingClientRect = () =>
      ({ top: -600, height: 1400 }) as DOMRect;

    const { container } = render(<ReadingProgress announce target={target} />);
    const root = container.firstElementChild as HTMLElement;
    // total = 1400 - 800 = 600; percent = -top/total = 600/600 = 1 -> valuenow 100
    expect(root).toHaveAttribute('aria-valuenow', '100');
  });
});
