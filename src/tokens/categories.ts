import { accents, type AccentName } from './colors';

/**
 * Blog categories from the prototype. Categories render as a colored dot + label
 * (never an emoji). The pill also accepts any CSS color for whitelabel use.
 */
export type CategoryName = 'ia' | 'prompt' | 'dev' | 'arch' | 'ts';

export const defaultCategoryColors: Record<CategoryName, AccentName> = {
  ia: 'violet',
  prompt: 'amber',
  dev: 'mint',
  arch: 'cyan',
  ts: 'cyan',
};

const hasOwn = <T extends object>(obj: T, key: string): key is Extract<keyof T, string> =>
  Object.prototype.hasOwnProperty.call(obj, key);

/** Resolve an accent name or raw CSS color to a CSS color value. */
export function resolveAccentColor(color: AccentName | (string & {})): string {
  return hasOwn(accents, color) ? accents[color] : color;
}

/** Resolve a category name, accent name, or raw CSS color to a CSS color value. */
export function resolveCategoryColor(
  color: CategoryName | AccentName | (string & {}),
): string {
  if (hasOwn(defaultCategoryColors, color)) {
    return accents[defaultCategoryColors[color]];
  }
  return resolveAccentColor(color);
}
