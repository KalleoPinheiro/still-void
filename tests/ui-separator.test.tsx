import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Separator } from '../src/components/ui/separator';

afterEach(cleanup);

describe('Separator — defaults (R4-03 AC1)', () => {
  test('renders sv-separator, no role, no aria-orientation', () => {
    const { container } = render(<Separator />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('sv-separator');
    expect(el.className).not.toContain('sv-separator--vertical');
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.hasAttribute('aria-orientation')).toBe(false);
  });
});

describe('Separator — decorative={false} (R4-03 AC2)', () => {
  test('horizontal: role="separator", no aria-orientation (ARIA default is horizontal)', () => {
    const { container } = render(<Separator decorative={false} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('role')).toBe('separator');
    expect(el.hasAttribute('aria-orientation')).toBe(false);
  });

  test('vertical: role="separator" and aria-orientation="vertical"', () => {
    const { container } = render(<Separator decorative={false} orientation="vertical" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('role')).toBe('separator');
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
  });
});

describe('Separator — orientation="vertical" (R4-03 AC3)', () => {
  test('adds sv-separator--vertical on top of the base class', () => {
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('sv-separator');
    expect(el.className).toContain('sv-separator--vertical');
  });
});

describe('Separator — consumer className (R4-03 AC4)', () => {
  test('is merged onto sv-separator, never replaces it', () => {
    const { container } = render(<Separator className="mine" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('sv-separator');
    expect(el.className).toContain('mine');
  });
});

describe('Separator — component identity', () => {
  test('displayName is Separator', () => {
    expect(Separator.displayName).toBe('Separator');
  });

  test('forwards ref to the underlying div', () => {
    let node: HTMLDivElement | null = null;
    render(<Separator ref={(el) => { node = el; }} />);
    expect(node).not.toBeNull();
    expect((node as unknown as HTMLDivElement).className).toContain('sv-separator');
  });
});
