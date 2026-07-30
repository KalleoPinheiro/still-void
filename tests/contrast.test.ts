import { describe, expect, test } from 'vitest';
import { colors, accentsInk, semanticInk, type ThemeMode } from '../src/tokens/colors';
import { contrastRatio } from './utils/color';

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
