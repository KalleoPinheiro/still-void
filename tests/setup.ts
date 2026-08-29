import '@testing-library/jest-dom/vitest';

// jsdom implements no layout, so it never shipped `scrollIntoView` — every
// element is `undefined` there. Radix's Select (and, transitively, any
// listbox/menu that focuses a selected or highlighted item on open) calls it
// unconditionally once it resolves a candidate to focus, so any test that
// lets that effect run to completion throws `scrollIntoView is not a
// function`, not an assertion failure. This is a real, standard method
// (scrolls an element into the viewport) that the test environment simply
// never implements — polyfilling it as a no-op matches jsdom's own approach
// to layout: it does not verify scroll positions, so nothing here weakens
// what a test can assert. Radix will call the real one in a browser.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// jsdom does not implement hasPointerCapture. Stub it globally for Radix UI toast.
if (typeof Element !== 'undefined' && !Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = function hasPointerCapture() {
    return false;
  };
}
if (typeof Element !== 'undefined' && !Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = function setPointerCapture() {};
}
if (typeof Element !== 'undefined' && !Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = function releasePointerCapture() {};
}

// jsdom does not implement matchMedia. Stub it globally for tests.
// Default behavior: matches = false (desktop/no-query-match).
// Tests can override via vi.stubGlobal or local mocks as needed.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => {
    const listeners: ((mql: MediaQueryList) => void)[] = [];

    const mql = {
      matches: false,
      media: query,
      onchange: null,
      addListener: (listener: (mql: MediaQueryList) => void) => {
        listeners.push(listener);
      },
      removeListener: (listener: (mql: MediaQueryList) => void) => {
        const idx = listeners.indexOf(listener);
        if (idx >= 0) listeners.splice(idx, 1);
      },
      addEventListener: (type: string, listener: (mql: MediaQueryList) => void) => {
        if (type === 'change') {
          listeners.push(listener);
        }
      },
      removeEventListener: (type: string, listener: (mql: MediaQueryList) => void) => {
        if (type === 'change') {
          const idx = listeners.indexOf(listener);
          if (idx >= 0) listeners.splice(idx, 1);
        }
      },
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;

    return mql;
  };
}
