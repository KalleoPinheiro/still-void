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
    text3: '#5A5A66',
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
    text3: '#8B8B96',
  },
} as const;

export const accents = {
  cyan: 'oklch(0.78 0.12 210)',
  violet: 'oklch(0.72 0.14 295)',
  mint: 'oklch(0.78 0.10 160)',
  amber: 'oklch(0.78 0.12 75)',
} as const;

export type ThemeMode = keyof typeof colors;
export type AccentName = keyof typeof accents;
export type ColorScheme = (typeof colors)[ThemeMode];

export const themeModes = Object.keys(colors) as ThemeMode[];
export const accentNames = Object.keys(accents) as AccentName[];

export const DEFAULT_MODE: ThemeMode = 'dark';
export const DEFAULT_ACCENT: AccentName = 'cyan';
