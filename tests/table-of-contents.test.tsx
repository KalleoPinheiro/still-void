import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { TableOfContents } from '../src/react/client/TableOfContents';
import type { TocItem } from '../src/types';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
let ioCallback: IOCallback;

class MockIntersectionObserver {
  constructor(callback: IOCallback) {
    ioCallback = callback;
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

const items: TocItem[] = [
  { id: 'intro', label: 'Intro', depth: 2 },
  { id: 'setup', label: 'Setup', depth: 3 },
];

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  document.body.innerHTML = '<h2 id="intro"></h2><h3 id="setup"></h3>';
});

describe('TableOfContents', () => {
  test('renders one link per item with href=#id', () => {
    render(<TableOfContents items={items} />);
    expect(screen.getByRole('link', { name: 'Intro' })).toHaveAttribute('href', '#intro');
    expect(screen.getByRole('link', { name: 'Setup' })).toHaveAttribute('href', '#setup');
  });

  test('depth-3 item gets the depth modifier class, depth-2 does not', () => {
    render(<TableOfContents items={items} />);
    expect(screen.getByRole('link', { name: 'Setup' })).toHaveClass('sv-toc__link--depth-3');
    expect(screen.getByRole('link', { name: 'Intro' })).not.toHaveClass('sv-toc__link--depth-3');
  });

  test('scroll-spy active id gets aria-current and the active class', () => {
    render(<TableOfContents items={items} />);
    act(() => {
      ioCallback([
        { target: document.getElementById('setup')!, isIntersecting: true, intersectionRatio: 1 },
      ]);
    });
    expect(screen.getByRole('link', { name: 'Setup' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Setup' })).toHaveClass('sv-toc__link--active');
    expect(screen.getByRole('link', { name: 'Intro' })).not.toHaveAttribute('aria-current');
  });
});
