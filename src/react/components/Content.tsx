import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { cx } from '../../recipes/cx';
import {
  cardSkeleton,
  categoryPill,
  categoryPillClasses,
  featuredPostCard,
  featuredPostCardClasses,
  hero,
  heroClasses,
  layout,
  postCard,
  postCardClasses,
  postGrid,
  sidebar,
  sidebarClasses,
  skeletonLine,
} from '../../recipes/content';
import { resolveCategoryColor } from '../../tokens/categories';
import type { PostSummary } from '../../types';

/* All components in this file are Server Component safe. */

export interface CategoryPillProps extends ComponentPropsWithoutRef<'span'> {
  label: string;
  /** Accent name ('cyan'), category name ('ia'), or any CSS color. */
  color?: string;
  active?: boolean;
}

export function CategoryPill({ label, color, active, className, style, ...rest }: CategoryPillProps) {
  const pillStyle: CSSProperties | undefined = color
    ? ({ ...style, '--qt-pill-color': resolveCategoryColor(color) } as CSSProperties)
    : style;
  return (
    <span className={cx(categoryPill({ active }), className)} style={pillStyle} {...rest}>
      <span className={categoryPillClasses.dot} aria-hidden="true" />
      {label}
    </span>
  );
}

function PostMeta({ post }: { post: PostSummary }) {
  if (!post.category && !post.date && post.readMinutes === undefined) return null;
  return (
    <div className={postCardClasses.meta}>
      {post.category && <CategoryPill label={post.category.label} color={post.category.color} />}
      {post.date && <span>{post.date}</span>}
      {post.readMinutes !== undefined && <span>{post.readMinutes} min</span>}
    </div>
  );
}

export interface PostCardProps extends ComponentPropsWithoutRef<'article'> {
  post: PostSummary;
  dense?: boolean;
}

export function PostCard({ post, dense, className, children, ...rest }: PostCardProps) {
  return (
    <article className={cx(postCard({ dense }), className)} {...rest}>
      <PostMeta post={post} />
      <h3 className={postCardClasses.title}>
        <a href={post.href}>{post.title}</a>
      </h3>
      {!dense && post.excerpt && <p className={postCardClasses.excerpt}>{post.excerpt}</p>}
      {children}
    </article>
  );
}

export interface FeaturedPostCardProps extends ComponentPropsWithoutRef<'article'> {
  post: PostSummary;
  /** Custom visual slot (illustration, image). */
  visual?: ReactNode;
}

export function FeaturedPostCard({ post, visual, className, children, ...rest }: FeaturedPostCardProps) {
  return (
    <article className={cx(featuredPostCard(), className)} {...rest}>
      <div className={featuredPostCardClasses.body}>
        <PostMeta post={post} />
        <h2 className={featuredPostCardClasses.title}>
          <a href={post.href}>{post.title}</a>
        </h2>
        {post.excerpt && <p className={postCardClasses.excerpt}>{post.excerpt}</p>}
        {children}
      </div>
      {visual && <div className={featuredPostCardClasses.visual}>{visual}</div>}
    </article>
  );
}

export interface PostGridProps extends ComponentPropsWithoutRef<'div'> {}

export function PostGrid({ className, ...rest }: PostGridProps) {
  return <div className={cx(postGrid(), className)} {...rest} />;
}

export interface LayoutProps extends ComponentPropsWithoutRef<'div'> {
  withSidebar?: boolean;
}

export function Layout({ withSidebar, className, ...rest }: LayoutProps) {
  return <div className={cx(layout({ withSidebar }), className)} {...rest} />;
}

export interface SidebarProps extends ComponentPropsWithoutRef<'aside'> {}

export function Sidebar({ className, ...rest }: SidebarProps) {
  return <aside className={cx(sidebar(), className)} {...rest} />;
}

export interface SidebarSectionProps extends ComponentPropsWithoutRef<'section'> {
  title: string;
}

export function SidebarSection({ title, children, ...rest }: SidebarSectionProps) {
  return (
    <section {...rest}>
      <h4 className={sidebarClasses.sectionTitle}>{title}</h4>
      {children}
    </section>
  );
}

export interface HeroProps extends ComponentPropsWithoutRef<'section'> {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function Hero({ eyebrow, title, description, className, children, ...rest }: HeroProps) {
  return (
    <section className={cx(hero(), className)} {...rest}>
      {eyebrow && <span className={heroClasses.eyebrow}>{eyebrow}</span>}
      <h1 className={heroClasses.title}>{title}</h1>
      {description && <p className={heroClasses.description}>{description}</p>}
      {children}
    </section>
  );
}

export interface SkeletonProps extends ComponentPropsWithoutRef<'div'> {
  small?: boolean;
}

export function Skeleton({ small, className, ...rest }: SkeletonProps) {
  return <div className={cx(skeletonLine({ small }), className)} aria-hidden="true" {...rest} />;
}

export function CardSkeleton({ className, ...rest }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cx(cardSkeleton(), className)} aria-hidden="true" {...rest}>
      <Skeleton small />
      <Skeleton />
      <Skeleton />
    </div>
  );
}
