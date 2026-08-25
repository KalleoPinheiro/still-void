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
