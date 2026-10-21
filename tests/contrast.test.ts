import { describe, expect, test } from 'vitest';
import { colors, accents, accentsInk, semantic, semanticInk, type ThemeMode } from '../src/tokens/colors';
import { contrastRatio, parseColor } from './utils/color';

const AA_TEXT = 4.5;

const surfacesByTheme: Record<ThemeMode, string[]> = {
  dark: [colors.dark.bg, colors.dark.bgElev, colors.dark.surface, colors.dark.surface2],
  light: [colors.light.bg, colors.light.bgElev, colors.light.surface, colors.light.surface2],
};

const TEXT_ROLES = ['text', 'text2', 'text3'] as const;

describe('WCAG AA text contrast — base text ramp', () => {
  for (const theme of ['dark', 'light'] as const) {
    for (const role of TEXT_ROLES) {
      const color = colors[theme][role];
      for (const surface of surfacesByTheme[theme]) {
        test(`${theme} ${role} on ${surface} clears ${AA_TEXT}:1`, () => {
          expect(contrastRatio(color, surface)).toBeGreaterThanOrEqual(AA_TEXT);
        });
      }
    }
  }
});

describe('WCAG AA text contrast — accent "ink" (links, active states, focus ring)', () => {
  for (const theme of ['dark', 'light'] as const) {
    for (const [name, color] of Object.entries(accentsInk[theme])) {
      for (const surface of surfacesByTheme[theme]) {
        test(`${theme} accent-${name}-ink on ${surface} clears ${AA_TEXT}:1`, () => {
          expect(contrastRatio(color, surface)).toBeGreaterThanOrEqual(AA_TEXT);
        });
      }
    }
  }
});

describe('WCAG AA text contrast — semantic state "ink" (danger/success/info/warning text)', () => {
  for (const theme of ['dark', 'light'] as const) {
    for (const [name, color] of Object.entries(semanticInk[theme])) {
      for (const surface of surfacesByTheme[theme]) {
        test(`${theme} ${name}-ink on ${surface} clears ${AA_TEXT}:1`, () => {
          expect(contrastRatio(color, surface)).toBeGreaterThanOrEqual(AA_TEXT);
        });
      }
    }
  }
});

// BTN-02: `.sv-btn--accent` paints `background: var(--sv-accent-ink)` with
// `color: var(--sv-bg)` — the accent-ink/bg pair used as background/text, not
// text/surface as the ramps above check. WCAG's ratio is symmetric in its two
// inputs, but this pairing is asserted explicitly (rather than relying on the
// bg entry already present in surfacesByTheme above) so BTN-02 has its own
// dedicated, spec-traceable evidence — `--sv-accent-ink` resolves to one of
// the four per-accent inks depending on `[data-accent]`, so every one is
// checked in both themes.
describe('WCAG AA contrast — Button variant="accent" (background accent-ink, text sv-bg)', () => {
  for (const theme of ['dark', 'light'] as const) {
    for (const [name, ink] of Object.entries(accentsInk[theme])) {
      test(`${theme} accent-${name}-ink background with sv-bg text clears ${AA_TEXT}:1`, () => {
        expect(contrastRatio(colors[theme].bg, ink)).toBeGreaterThanOrEqual(AA_TEXT);
      });
    }
  }
});

// Tinted backgrounds ("soft" chips, active rows, badges) are the most common way a
// consumer puts ink text on a colored surface: the hue at 10% over the page surface.
// The ink steps must keep clearing AA there, not only on the flat surfaces above.
const TINT = 0.1;

function tintOver(base: string, surface: string): string {
  const fg = parseColor(base);
  const bg = parseColor(surface);
  const hex = fg.map((v, i) => Math.round((v * TINT + bg[i]! * (1 - TINT)) * 255).toString(16).padStart(2, '0'));
  return `#${hex.join('')}`;
}

describe('WCAG AA text contrast — ink on its own 10% tint', () => {
  for (const theme of ['dark', 'light'] as const) {
    const pairs: Array<[string, string, string]> = [
      ...Object.entries(accents).map(([n, base]) => [`accent-${n}`, base, accentsInk[theme][n as keyof typeof accents]] as [string, string, string]),
      ...Object.entries(semantic[theme]).map(([n, base]) => [n, base, semanticInk[theme][n as keyof typeof semanticInk.dark]] as [string, string, string]),
    ];
    for (const [name, base, ink] of pairs) {
      for (const surface of surfacesByTheme[theme]) {
        test(`${theme} ${name}-ink on a 10% ${name} tint over ${surface} clears ${AA_TEXT}:1`, () => {
          expect(contrastRatio(ink, tintOver(base, surface))).toBeGreaterThanOrEqual(AA_TEXT);
        });
      }
    }
  }
});

// WCAG 1.4.11 (AA, non-text contrast): the edge of an input, select or textarea
// must read ≥3:1 against every surface it can sit on. `--sv-border` and
// `--sv-border-strong` are decorative (~1.5:1) and deliberately not checked.
describe('WCAG AA non-text contrast — control border', () => {
  const AA_NON_TEXT = 3;
  for (const theme of ['dark', 'light'] as const) {
    for (const surface of surfacesByTheme[theme]) {
      test(`${theme} control-border on ${surface} clears ${AA_NON_TEXT}:1`, () => {
        expect(contrastRatio(colors[theme].controlBorder, surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
      });
    }
  }
});
