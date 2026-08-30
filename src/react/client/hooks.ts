import { useEffect, useSyncExternalStore, useState } from 'react';
import { createMediaQuery } from '../../behaviors/mediaQuery';
import { createReadingProgress } from '../../behaviors/readingProgress';
import { createScrollSpy } from '../../behaviors/scrollSpy';

/** Reports which heading id is currently active while scrolling. */
export function useScrollSpy(ids: readonly string[], rootMargin?: string): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const key = ids.join('|');

  useEffect(() => {
    const spy = createScrollSpy(ids, { onChange: setActiveId, rootMargin });
    return () => spy.destroy();
    // `key` captures ids content; the array identity itself may change per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, rootMargin]);

  return activeId;
}

/**
 * Reading progress of the page (or target element), in [0, 1].
 *
 * The visual bar is driven by the `--sv-reading-progress` CSS var (written on
 * every rAF-throttled scroll tick regardless of this hook), so React state
 * only needs to update when the *reported* value's bucket changes — not on
 * every scroll frame. `step` sets the bucket size; the default (1, i.e. only
 * the 0 and 1 buckets) keeps re-renders to a couple per page for consumers
 * that don't need the numeric value, while `announce` on `<ReadingProgress>`
 * passes 0.1 for a coarse 10%-step live value.
 */
export function useReadingProgress(target?: HTMLElement | null, step = 1): number {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const progress = createReadingProgress({
      target: target ?? undefined,
      onChange: (value) => {
        const bucket = step > 0 ? Math.round(value / step) * step : value;
        setPercent((prev) => (prev === bucket ? prev : bucket));
      },
    });
    return () => progress.destroy();
  }, [target, step]);

  return percent;
}

/**
 * Check if a media query matches, with safe SSR hydration.
 *
 * Uses `useSyncExternalStore` to provide a server snapshot (desktop/false) that
 * matches during hydration without warnings. After hydration, reflects the true
 * client-side media query state.
 *
 * @param query - Media query string, e.g. `'(min-width: 1024px)'`
 * @returns boolean indicating if the media query matches
 *
 * @example
 * const isMobile = !useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query: string): boolean {
  const mq = useSyncExternalStore(
    // subscribe: attach listener and return unsubscribe
    (onStoreChange) => {
      const mediaQuery = createMediaQuery(query);
      const unsubscribe = mediaQuery.subscribe(onStoreChange);
      return () => {
        unsubscribe();
        mediaQuery.destroy();
      };
    },
    // getSnapshot: return current state (after hydration)
    () => {
      const mediaQuery = createMediaQuery(query);
      const matches = mediaQuery.getSnapshot();
      mediaQuery.destroy();
      return matches;
    },
    // getServerSnapshot: return initial state during SSR (desktop/false)
    // R5-01 AC-4: SSR returns false without error
    () => false,
  );

  return mq;
}
