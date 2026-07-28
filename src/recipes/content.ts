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
    'sv-pill',
    options.interactive && 'sv-pill--interactive',
    options.active && 'sv-pill--active',
  );
}

export const categoryPillClasses = {
  dot: 'sv-pill__dot',
} as const;

export interface PostCardOptions {
  dense?: boolean;
  hover?: boolean;
}

export function postCard(options: PostCardOptions = {}): string {
  return cx(
    'sv-post-card',
    options.dense && 'sv-post-card--dense',
    options.hover !== false && 'sv-card-hover',
  );
}

export const postCardClasses = {
  meta: 'sv-post-card__meta',
  title: 'sv-post-card__title',
  excerpt: 'sv-post-card__excerpt',
} as const;

export function featuredPostCard(): string {
  return cx('sv-featured-card', 'sv-gradient-border', 'sv-card-hover');
}

export const featuredPostCardClasses = {
  body: 'sv-featured-card__body',
  title: 'sv-featured-card__title',
  visual: 'sv-featured-card__visual',
} as const;

export function postGrid(): string {
  return 'sv-post-grid';
}

export interface LayoutOptions {
  withSidebar?: boolean;
}

export function layout(options: LayoutOptions = {}): string {
  return cx('sv-layout', options.withSidebar && 'sv-layout--with-sidebar');
}

export function sidebar(): string {
  return 'sv-sidebar';
}

export const sidebarClasses = {
  sectionTitle: 'sv-sidebar__section-title',
} as const;

export function hero(): string {
  return 'sv-hero';
}

export const heroClasses = {
  eyebrow: 'sv-hero__eyebrow',
  title: 'sv-hero__title',
  description: 'sv-hero__description',
} as const;

export interface SkeletonOptions {
  small?: boolean;
}

export function skeletonLine(options: SkeletonOptions = {}): string {
  return cx('sv-skeleton', 'sv-skeleton-line', options.small && 'sv-skeleton-line--sm');
}

export function cardSkeleton(): string {
  return 'sv-card-skeleton';
}
