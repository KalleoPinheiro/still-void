import { cx } from './cx';

/**
 * Article recipes: CodeBlock, Callout, TableOfContents, ReadingProgress,
 * ArticleHeader, Prose. Pure functions — Server Component safe.
 */

export function codeBlock(): string {
  return 'qt-code-block';
}

export const codeBlockClasses = {
  header: 'qt-code-block__header',
  pre: 'qt-code-block__pre',
  copy: 'qt-code-block__copy',
  copyCopied: cx('qt-code-block__copy', 'qt-code-block__copy--copied'),
} as const;

export type CalloutKind = 'note' | 'warn' | 'aha';

export function callout(kind: CalloutKind): string {
  return cx('qt-callout', `qt-callout--${kind}`);
}

export const calloutClasses = {
  label: 'qt-callout__label',
} as const;

export const calloutLabels: Record<CalloutKind, string> = {
  note: 'Note',
  warn: 'Warn',
  aha: 'Aha!',
};

export function tableOfContents(): string {
  return 'qt-toc';
}

export interface TocLinkOptions {
  active?: boolean;
  /** Heading depth, 2 (h2) or 3 (h3). Depth 3 indents. */
  depth?: 2 | 3;
}

export function tocLink(options: TocLinkOptions = {}): string {
  return cx(
    'qt-toc__link',
    options.active && 'qt-toc__link--active',
    options.depth === 3 && 'qt-toc__link--depth-3',
  );
}

export function readingProgress(): string {
  return 'qt-reading-progress';
}

export const readingProgressClasses = {
  bar: 'qt-reading-progress__bar',
} as const;

/** CSS var read by `.qt-reading-progress__bar` (0 → 1). */
export const READING_PROGRESS_VAR = '--qt-reading-progress';

export function articleHeader(): string {
  return 'qt-article-header';
}

export const articleHeaderClasses = {
  title: 'qt-article-header__title',
  meta: 'qt-article-header__meta',
  author: 'qt-article-header__author',
} as const;

export function prose(): string {
  return 'qt-prose';
}

export const proseClasses = {
  lead: 'qt-prose__lead',
} as const;
