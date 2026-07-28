/**
 * Still Void typography tokens.
 * Families are fixed by the spec: Sora (display), Manrope (body), JetBrains Mono (code).
 * System fallbacks are loading fallbacks only — the final family must be the correct one.
 */
export const fontFamilies = {
  display: "'Sora', ui-sans-serif, system-ui, sans-serif",
  body: "'Manrope', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace",
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const fontSizes = {
  xs: '0.75rem', //   12px — meta, pills
  sm: '0.8125rem', // 13px — captions, code
  base: '0.9375rem', // 15px — body
  md: '1rem', //      16px — lead paragraphs
  lg: '1.125rem', //  18px — article lead
  xl: '1.375rem', //  22px — card titles, h3
  '2xl': '1.75rem', // 28px — h2
  '3xl': '2.25rem', // 36px — article title
  '4xl': '2.75rem', // 44px — hero display
} as const;

export const lineHeights = {
  tight: 1.15,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.7,
} as const;

export const letterSpacings = {
  display: '-0.02em',
  normal: '0',
  wide: '0.08em',
} as const;

export type FontFamily = keyof typeof fontFamilies;
export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
