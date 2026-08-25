import type * as React from 'react';
import {
  Bars3Icon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DocumentDuplicateIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * The curated set behind `Icon` (AD-013).
 *
 * One grade — 24/outline — is the whole family, because size comes from CSS
 * (`.sv-icon`) and mixing grades would mix stroke weights at the same rendered
 * size. Each glyph is a NAMED import from the grade subpath: a namespace import
 * or the package root barrel would pull all ~1200 heroicons into the consumer's
 * bundle instead of the one or two they use.
 *
 * The names are the design system's, not heroicons': `alert-triangle` reads the
 * same whatever library draws it, which is what keeps a future swap of source
 * out of the public API.
 */

export type IconName =
  | 'x'
  | 'check'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-right'
  | 'chevron-left'
  | 'info'
  | 'alert-triangle'
  | 'alert-circle'
  | 'check-circle'
  | 'copy'
  | 'sun'
  | 'moon'
  | 'search'
  | 'menu';

/** A heroicon: a forwardRef <svg> that takes SVG props and no size prop. */
type GlyphComponent = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> &
    React.RefAttributes<SVGSVGElement>
>;

export const ICON_GLYPHS: Record<IconName, GlyphComponent> = {
  x: XMarkIcon,
  check: CheckIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-right': ChevronRightIcon,
  'chevron-left': ChevronLeftIcon,
  info: InformationCircleIcon,
  'alert-triangle': ExclamationTriangleIcon,
  'alert-circle': ExclamationCircleIcon,
  'check-circle': CheckCircleIcon,
  copy: DocumentDuplicateIcon,
  sun: SunIcon,
  moon: MoonIcon,
  search: MagnifyingGlassIcon,
  menu: Bars3Icon,
};

export const ICON_NAMES = Object.keys(ICON_GLYPHS) as IconName[];

/**
 * What renders when a name outside the union arrives at runtime (ICON-05).
 * `alert-circle` rather than something neutral: an unknown name is a defect in
 * the calling code, and the rendered icon should say so instead of passing for
 * a deliberate choice.
 */
export const ICON_FALLBACK_NAME: IconName = 'alert-circle';
