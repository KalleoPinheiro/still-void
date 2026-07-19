import type { AccentName } from './tokens/colors';
import type { CategoryName } from './tokens/categories';

/** Data shape consumed by PostCard / FeaturedPostCard. The library never ships mock data. */
export interface PostSummary {
  title: string;
  href: string;
  excerpt?: string;
  date?: string;
  readMinutes?: number;
  category?: {
    label: string;
    /** Accent token name, known category, or any CSS color. */
    color?: AccentName | CategoryName | (string & {});
  };
}

export interface TocItem {
  id: string;
  label: string;
  depth?: 2 | 3;
}

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}
