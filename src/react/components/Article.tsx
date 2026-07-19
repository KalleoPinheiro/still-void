import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cx } from '../../recipes/cx';
import {
  articleHeader,
  articleHeaderClasses,
  callout,
  calloutClasses,
  calloutLabels,
  codeBlock,
  codeBlockClasses,
  prose,
  proseClasses,
  type CalloutKind,
} from '../../recipes/article';

/*
 * Article components are Server Component safe.
 * Interactive pieces (copy button, scroll spy) live in the client entry
 * and are composed in via slots.
 */

export interface CodeBlockProps extends ComponentPropsWithoutRef<'figure'> {
  /** Raw source shown when `rendered` is absent. */
  code: string;
  language?: string;
  filename?: string;
  /**
   * Pre-highlighted markup (e.g. Shiki output rendered on the server).
   * The prototype's regex tokenizer was demo-only and is intentionally
   * not part of the library.
   */
  rendered?: ReactNode;
  /** Header slot — pass <CopyButton code={code} /> from the client entry. */
  actions?: ReactNode;
}

export function CodeBlock({
  code,
  language,
  filename,
  rendered,
  actions,
  className,
  ...rest
}: CodeBlockProps) {
  return (
    <figure className={cx(codeBlock(), className)} {...rest}>
      <figcaption className={codeBlockClasses.header}>
        <span>{filename ?? language ?? 'code'}</span>
        {actions}
      </figcaption>
      <pre className={codeBlockClasses.pre}>
        {rendered ?? <code>{code}</code>}
      </pre>
    </figure>
  );
}

export interface CalloutProps extends ComponentPropsWithoutRef<'aside'> {
  kind: CalloutKind;
  /** Override the default kind label. */
  label?: string;
}

export function Callout({ kind, label, className, children, ...rest }: CalloutProps) {
  return (
    <aside className={cx(callout(kind), className)} {...rest}>
      <span className={calloutClasses.label}>{label ?? calloutLabels[kind]}</span>
      <div>{children}</div>
    </aside>
  );
}

export interface ArticleHeaderProps extends ComponentPropsWithoutRef<'header'> {
  title: string;
  author?: string;
  date?: string;
  readMinutes?: number;
  /** Slot above the title — usually a <CategoryPill />. */
  eyebrow?: ReactNode;
}

export function ArticleHeader({
  title,
  author,
  date,
  readMinutes,
  eyebrow,
  className,
  ...rest
}: ArticleHeaderProps) {
  return (
    <header className={cx(articleHeader(), className)} {...rest}>
      {eyebrow}
      <h1 className={articleHeaderClasses.title}>{title}</h1>
      {(author || date || readMinutes !== undefined) && (
        <div className={articleHeaderClasses.meta}>
          {author && <span className={articleHeaderClasses.author}>{author}</span>}
          {date && <span>{date}</span>}
          {readMinutes !== undefined && <span>{readMinutes} min</span>}
        </div>
      )}
    </header>
  );
}

export interface ProseProps extends ComponentPropsWithoutRef<'div'> {}

/** Typography wrapper for article/MDX content. */
export function Prose({ className, ...rest }: ProseProps) {
  return <div className={cx(prose(), className)} {...rest} />;
}

export interface LeadProps extends ComponentPropsWithoutRef<'p'> {}

/** Lead paragraph inside <Prose>. */
export function Lead({ className, ...rest }: LeadProps) {
  return <p className={cx(proseClasses.lead, className)} {...rest} />;
}
