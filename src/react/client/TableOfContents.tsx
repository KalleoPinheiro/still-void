import { useMemo, type ComponentPropsWithoutRef } from 'react';
import { cx } from '../../recipes/cx';
import { tableOfContents, tocLink } from '../../recipes/article';
import type { TocItem } from '../../types';
import { useScrollSpy } from './hooks';

export interface TableOfContentsProps extends ComponentPropsWithoutRef<'nav'> {
  items: TocItem[];
  /** IntersectionObserver rootMargin override. */
  rootMargin?: string;
}

/** Article table of contents with scroll-spy active state. */
export function TableOfContents({ items, rootMargin, className, ...rest }: TableOfContentsProps) {
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const activeId = useScrollSpy(ids, rootMargin);

  return (
    <nav className={cx(tableOfContents(), className)} aria-label="Table of contents" {...rest}>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={tocLink({ active: item.id === activeId, depth: item.depth })}
          aria-current={item.id === activeId ? 'true' : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
