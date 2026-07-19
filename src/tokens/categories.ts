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

/** Resolve an accent name or raw CSS color to a CSS color value. */
export function resolveAccentColor(color: AccentName | (string & {})): string {
  return color in accents ? accents[color as AccentName] : color;
}

/** Resolve a category name, accent name, or raw CSS color to a CSS color value. */
export function resolveCategoryColor(
  color: CategoryName | AccentName | (string & {}),
): string {
  if (color in defaultCategoryColors) {
    return accents[defaultCategoryColors[color as CategoryName]];
  }
  return resolveAccentColor(color);
}
