import { READING_PROGRESS_VAR } from '../recipes/article';

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

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });

  return {
    getPercent: () => percent,
    destroy() {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    },
  };
}
