import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { createMediaQuery } from '../src/behaviors/mediaQuery';

describe('createMediaQuery', () => {
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
  });

  // AC-1: getSnapshot(), subscribe(), destroy() interfaces
  test('exposes getSnapshot, subscribe, and destroy methods', () => {
    const mq = createMediaQuery('(min-width: 1024px)');
    expect(typeof mq.getSnapshot).toBe('function');
    expect(typeof mq.subscribe).toBe('function');
    expect(typeof mq.destroy).toBe('function');
  });

  // AC-1: subscribe returns unsubscribe function
  test('subscribe returns an unsubscribe function', () => {
    const mq = createMediaQuery('(min-width: 1024px)');
    const unsubscribe = mq.subscribe(() => {});
    expect(typeof unsubscribe).toBe('function');
  });

  // AC-1: getSnapshot returns boolean matching current media query state
  test('getSnapshot returns current media query match state', () => {
    mockMediaQueryList.matches = false;
    const mq = createMediaQuery('(min-width: 1024px)');
    expect(mq.getSnapshot()).toBe(false);

    mockMediaQueryList.matches = true;
    expect(mq.getSnapshot()).toBe(true);
  });

  // AC-2: Listener notified once per transition (not on every call, only on change)
  test('notifies listener exactly once when media query crosses threshold', () => {
    const mq = createMediaQuery('(min-width: 1024px)');
    const listener = vi.fn();
    mq.subscribe(listener);

    // Simulate transition from false to true
    mockMediaQueryList.matches = true;
    const callback = mediaQueryCallbacks[0];
    if (callback) {
      callback(mockMediaQueryList);
    }

    expect(listener).toHaveBeenCalledTimes(1);

    // Call again with same state — should not notify
    if (callback) {
      callback(mockMediaQueryList);
    }
    expect(listener).toHaveBeenCalledTimes(1);

    // Transition back to false
    mockMediaQueryList.matches = false;
    if (callback) {
      callback(mockMediaQueryList);
    }
    expect(listener).toHaveBeenCalledTimes(2);
  });

  // AC-3: destroy() removes all listeners from MediaQueryList
  test('destroy removes listener from MediaQueryList', () => {
    const mq = createMediaQuery('(min-width: 1024px)');
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    mq.subscribe(listener1);
    mq.subscribe(listener2);

    // Store initial callback count (should be 1: the handleChange)
    const callbackCountBefore = mediaQueryCallbacks.length;
    expect(callbackCountBefore).toBe(1);

    mq.destroy();

    // After destroy, callbacks should be removed
    expect(mediaQueryCallbacks).toHaveLength(0);
  });

  // AC-3: destroy prevents further listener notifications
  test('after destroy, listeners are not called on changes', () => {
    const mq = createMediaQuery('(min-width: 1024px)');
    const listener = vi.fn();
    mq.subscribe(listener);

    mq.destroy();

    mockMediaQueryList.matches = true;
    // Simulate the change event (but there should be no listener attached)
    if (mediaQueryCallbacks.length > 0) {
      const callback = mediaQueryCallbacks[0];
      if (callback) {
        callback(mockMediaQueryList);
      }
    }

    // Listener should not be called since destroy was called
    expect(listener).not.toHaveBeenCalled();
  });

  // AC-6: No matchMedia available → inert controller
  test('without matchMedia, returns inert controller', () => {
    const originalMatchMedia = window.matchMedia;
    delete (window as any).matchMedia;
    try {
      const mq = createMediaQuery('(min-width: 1024px)');

      // getSnapshot() returns false (desktop/no-match fallback)
      expect(mq.getSnapshot()).toBe(false);

      // subscribe() is no-op
      const listener = vi.fn();
      const unsubscribe = mq.subscribe(listener);
      expect(typeof unsubscribe).toBe('function');
      expect(listener).not.toHaveBeenCalled();

      // destroy() is no-op
      expect(() => mq.destroy()).not.toThrow();
    } finally {
      if (originalMatchMedia) {
        (window as any).matchMedia = originalMatchMedia;
      }
    }
  });

  // AC-6: No matchMedia, then try to call unsubscribe
  test('unsubscribe is safe even in inert mode', () => {
    const originalMatchMedia = window.matchMedia;
    delete (window as any).matchMedia;
    try {
      const mq = createMediaQuery('(min-width: 1024px)');
      const unsubscribe = mq.subscribe(() => {});

      expect(() => unsubscribe()).not.toThrow();
    } finally {
      if (originalMatchMedia) {
        (window as any).matchMedia = originalMatchMedia;
      }
    }
  });

  // Multiple listeners can be subscribed
  test('supports multiple subscribers', () => {
    const mq = createMediaQuery('(min-width: 1024px)');
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    mq.subscribe(listener1);
    mq.subscribe(listener2);

    mockMediaQueryList.matches = true;
    const callback = mediaQueryCallbacks[0];
    if (callback) {
      callback(mockMediaQueryList);
    }

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  // Unsubscribe from one listener doesn't affect others
  test('unsubscribe removes only that listener', () => {
    const mq = createMediaQuery('(min-width: 1024px)');
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    const unsubscribe1 = mq.subscribe(listener1);
    mq.subscribe(listener2);

    unsubscribe1();

    mockMediaQueryList.matches = true;
    const callback = mediaQueryCallbacks[0];
    if (callback) {
      callback(mockMediaQueryList);
    }

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  // Cover deprecated addListener fallback (for older browsers)
  test('uses addListener fallback when addEventListener is not available', () => {
    const mockMQL = {
      matches: false,
      addEventListener: undefined,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };

    vi.unstubAllGlobals();
    vi.stubGlobal('matchMedia', () => mockMQL);

    const mq = createMediaQuery('(min-width: 1024px)');
    const listener = vi.fn();
    mq.subscribe(listener);

    expect(mockMQL.addListener).toHaveBeenCalled();
  });

  // Cover deprecated removeListener fallback (for older browsers)
  test('uses removeListener fallback when removeEventListener is not available', () => {
    const mockMQL = {
      matches: false,
      addEventListener: undefined,
      addListener: vi.fn(),
      removeEventListener: undefined,
      removeListener: vi.fn(),
    };

    vi.unstubAllGlobals();
    vi.stubGlobal('matchMedia', () => mockMQL);

    const mq = createMediaQuery('(min-width: 1024px)');
    const listener = vi.fn();
    const unsubscribe = mq.subscribe(listener);
    unsubscribe();

    expect(mockMQL.removeListener).toHaveBeenCalled();
  });

  // Double unsubscribe is safe: calling unsubscribe twice should not error
  test('double unsubscribe is safe and does not affect other listeners', () => {
    const mq = createMediaQuery('(min-width: 1024px)');
    const listenerA = vi.fn();
    const listenerB = vi.fn();

    const unsubscribeA = mq.subscribe(listenerA);
    mq.subscribe(listenerB);

    // Call unsubscribe on A twice
    unsubscribeA();
    expect(() => unsubscribeA()).not.toThrow();

    // Simulate a media query change
    mockMediaQueryList.matches = true;
    const callback = mediaQueryCallbacks[0];
    if (callback) {
      callback(mockMediaQueryList);
    }

    // A should not be called, but B should still work
    expect(listenerA).not.toHaveBeenCalled();
    expect(listenerB).toHaveBeenCalledTimes(1);
  });
});
