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
  return cx('qt-header', options.glass !== false && 'qt-glass');
}

export const headerClasses = {
  nav: 'qt-header__nav',
  link: 'qt-header__link',
  linkActive: cx('qt-header__link', 'qt-header__link--active'),
  actions: 'qt-header__actions',
} as const;

export function logo(): string {
  return 'qt-logo';
}

export const logoClasses = {
  dot: 'qt-logo__dot',
} as const;

export function footer(): string {
  return 'qt-footer';
}

export const footerClasses = {
  links: 'qt-footer__links',
  link: 'qt-footer__link',
} as const;
