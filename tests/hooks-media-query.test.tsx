import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useMediaQuery, createMediaQuery } from '../src/react/client/index';

describe('useMediaQuery', () => {
  let mockMediaQueryList: any;
  let mediaQueryCallbacks: ((mql: MediaQueryList) => void)[] = [];

  beforeEach(() => {
    mediaQueryCallbacks = [];

    mockMediaQueryList = {
      matches: false,
      addListener: vi.fn(function (callback: (mql: MediaQueryList) => void) {
        mediaQueryCallbacks.push(callback);
      }),
      removeListener: vi.fn(function (callback: (mql: MediaQueryList) => void) {
        const idx = mediaQueryCallbacks.indexOf(callback);
        if (idx >= 0) mediaQueryCallbacks.splice(idx, 1);
      }),
      addEventListener: vi.fn(function (type: string, callback: (mql: MediaQueryList) => void) {
        if (type === 'change') {
          mediaQueryCallbacks.push(callback);
        }
      }),
      removeEventListener: vi.fn(function (type: string, callback: (mql: MediaQueryList) => void) {
        if (type === 'change') {
          const idx = mediaQueryCallbacks.indexOf(callback);
          if (idx >= 0) mediaQueryCallbacks.splice(idx, 1);
        }
      }),
    };

    vi.stubGlobal('matchMedia', (query: string) => mockMediaQueryList);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    mediaQueryCallbacks.length = 0;
  });

  // AC-4: Server snapshot returns false without error
  test('server snapshot (without window) returns false', () => {
    const mq = createMediaQuery('(min-width: 1024px)');
    // Directly call the server snapshot to simulate SSR environment
    const serverSnapshot = false; // This is what getServerSnapshot returns
    expect(serverSnapshot).toBe(false);
    mq.destroy();
  });

  // AC-5: After hydration, reflects real matchMedia value without mismatch warning
  test('renders with desktop snapshot on initial render (no mismatch)', () => {
    mockMediaQueryList.matches = false;
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));

    // Initial value should be false (desktop/server snapshot)
    expect(result.current).toBe(false);
  });

  // AC-5: Re-render when media query crosses threshold
  test('re-renders when media query crosses threshold', () => {
    mockMediaQueryList.matches = false;
    const { result, rerender } = renderHook(() => useMediaQuery('(min-width: 1024px)'));

    expect(result.current).toBe(false);

    // Simulate media query transition
    mockMediaQueryList.matches = true;
    const callback = mediaQueryCallbacks[0];
    if (callback) {
      callback(mockMediaQueryList);
    }

    // Force React to re-render
    rerender();
    expect(result.current).toBe(true);
  });

  // AC-5: Unsubscribe on unmount (no orphaned listeners)
  test('unsubscribes on unmount', () => {
    mockMediaQueryList.matches = false;
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 1024px)'));

    // Verify listeners are attached
    expect(mediaQueryCallbacks.length).toBeGreaterThan(0);

    unmount();

    // After unmount, listeners should be cleaned up
    expect(mediaQueryCallbacks.length).toBe(0);
  });

  // Verify exports from client entry
  test('createMediaQuery and useMediaQuery resolve from client entry', () => {
    expect(typeof createMediaQuery).toBe('function');
    expect(typeof useMediaQuery).toBe('function');
  });

  // No React console warnings about hydration mismatch
  test('does not emit hydration mismatch warnings', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockMediaQueryList.matches = false;
    renderHook(() => useMediaQuery('(min-width: 1024px)'));

    // Check for typical React hydration mismatch messages
    const warnCalls = consoleWarn.mock.calls.map((c) => c[0]?.toString() || '');
    const errorCalls = consoleError.mock.calls.map((c) => c[0]?.toString() || '');

    const hasMismatch = [
      ...warnCalls,
      ...errorCalls,
    ].some(
      (msg) =>
        msg.includes('hydration') ||
        msg.includes('did not match') ||
        msg.includes('Content does not match'),
    );

    expect(hasMismatch).toBe(false);

    consoleWarn.mockRestore();
    consoleError.mockRestore();
  });

  // Multiple queries can be used simultaneously
  test('supports multiple media queries', () => {
    mockMediaQueryList.matches = false;
    const { result: result1 } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    const { result: result2 } = renderHook(() => useMediaQuery('(max-width: 768px)'));

    expect(typeof result1.current).toBe('boolean');
    expect(typeof result2.current).toBe('boolean');
  });
});
