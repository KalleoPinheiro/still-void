export interface ScrollSpyOptions {
  /** Called whenever the active heading changes. `null` when none is visible. */
  onChange: (activeId: string | null) => void;
  /** Forwarded to IntersectionObserver. Default biases toward the reading line. */
  rootMargin?: string;
  threshold?: number | number[];
}

export interface ScrollSpy {
  destroy: () => void;
}

/**
 * Watches headings by id and reports which one is active.
 * Framework-agnostic core used by the React TableOfContents.
 */
export function createScrollSpy(ids: readonly string[], options: ScrollSpyOptions): ScrollSpy {
  const visible = new Map<string, number>();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.set(entry.target.id, entry.intersectionRatio);
        } else {
          visible.delete(entry.target.id);
        }
      }
      // First visible id in document order wins.
      const active = ids.find((id) => visible.has(id)) ?? null;
      options.onChange(active);
    },
    {
      rootMargin: options.rootMargin ?? '0px 0px -70% 0px',
      threshold: options.threshold ?? 0,
    },
  );

  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  }

  return {
    destroy: () => observer.disconnect(),
  };
}
