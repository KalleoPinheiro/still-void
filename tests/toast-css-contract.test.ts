import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, test } from 'vitest';

/**
 * CSS contract test for Toast (T10).
 *
 * Verifies that the Toast section uses only valid tokens and follows Flat-By-Default
 * (no box-shadow). The test reads the actual CSS file and checks for token references,
 * no `box-shadow`, and animation rules.
 */

function readCSSSection(filePath: string, sectionName: string): string {
  const content = readFileSync(filePath, 'utf-8');

  // Find the section start (/* ---------- Toast ---------- */)
  const sectionStart = content.indexOf(`/* ---------- ${sectionName} ---------- */`);
  if (sectionStart === -1) {
    throw new Error(`Section "${sectionName}" not found`);
  }

  // Find the next section start
  const nextSectionStart = content.indexOf('/* ----------', sectionStart + 1);
  const sectionEnd = nextSectionStart === -1 ? content.length : nextSectionStart;

  return content.substring(sectionStart, sectionEnd);
}

describe('Toast CSS Contract', () => {
  const styleCssPath = resolve(__dirname, '../src/css/style.css');
  const themeCssPath = resolve(__dirname, '../src/css/theme.css');

  test('Toast section exists in style.css', () => {
    const content = readFileSync(styleCssPath, 'utf-8');
    expect(content).toContain('/* ---------- Toast ---------- */');
  });

  test('uses valid tokens from theme.css', () => {
    const toastSection = readCSSSection(styleCssPath, 'Toast');
    const themeContent = readFileSync(themeCssPath, 'utf-8');

    // Extract all CSS custom properties used in Toast
    const tokenMatches = toastSection.match(/var\(--sv-[a-z0-9-]+\)/g) || [];
    const uniqueTokens = [...new Set(tokenMatches)];

    for (const token of uniqueTokens) {
      // Check if token is defined in theme.css
      const tokenName = token.replace('var(', '').replace(')', '');
      const isValidToken = themeContent.includes(tokenName);

      if (!isValidToken) {
        throw new Error(`Token ${tokenName} used in Toast but not defined in theme.css`);
      }
      expect(isValidToken).toBe(true);
    }
  });

  test('no box-shadow in Toast classes (Flat-By-Default)', () => {
    const toastSection = readCSSSection(styleCssPath, 'Toast');
    const hasBoxShadow = /box-shadow\s*:/.test(toastSection);

    if (hasBoxShadow) {
      throw new Error('Toast section contains box-shadow (violates Flat-By-Default)');
    }
    expect(hasBoxShadow).toBe(false);
  });

  test('Toast animations are defined', () => {
    const toastSection = readCSSSection(styleCssPath, 'Toast');

    expect(toastSection).toContain('sv-toast-enter');
    expect(toastSection).toContain('sv-toast-exit');
    expect(toastSection).toContain('@keyframes sv-toast-enter');
    expect(toastSection).toContain('@keyframes sv-toast-exit');
  });

  test('uses correct z-index token', () => {
    const toastSection = readCSSSection(styleCssPath, 'Toast');

    expect(toastSection).toContain('var(--sv-z-toast)');
  });

  test('viewport uses fixed positioning', () => {
    const toastSection = readCSSSection(styleCssPath, 'Toast');

    expect(toastSection).toContain('position: fixed');
    expect(toastSection).toContain('.sv-toast__viewport');
  });

  test('variant classes use border color tokens', () => {
    const toastSection = readCSSSection(styleCssPath, 'Toast');

    const variants = ['info', 'success', 'warning', 'danger'];
    for (const variant of variants) {
      expect(toastSection).toContain(`.sv-toast--${variant}`);
      expect(toastSection).toContain(`var(--sv-${variant}-ink)`);
    }
  });

  test('close button uses outline focus style (AD-005)', () => {
    const toastSection = readCSSSection(styleCssPath, 'Toast');

    expect(toastSection).toContain('.sv-toast__close:focus-visible');
    expect(toastSection).toContain('outline: 2px solid var(--sv-accent-ink)');
    expect(toastSection).toContain('outline-offset: 2px');
  });

  test('action button uses outline focus style (AD-005)', () => {
    const toastSection = readCSSSection(styleCssPath, 'Toast');

    expect(toastSection).toContain('.sv-toast__action:focus-visible');
    expect(toastSection).toContain('outline: 2px solid var(--sv-accent-ink)');
  });

  test('reduced-motion includes sv-toast', () => {
    const content = readFileSync(styleCssPath, 'utf-8');
    const start = content.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(start).toBeGreaterThan(-1);

    // Bound the slice to the matching closing brace so a later, unrelated
    // reduced-motion block (or a `.sv-toast` rule outside this one) can't
    // satisfy the assertion.
    let braceCount = 0;
    let end = start;
    for (let i = start; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          end = i + 1;
          break;
        }
      }
    }
    const reducedMotionSection = content.substring(start, end);

    // Exact selector, not a `.sv-toast__viewport`-matching substring.
    const toastRuleMatch = reducedMotionSection.match(/\.sv-toast\s*\{[^}]*\}/);
    expect(toastRuleMatch).toBeTruthy();
    expect(toastRuleMatch![0]).toMatch(/animation:\s*none/);
  });

  test('uses valid spacing tokens', () => {
    const toastSection = readCSSSection(styleCssPath, 'Toast');

    // Check for common spacing tokens
    const spacingTokens = [
      'var(--sv-space-2)',
      'var(--sv-space-3)',
      'var(--sv-space-4)',
    ];

    for (const token of spacingTokens) {
      expect(toastSection).toContain(token);
    }
  });

  test('uses valid surface/border tokens', () => {
    const toastSection = readCSSSection(styleCssPath, 'Toast');

    expect(toastSection).toContain('var(--sv-surface)');
    expect(toastSection).toContain('var(--sv-border)');
  });

  test('uses valid duration and easing tokens', () => {
    const toastSection = readCSSSection(styleCssPath, 'Toast');

    expect(toastSection).toContain('var(--sv-duration-fast)');
    expect(toastSection).toContain('var(--sv-ease-hover)');
  });
});
