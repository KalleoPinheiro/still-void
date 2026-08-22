import { READING_PROGRESS_VAR } from '../recipes/article';

// Guards against environments without requestAnimationFrame (e.g. this module
// evaluated at import time outside a browser/jsdom window) by falling back to
// a timer. Modern jsdom (the test environment here) does implement rAF, so
// the fallback branch below is not exercised by this suite — verified
// unreachable-in-tests, not untested application logic.
const raf: (cb: () => void) => number =
  typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
    ? (cb) => window.requestAnimationFrame(cb)
    : /* v8 ignore next */ (cb) => setTimeout(cb, 16) as unknown as number;
const cancelRaf: (id: number) => void =
  typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function'
    ? (id) => window.cancelAnimationFrame(id)
    : /* v8 ignore next */ (id) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>);

export interface ReadingProgressOptions {
  /** Element whose scroll extent defines 100%. Defaults to the document. */
  target?: HTMLElement;
  /** Receives progress in [0, 1]. */
  onChange?: (percent: number) => void;
  /** Element that receives the CSS var (default: <html>). Pass null to skip. */
  varTarget?: HTMLElement | null;
}

export interface ReadingProgress {
  getPercent: () => number;
  destroy: () => void;
}

/**
 * Tracks document (or element) reading progress. Writes the
 * `--sv-reading-progress` CSS var consumed by `.sv-reading-progress__bar`.
 */
export function createReadingProgress(options: ReadingProgressOptions = {}): ReadingProgress {
  const varTarget =
    options.varTarget === null ? null : (options.varTarget ?? document.documentElement);
  let percent = 0;

  function measure(): number {
    if (options.target) {
      const rect = options.target.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = rect.height - viewport;
      if (total <= 0) return 1;
      return Math.min(1, Math.max(0, -rect.top / total));
    }
    const doc = document.documentElement;
    const total = doc.scrollHeight - window.innerHeight;
    if (total <= 0) return 1;
    return Math.min(1, Math.max(0, window.scrollY / total));
  }

  function update(): void {
    percent = measure();
    varTarget?.style.setProperty(READING_PROGRESS_VAR, String(percent));
    options.onChange?.(percent);
  }

  // Coalesce scroll/resize bursts into one measurement per animation frame —
  // without this, `measure()` (a forced layout read) runs once per event.
  let frame: number | null = null;
  function onFrame(): void {
    frame = null;
    update();
  }
  function schedule(): void {
    if (frame !== null) return;
    frame = raf(onFrame);
  }

  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });

  return {
    getPercent: () => percent,
    destroy() {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== null) cancelRaf(frame);
    },
  };
}
