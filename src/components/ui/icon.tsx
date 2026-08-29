import * as React from 'react';
import { cn } from '../../lib/utils';
import { ICON_FALLBACK_NAME, ICON_GLYPHS, type IconName } from './icon-set';

export type { IconName };

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  name: IconName;
  /** `md` is the default and carries no modifier — the base class is the size. */
  size?: 'sm' | 'md' | 'lg';
  /** Present: the icon is announced. Absent: it stays decorative. */
  label?: string;
}

/**
 * The design system's icon (ICON-01..06).
 *
 * Server-safe by construction: no hook, no context, no client boundary —
 * heroicons is a plain forwardRef <svg> and this adds only class names, so
 * `Icon` renders inside a Next.js Server Component (AD-002, AD-013).
 *
 * Size is deliberately NOT a prop on the svg: heroicons emits no width/height
 * attribute, so `.sv-icon` is the only thing sizing it, and a consumer cannot
 * pull an icon off the token scale by passing a pixel value.
 */
const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 'md', label, className, ...props }, ref) => {
    // A name outside the union only reaches here from JS, JSON or a CMS —
    // places the compiler never saw. Falling back beats throwing: a wrong
    // icon is a visible defect, a thrown error is a blank page.
    const Glyph = ICON_GLYPHS[name] ?? ICON_GLYPHS[ICON_FALLBACK_NAME];

    return (
      <Glyph
        {...props}
        ref={ref}
        data-icon-name={name}
        className={cn(
          'sv-icon',
          size === 'sm' && 'sv-icon--sm',
          size === 'lg' && 'sv-icon--lg',
          className,
        )}
        // Spread before, not after: whether the icon is announced is
        // controlled by `label`, not by a stray aria-hidden/role/aria-label
        // the caller passed through `...props` — those must not be able to
        // override the mode `label` selected. (Heroicons itself still
        // spreads ITS own default aria-hidden under what we pass here, so
        // aria-hidden={undefined} below is still what removes it when a
        // label is present.)
        aria-hidden={label === undefined ? 'true' : undefined}
        role={label === undefined ? undefined : 'img'}
        aria-label={label}
      />
    );
  },
);
Icon.displayName = 'Icon';

export { Icon };
