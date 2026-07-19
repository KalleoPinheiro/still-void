import { useEffect, useState } from 'react';
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

/** Reading progress of the page (or target element), in [0, 1]. */
export function useReadingProgress(target?: HTMLElement | null): number {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const progress = createReadingProgress({
      target: target ?? undefined,
      onChange: setPercent,
    });
    return () => progress.destroy();
  }, [target]);

  return percent;
}
