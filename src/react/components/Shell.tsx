import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cx } from '../../recipes/cx';
import { footer, footerClasses, header, headerClasses, logo, logoClasses } from '../../recipes/shell';
import type { NavItem } from '../../types';

/*
 * Shell components are Server Component safe: no hooks, no browser APIs.
 * Interactivity (theme toggle) is composed in via the `actions` slot —
 * pass <ThemeToggle /> from '@still-void/ui/react/client'.
 */

export interface LogoProps extends ComponentPropsWithoutRef<'a'> {
  label: string;
  href?: string;
}

export function Logo({ label, href = '/', className, ...rest }: LogoProps) {
  return (
    <a href={href} className={cx(logo(), className)} {...rest}>
      <span className={logoClasses.dot} aria-hidden="true" />
      {label}
    </a>
  );
}

export interface HeaderProps extends ComponentPropsWithoutRef<'header'> {
  /** Usually a <Logo />. */
  logo?: ReactNode;
  items?: NavItem[];
  /** Right-side slot — theme toggle, search, etc. */
  actions?: ReactNode;
  /** Frosted glass background (default true). */
  glass?: boolean;
}

export function Header({ logo: logoSlot, items = [], actions, glass, className, ...rest }: HeaderProps) {
  return (
    <header className={cx(header({ glass }), className)} {...rest}>
      {logoSlot}
      {items.length > 0 && (
        <nav className={headerClasses.nav}>
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={item.active ? headerClasses.linkActive : headerClasses.link}
              aria-current={item.active ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
      {actions && <div className={headerClasses.actions}>{actions}</div>}
    </header>
  );
}

export interface FooterProps extends ComponentPropsWithoutRef<'footer'> {
  author?: string;
  links?: NavItem[];
  children?: ReactNode;
}

export function Footer({ author, links = [], children, className, ...rest }: FooterProps) {
  return (
    <footer className={cx(footer(), className)} {...rest}>
      {author && <span>{author}</span>}
      {links.length > 0 && (
        <div className={footerClasses.links}>
          {links.map((link) => (
            <a key={link.href} href={link.href} className={footerClasses.link}>
              {link.label}
            </a>
          ))}
        </div>
      )}
      {children}
    </footer>
  );
}
