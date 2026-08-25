import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Card } from '../src/components/ui/card';

afterEach(cleanup);

/**
 * CARD-01..06 (AD-006): `as` picks the rendered tag, `asChild` merges onto a
 * single child instead of rendering a wrapper, and `asChild` wins when both
 * are given. tests/ui-card.test.tsx already covers the untouched default
 * (`<div>`, ref forwarding, className merge) — this file covers only the
 * behavior round 2 adds.
 */
describe('Card — as picks the rendered tag (CARD-01, CARD-02)', () => {
  test.each(['section', 'article', 'li', 'aside'] as const)(
    'as="%s" renders a <%s>, keeping sv-card',
    (tag) => {
      render(<Card as={tag}>Body</Card>);
      const el = screen.getByText('Body');
      expect(el.tagName.toLowerCase()).toBe(tag);
      expect(el).toHaveClass('sv-card');
    },
  );

  test('no as prop renders a <div>, unchanged from today', () => {
    render(<Card>Body</Card>);
    expect(screen.getByText('Body').tagName.toLowerCase()).toBe('div');
  });

  test('an invalid as value at runtime falls back to <div>, not a literal tag', () => {
    // A caller bypassing the closed union with an untyped value (e.g. from
    // JS, or `as any`) must not reach React.createElement with an arbitrary
    // string — that would render whatever was passed as a real tag name.
    const InvalidAs = 'not-a-real-tag' as unknown as 'div';
    render(<Card as={InvalidAs}>Body</Card>);
    expect(screen.getByText('Body').tagName.toLowerCase()).toBe('div');
  });
});

describe('Card — asChild merges onto a single child (CARD-03)', () => {
  test('renders the child element directly, with no wrapper', () => {
    render(
      <Card asChild className="sv-card extra">
        <a href="/somewhere">Link card</a>
      </Card>,
    );
    const link = screen.getByRole('link', { name: 'Link card' });
    expect(link.tagName.toLowerCase()).toBe('a');
    expect(link).toHaveAttribute('href', '/somewhere');
    expect(link).toHaveClass('sv-card');
    expect(link).toHaveClass('extra');
    // No intermediate <div class="sv-card"> wrapping the <a> — the anchor
    // IS the styled element, which is the entire point of asChild.
    expect(link.parentElement?.className ?? '').not.toContain('sv-card');
  });

  test('forwards an object ref onto the child element, not a wrapper', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Card asChild ref={ref}>
        <a href="/somewhere">Link card</a>
      </Card>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    expect(ref.current).toBe(screen.getByRole('link'));
  });

  test('forwards a callback ref onto the child element', () => {
    let captured: Element | null = null;
    render(
      <Card asChild ref={(node) => { captured = node; }}>
        <a href="/somewhere">Link card</a>
      </Card>,
    );
    expect(captured).toBe(screen.getByRole('link'));
  });

  test('composes Card\'s ref with a ref already on the child element', () => {
    const cardRef = createRef<HTMLElement>();
    const childRef = createRef<HTMLAnchorElement>();
    render(
      <Card asChild ref={cardRef}>
        <a href="/somewhere" ref={childRef}>Link card</a>
      </Card>,
    );
    const link = screen.getByRole('link');
    expect(cardRef.current).toBe(link);
    expect(childRef.current).toBe(link);
  });

  test('merges an onClick from Card with the child element\'s own onClick', () => {
    const calls: string[] = [];
    render(
      <Card asChild onClick={() => calls.push('card')}>
        <button onClick={() => calls.push('child')}>Click</button>
      </Card>,
    );
    screen.getByText('Click').click();
    expect(calls).toEqual(['child', 'card']);
  });

  test('concatenates className when both Card and the child pass one', () => {
    render(
      <Card asChild className="sv-card">
        <a href="/somewhere" className="child-own-class">Link card</a>
      </Card>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveClass('sv-card');
    expect(link).toHaveClass('child-own-class');
  });

  test('merges style objects when both Card and the child pass one', () => {
    render(
      <Card asChild style={{ color: 'red' }}>
        <a href="/somewhere" style={{ fontWeight: 'bold' }}>Link card</a>
      </Card>,
    );
    const link = screen.getByRole('link');
    expect(link.style.color).toBe('red');
    expect(link.style.fontWeight).toBe('bold');
  });
});

describe('Card — asChild wins over as when both are given (CARD-04, AD-006)', () => {
  test('as="section" is ignored when asChild is also true', () => {
    const { container } = render(
      <Card as="section" asChild>
        <a href="/somewhere">Link card</a>
      </Card>,
    );
    const link = screen.getByRole('link', { name: 'Link card' });
    expect(link.tagName.toLowerCase()).toBe('a');
    // No <section> anywhere — if `as` had won, or if asChild rendered a
    // wrapper around the child instead of merging onto it, one would exist.
    expect(container.querySelector('section')).not.toBeInTheDocument();
  });
});

describe('Card — asChild requires exactly one element child', () => {
  test('throws a descriptive error when given more than one child', () => {
    // React itself would already reject invalid JSX children shapes for most
    // cases, so this asserts the guard fires for the shape that DOES reach
    // Slot's render: two sibling elements.
    const consoleError = console.error;
    console.error = () => {};
    try {
      expect(() =>
        render(
          <Card asChild>
            <>
              <span>One</span>
              <span>Two</span>
            </>
          </Card>,
        ),
      ).toThrow(/single React element child/);
    } finally {
      console.error = consoleError;
    }
  });
});
