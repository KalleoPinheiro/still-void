/**
 * Source external state (media query match) for React's useSyncExternalStore.
 * Framework-agnostic core used by useMediaQuery.
 */

export interface MediaQueryController {
  /** Get current media query match state. */
  getSnapshot(): boolean;
  /** Subscribe to changes. Returns unsubscribe function. */
  subscribe(listener: () => void): () => void;
  /** Cleanup: remove all listeners. */
  destroy(): void;
}

/**
 * Create a media query controller that notifies listeners on transitions.
 * If matchMedia is unavailable, returns an inert controller (always false, subscribe is no-op).
 *
 * @example
 * const mq = createMediaQuery('(min-width: 1024px)');
 * const unsubscribe = mq.subscribe(() => console.log('changed'));
 * console.log(mq.getSnapshot()); // boolean
 * unsubscribe();
 * mq.destroy();
 */
export function createMediaQuery(query: string): MediaQueryController {
  // Fallback if matchMedia is not available (e.g., jsdom without stub)
  if (typeof window === 'undefined' || !window.matchMedia) {
    return {
      getSnapshot: () => false,
      subscribe: () => () => {}, // no-op unsubscribe
      destroy: () => {}, // no-op
    };
  }

  const mql = window.matchMedia(query);
  const listeners: (() => void)[] = [];
  let currentMatches = mql.matches;
  let attached = false;

  // Unified handler for both addEventListener and addListener (deprecated)
  const handleChange = () => {
    const newMatches = mql.matches;
    // Only notify if there's an actual transition
    if (newMatches !== currentMatches) {
      currentMatches = newMatches;
      // Notify all listeners
      for (const listener of listeners) {
        listener();
      }
    }
  };

  const attachListener = () => {
    if (attached) return;
    attached = true;

    // Use addEventListener (modern) with fallback to addListener (deprecated)
    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange);
    } else if (mql.addListener) {
      // Fallback for older browsers
      mql.addListener(handleChange as any);
    }
  };

  const detachListener = () => {
    if (!attached) return;
    attached = false;

    if (mql.removeEventListener) {
      mql.removeEventListener('change', handleChange);
    } else if (mql.removeListener) {
      // Fallback for older browsers
      mql.removeListener(handleChange as any);
    }
  };

  return {
    getSnapshot: () => mql.matches,

    subscribe: (listener: () => void) => {
      listeners.push(listener);
      attachListener();

      // Return unsubscribe function
      return () => {
        const index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
        }

        // Detach if no more listeners
        if (listeners.length === 0) {
          detachListener();
        }
      };
    },

    destroy: () => {
      listeners.length = 0;
      detachListener();
    },
  };
}
