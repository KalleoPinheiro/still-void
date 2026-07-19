import type { ComponentPropsWithoutRef } from 'react';
import { cx } from '../../recipes/cx';
import { readingProgress, readingProgressClasses } from '../../recipes/article';
import { useReadingProgress } from './hooks';

export interface ReadingProgressProps extends ComponentPropsWithoutRef<'div'> {
  /** Element whose scroll extent defines 100%. Defaults to the document. */
  target?: HTMLElement | null;
}

/** Fixed top progress bar. Motion is linear by spec. */
export function ReadingProgress({ target, className, ...rest }: ReadingProgressProps) {
  const percent = useReadingProgress(target);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent * 100)}
      aria-label="Reading progress"
      className={cx(readingProgress(), className)}
      {...rest}
    >
      <div
        className={readingProgressClasses.bar}
        style={{ transform: `scaleX(${percent})` }}
      />
    </div>
  );
}
