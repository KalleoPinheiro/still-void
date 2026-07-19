import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createScrollSpy } from '../src/behaviors/scrollSpy';

type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let ioCallback: IOCallback;
const observed: Element[] = [];
const disconnect = vi.fn();

class MockIntersectionObserver {
  constructor(callback: IOCallback) {
    ioCallback = callback;
  }
  observe(el: Element) {
    observed.push(el);
  }
  disconnect = disconnect;
  unobserve() {}
  takeRecords() {
    return [];
  }
}

describe('createScrollSpy', () => {
  beforeEach(() => {
    observed.length = 0;
    disconnect.mockClear();
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    document.body.innerHTML = '<h2 id="intro"></h2><h2 id="setup"></h2><h2 id="usage"></h2>';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  test('observes every existing heading', () => {
    createScrollSpy(['intro', 'setup', 'usage', 'missing'], { onChange: () => {} });
    expect(observed.map((el) => el.id)).toEqual(['intro', 'setup', 'usage']);
  });

  test('reports first visible id in document order', () => {
    const onChange = vi.fn();
    createScrollSpy(['intro', 'setup', 'usage'], { onChange });

    ioCallback([
      { target: document.getElementById('usage')!, isIntersecting: true, intersectionRatio: 1 },
      { target: document.getElementById('setup')!, isIntersecting: true, intersectionRatio: 1 },
    ]);
    expect(onChange).toHaveBeenLastCalledWith('setup');

    ioCallback([
      { target: document.getElementById('setup')!, isIntersecting: false, intersectionRatio: 0 },
    ]);
    expect(onChange).toHaveBeenLastCalledWith('usage');
  });

  test('reports null when nothing is visible', () => {
    const onChange = vi.fn();
    createScrollSpy(['intro'], { onChange });
    ioCallback([
      { target: document.getElementById('intro')!, isIntersecting: false, intersectionRatio: 0 },
    ]);
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  test('destroy disconnects the observer', () => {
    const spy = createScrollSpy(['intro'], { onChange: () => {} });
    spy.destroy();
    expect(disconnect).toHaveBeenCalled();
  });
});
