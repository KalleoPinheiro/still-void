import type { ComponentPropsWithoutRef } from 'react';
import { cx } from '../../recipes/cx';
import { readingProgress, readingProgressClasses } from '../../recipes/article';
import { useReadingProgress } from './hooks';

export interface ReadingProgressProps extends ComponentPropsWithoutRef<'div'> {
  /** Element whose scroll extent defines 100%. Defaults to the document. */
  target?: HTMLElement | null;
  /**
   * Expose progress to assistive tech as a live `role="progressbar"`,
   * updated in coarse 10% steps. Off by default: the bar is a visual aid for
   * a value the user already has (their own scroll position), and a value
   * that changes continuously during scroll would otherwise spam screen
   * readers with `aria-valuenow` updates.
   */
  announce?: boolean;
}

/**
 * Fixed top progress bar. Motion is linear by spec. The fill is driven by
 * the `--sv-reading-progress` CSS var (see style.css), not React state, so
 * scrolling doesn't re-render this component on every frame.
 */
export function ReadingProgress({ target, announce, className, ...rest }: ReadingProgressProps) {
  const percent = useReadingProgress(target, announce ? 0.1 : 1);
  const a11yProps = announce
    ? {
        role: 'progressbar' as const,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': Math.round(percent * 100),
        'aria-label': 'Reading progress',
      }
    : { 'aria-hidden': true as const };

  return (
    <div className={cx(readingProgress(), className)} {...a11yProps} {...rest}>
      <div className={readingProgressClasses.bar} />
    </div>
  );
}
