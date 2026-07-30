/**
 * Still Void color tokens.
 * Values ported literally from the Still Void spec (blog.kalleopinheiro.dev).
 * Do not round or "approximate" — fidelity rule.
 */
export const colors = {
  dark: {
    bg: '#0A0A0C',
    bgElev: '#111114',
    surface: '#16161B',
    surface2: '#1C1C22',
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.14)',
    text: '#EDEDF0',
    text2: '#8B8B96',
    // Corrected from #5A5A66 (~2.6:1 on surface) to meet WCAG AA 4.5:1 — text3 is used for
    // real copy (metadata, TOC links), not decoration, so it must be readable, not just muted.
    text3: '#83838F',
  },
  light: {
    bg: '#F7F7F5',
    bgElev: '#FFFFFF',
    surface: '#FFFFFF',
    surface2: '#F2F2EF',
    border: 'rgba(0,0,0,0.08)',
    borderStrong: 'rgba(0,0,0,0.14)',
    text: '#16161B',
    text2: '#5A5A66',
    // Corrected from #8B8B96 (~3.1:1 on white) to meet WCAG AA 4.5:1, same reasoning as dark.
    // A further step from #6F6F78 to #6D6D76: the first fix cleared white/paper (≥4.7:1) but
    // was only ~4.44:1 against surface2 (#F2F2EF), the darkest of the light surfaces — still a
    // failure. Verified against bg/bgElev/surface/surface2 together, not just one background.
    text3: '#6D6D76',
  },
} as const;

export const accents = {
  cyan: 'oklch(0.78 0.12 210)',
  violet: 'oklch(0.72 0.14 295)',
  mint: 'oklch(0.78 0.10 160)',
  amber: 'oklch(0.78 0.12 75)',
} as const;

/**
 * Text/UI-safe accent variants ("ink"). `accents` above is tuned for surface use
 * (dots, gradient border, progress bar) and fails WCAG AA as text on light
 * backgrounds (e.g. cyan is ~1.8:1 on white). These preserve the dark-mode
 * values (already ≥6.9:1) and darken each hue for light mode to clear 4.5:1
 * against both light surfaces. Used anywhere the accent colors text: prose
 * links, active TOC state, callout labels, hero eyebrow, copy-success, focus ring.
 */
export const accentsInk = {
  dark: {
    cyan: 'oklch(0.78 0.12 210)',
    violet: 'oklch(0.72 0.14 295)',
    mint: 'oklch(0.78 0.10 160)',
    amber: 'oklch(0.78 0.12 75)',
  },
  light: {
    cyan: 'oklch(0.525 0.09 210)',
    violet: 'oklch(0.545 0.14 295)',
    mint: 'oklch(0.52 0.1 160)',
    amber: 'oklch(0.535 0.11 75)',
  },
} as const;

/**
 * Semantic state colors — independent of the switchable `accent`, so a
 * consumer picking `data-accent="amber"` never collides a warning with the
 * site accent. Fixed per meaning in both surface and text/UI ("ink") forms,
 * same split as `accents`/`accentsInk`.
 */
export const semantic = {
  dark: {
    danger: 'oklch(0.68 0.19 25)',
    success: 'oklch(0.75 0.15 150)',
    info: 'oklch(0.78 0.12 210)',
    warning: 'oklch(0.78 0.12 75)',
  },
  light: {
    danger: 'oklch(0.68 0.19 25)',
    success: 'oklch(0.75 0.15 150)',
    info: 'oklch(0.78 0.12 210)',
    warning: 'oklch(0.78 0.12 75)',
  },
} as const;

export const semanticInk = {
  dark: {
    danger: 'oklch(0.68 0.19 25)',
    success: 'oklch(0.75 0.15 150)',
    info: 'oklch(0.78 0.12 210)',
    warning: 'oklch(0.78 0.12 75)',
  },
  light: {
    danger: 'oklch(0.555 0.19 25)',
    success: 'oklch(0.515 0.14 150)',
    info: 'oklch(0.525 0.09 210)',
    warning: 'oklch(0.535 0.11 75)',
  },
} as const;

export type ThemeMode = keyof typeof colors;
export type AccentName = keyof typeof accents;
export type ColorScheme = (typeof colors)[ThemeMode];
export type SemanticName = keyof (typeof semantic)['dark'];

export const themeModes = Object.keys(colors) as ThemeMode[];
export const accentNames = Object.keys(accents) as AccentName[];

export const DEFAULT_MODE: ThemeMode = 'dark';
export const DEFAULT_ACCENT: AccentName = 'cyan';
