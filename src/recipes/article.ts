import { cx } from './cx';

/**
 * Article recipes: CodeBlock, Callout, TableOfContents, ReadingProgress,
 * ArticleHeader, Prose. Pure functions — Server Component safe.
 */

export function codeBlock(): string {
  return 'sv-code-block';
}

export const codeBlockClasses = {
  header: 'sv-code-block__header',
  pre: 'sv-code-block__pre',
  copy: 'sv-code-block__copy',
  copyCopied: cx('sv-code-block__copy', 'sv-code-block__copy--copied'),
} as const;

export type CalloutKind = 'note' | 'warn' | 'aha';

export function callout(kind: CalloutKind): string {
  return cx('sv-callout', `sv-callout--${kind}`);
}

export const calloutClasses = {
  label: 'sv-callout__label',
} as const;

export const calloutLabels: Record<CalloutKind, string> = {
  note: 'Note',
  warn: 'Warn',
  aha: 'Aha!',
};

export function tableOfContents(): string {
  return 'sv-toc';
}

export interface TocLinkOptions {
  active?: boolean;
  /** Heading depth, 2 (h2) or 3 (h3). Depth 3 indents. */
  depth?: 2 | 3;
}

export function tocLink(options: TocLinkOptions = {}): string {
  return cx(
    'sv-toc__link',
    options.active && 'sv-toc__link--active',
    options.depth === 3 && 'sv-toc__link--depth-3',
  );
}

export function readingProgress(): string {
  return 'sv-reading-progress';
}

export const readingProgressClasses = {
  bar: 'sv-reading-progress__bar',
} as const;

/** CSS var read by `.sv-reading-progress__bar` (0 → 1). */
export const READING_PROGRESS_VAR = '--sv-reading-progress';

export function articleHeader(): string {
  return 'sv-article-header';
}

export const articleHeaderClasses = {
  title: 'sv-article-header__title',
  meta: 'sv-article-header__meta',
  author: 'sv-article-header__author',
} as const;

export function prose(): string {
  return 'sv-prose';
}

export const proseClasses = {
  lead: 'sv-prose__lead',
} as const;
