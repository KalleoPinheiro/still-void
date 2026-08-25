import { cx } from './cx';

/**
 * Shell recipes: Header, Logo, Footer.
 * Recipes are pure functions returning class strings — no DOM, no framework.
 * Safe in Next.js Server Components; usable via [class] in Angular, :class in Vue.
 */

export interface HeaderOptions {
  /** Frosted glass background (sticky headers). */
  glass?: boolean;
}

export function header(options: HeaderOptions = {}): string {
  return cx('sv-header', options.glass !== false && 'sv-glass');
}

export const headerClasses = {
  nav: 'sv-header__nav',
  /** Wraps <nav> in a native <details> — collapsible below 640px, a no-op
   * wrapper above it, with zero JavaScript (see DESIGN.md §5 Navigation). */
  navToggle: 'sv-header__nav-toggle',
  navSummary: 'sv-header__nav-summary',
  link: 'sv-header__link',
  linkActive: cx('sv-header__link', 'sv-header__link--active'),
  actions: 'sv-header__actions',
} as const;

export function logo(): string {
  return 'sv-logo';
}

export const logoClasses = {
  dot: 'sv-logo__dot',
} as const;

export function footer(): string {
  return 'sv-footer';
}

export const footerClasses = {
  links: 'sv-footer__links',
  link: 'sv-footer__link',
} as const;
