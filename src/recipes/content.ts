import { cx } from './cx';

/**
 * Content recipes: CategoryPill, PostCard, FeaturedPostCard, PostGrid,
 * Sidebar, Hero, Skeleton. Pure functions — Server Component safe.
 */

export interface CategoryPillOptions {
  interactive?: boolean;
  active?: boolean;
}

export function categoryPill(options: CategoryPillOptions = {}): string {
  return cx(
    'qt-pill',
    options.interactive && 'qt-pill--interactive',
    options.active && 'qt-pill--active',
  );
}

export const categoryPillClasses = {
  dot: 'qt-pill__dot',
} as const;

export interface PostCardOptions {
  dense?: boolean;
  hover?: boolean;
}

export function postCard(options: PostCardOptions = {}): string {
  return cx(
    'qt-post-card',
    options.dense && 'qt-post-card--dense',
    options.hover !== false && 'qt-card-hover',
  );
}

export const postCardClasses = {
  meta: 'qt-post-card__meta',
  title: 'qt-post-card__title',
  excerpt: 'qt-post-card__excerpt',
} as const;

export function featuredPostCard(): string {
  return cx('qt-featured-card', 'qt-gradient-border', 'qt-card-hover');
}

export const featuredPostCardClasses = {
  body: 'qt-featured-card__body',
  title: 'qt-featured-card__title',
  visual: 'qt-featured-card__visual',
} as const;

export function postGrid(): string {
  return 'qt-post-grid';
}

export interface LayoutOptions {
  withSidebar?: boolean;
}

export function layout(options: LayoutOptions = {}): string {
  return cx('qt-layout', options.withSidebar && 'qt-layout--with-sidebar');
}

export function sidebar(): string {
  return 'qt-sidebar';
}

export const sidebarClasses = {
  sectionTitle: 'qt-sidebar__section-title',
} as const;

export function hero(): string {
  return 'qt-hero';
}

export const heroClasses = {
  eyebrow: 'qt-hero__eyebrow',
  title: 'qt-hero__title',
  description: 'qt-hero__description',
} as const;

export interface SkeletonOptions {
  small?: boolean;
}

export function skeletonLine(options: SkeletonOptions = {}): string {
  return cx('qt-skeleton', 'qt-skeleton-line', options.small && 'qt-skeleton-line--sm');
}

export function cardSkeleton(): string {
  return 'qt-card-skeleton';
}
