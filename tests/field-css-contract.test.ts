import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * jsdom never loads style.css, so getComputedStyle can't resolve var(--sv-*)
 * and asserting colors through the DOM would be theatre. The field frame is
 * therefore verified as text, the same way tests/tokenParity.test.ts verifies
 * theme.css: every rule the design promises must exist, and every color,
 * spacing and radius in it must come from a token — a hard literal here is
 * exactly the bug that left the shadcn layer stuck on the dark palette.
 */

const cssPath = resolve(process.cwd(), 'src/css/style.css');
const css = readFileSync(cssPath, 'utf-8');

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Slice one `/* ---------- Name ---------- *\/` section out of style.css. */
function section(source: string, name: string): string {
  const marker = `/* ---------- ${name} ---------- */`;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Section not found in style.css: ${name}`);
  const rest = source.slice(start + marker.length);
  const next = rest.indexOf('/* ---------- ');
  return next === -1 ? rest : rest.slice(0, next);
}

/** selector -> declaration body. Grouped selectors are registered separately. */
function parseRules(block: string): Map<string, string> {
  const rules = new Map<string, string>();
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(block))) {
    const body = (match[2] as string).trim();
    for (const selector of (match[1] as string).split(',')) {
      const key = selector.trim();
      if (key) rules.set(key, body);
    }
  }
  return rules;
}

function bodyOf(selector: string): string {
  const body = forms.get(selector);
  if (body === undefined) throw new Error(`Rule not found in Forms section: ${selector}`);
  return body;
}

function decl(selector: string, property: string): string | undefined {
  const re = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'm');
  const found = bodyOf(selector).match(re);
  return found ? (found[1] as string).trim() : undefined;
}

const formsSection = stripComments(section(css, 'Forms'));
const forms = parseRules(formsSection);

const REQUIRED_SELECTORS = [
  '.sv-field',
  '.sv-field::placeholder',
  '.sv-field:focus-visible',
  '.sv-field:disabled',
  ".sv-field[aria-invalid='true']",
  ".sv-field[aria-invalid='true']:focus-visible",
  '.sv-field--textarea',
  '.sv-field--select[multiple]',
  '.sv-field--file',
  '.sv-field--file::file-selector-button',
  '.sv-field--file::-webkit-file-upload-button',
  '.sv-field-message',
  '.sv-field-message--error',
  '.sv-check',
  '.sv-radio',
  '.sv-check:focus-visible',
  '.sv-radio:focus-visible',
  '.sv-check:disabled',
  '.sv-radio:disabled',
  '.sv-choice',
  '.sv-radio-group',
  '.sv-radio-group--horizontal',
  '.sv-radio-group__legend',
  '.sv-sr-only',
] as const;

describe('style.css Forms section — every promised rule exists', () => {
  test.each(REQUIRED_SELECTORS)('declares %s', (selector) => {
    expect([...forms.keys()]).toContain(selector);
  });
});

describe('.sv-field reproduces the Input frame from tokens', () => {
  // AC P1-Campos #11: height, radius, padding and the four colors are the
  // Input's current values expressed as tokens; font-size is the only value
  // that changes (14px Tailwind default -> --sv-text-base, 15px) per AD-004.
  test.each([
    ['display', 'block'],
    ['width', '100%'],
    ['height', 'var(--sv-space-10)'],
    ['padding', 'var(--sv-space-2) var(--sv-space-3)'],
    ['border', '1px solid var(--sv-border)'],
    ['border-radius', 'var(--sv-radius-sm)'],
    ['background', 'var(--sv-surface)'],
    ['color', 'var(--sv-text)'],
    ['font-family', 'var(--sv-font-body)'],
    ['font-size', 'var(--sv-text-base)'],
    ['line-height', '1.5'],
  ])('.sv-field %s is %s', (property, value) => {
    expect(decl('.sv-field', property)).toBe(value);
  });

  test('placeholder uses the muted text token', () => {
    expect(decl('.sv-field::placeholder', 'color')).toBe('var(--sv-text-2)');
  });

  test('disabled fields are dimmed and show a not-allowed cursor', () => {
    expect(decl('.sv-field:disabled', 'cursor')).toBe('not-allowed');
    expect(decl('.sv-field:disabled', 'opacity')).toBe('0.5');
  });
});

describe('invalid state reads aria-invalid, not a boolean prop', () => {
  test("[aria-invalid='true'] paints the border with the danger-ink token", () => {
    expect(decl(".sv-field[aria-invalid='true']", 'border-color')).toBe('var(--sv-danger-ink)');
  });

  test("[aria-invalid='true']:focus-visible swaps the outline to danger-ink", () => {
    expect(decl(".sv-field[aria-invalid='true']:focus-visible", 'outline-color')).toBe(
      'var(--sv-danger-ink)',
    );
  });
});

describe('.sv-field-message pairs helper/error text with a field', () => {
  test('default is muted secondary text', () => {
    expect(decl('.sv-field-message', 'color')).toBe('var(--sv-text-2)');
    expect(decl('.sv-field-message', 'font-size')).toBe('var(--sv-text-sm)');
  });

  test('--error modifier switches to the danger-ink token', () => {
    expect(decl('.sv-field-message--error', 'color')).toBe('var(--sv-danger-ink)');
  });
});

describe('focus is a real outline, never a ring (AD-005 / D5)', () => {
  test.each(['.sv-field:focus-visible', '.sv-check:focus-visible', '.sv-radio:focus-visible'])(
    '%s paints a 2px accent-ink outline offset by 2px',
    (selector) => {
      expect(decl(selector, 'outline')).toBe('2px solid var(--sv-accent-ink)');
      expect(decl(selector, 'outline-offset')).toBe('2px');
    },
  );

  test('no Forms rule uses box-shadow (Flat-By-Default)', () => {
    expect(formsSection).not.toMatch(/box-shadow/);
  });
});

describe('field variants adjust only what the element needs', () => {
  test('textarea drops the fixed height and resizes vertically', () => {
    expect(decl('.sv-field--textarea', 'height')).toBe('auto');
    expect(decl('.sv-field--textarea', 'min-height')).toBe('calc(var(--sv-space-10) * 2)');
    expect(decl('.sv-field--textarea', 'resize')).toBe('vertical');
  });

  test('a multiple select grows into a list box instead of staying one row tall', () => {
    expect(decl('.sv-field--select[multiple]', 'height')).toBe('auto');
  });

  test('the file field trades the fixed height for tighter padding', () => {
    expect(decl('.sv-field--file', 'height')).toBe('auto');
    expect(decl('.sv-field--file', 'padding')).toBe('var(--sv-space-1) var(--sv-space-2)');
  });

  test.each(['.sv-field--file::file-selector-button', '.sv-field--file::-webkit-file-upload-button'])(
    '%s styles the native button with system tokens',
    (selector) => {
      expect(decl(selector, 'margin-inline-end')).toBe('var(--sv-space-3)');
      expect(decl(selector, 'padding')).toBe('var(--sv-space-1) var(--sv-space-3)');
      expect(decl(selector, 'border')).toBe('1px solid var(--sv-border)');
      expect(decl(selector, 'border-radius')).toBe('var(--sv-radius-sm)');
      expect(decl(selector, 'background')).toBe('var(--sv-surface-2)');
      expect(decl(selector, 'color')).toBe('var(--sv-text)');
    },
  );
});

describe('check and radio controls', () => {
  test.each(['.sv-check', '.sv-radio'])('%s is a 16px control tinted by the ink accent', (selector) => {
    expect(decl(selector, 'width')).toBe('var(--sv-space-4)');
    expect(decl(selector, 'height')).toBe('var(--sv-space-4)');
    expect(decl(selector, 'accent-color')).toBe('var(--sv-accent-ink)');
  });

  test.each(['.sv-check:disabled', '.sv-radio:disabled'])('%s is dimmed when disabled', (selector) => {
    expect(decl(selector, 'cursor')).toBe('not-allowed');
    expect(decl(selector, 'opacity')).toBe('0.5');
  });

  test('.sv-choice lays label and control on one line with token spacing', () => {
    expect(decl('.sv-choice', 'display')).toBe('inline-flex');
    expect(decl('.sv-choice', 'align-items')).toBe('center');
    expect(decl('.sv-choice', 'gap')).toBe('var(--sv-space-2)');
    expect(decl('.sv-choice', 'color')).toBe('var(--sv-text)');
  });
});

describe('radio group layout', () => {
  test('the fieldset is stripped of its native chrome and stacks vertically', () => {
    expect(decl('.sv-radio-group', 'border')).toBe('0');
    expect(decl('.sv-radio-group', 'margin')).toBe('0');
    expect(decl('.sv-radio-group', 'padding')).toBe('0');
    expect(decl('.sv-radio-group', 'display')).toBe('flex');
    expect(decl('.sv-radio-group', 'flex-direction')).toBe('column');
    expect(decl('.sv-radio-group', 'gap')).toBe('var(--sv-space-2)');
  });

  test('the horizontal modifier switches direction and wraps', () => {
    expect(decl('.sv-radio-group--horizontal', 'flex-direction')).toBe('row');
    expect(decl('.sv-radio-group--horizontal', 'flex-wrap')).toBe('wrap');
    expect(decl('.sv-radio-group--horizontal', 'gap')).toBe('var(--sv-space-4)');
  });

  test('the legend reads as muted secondary text', () => {
    expect(decl('.sv-radio-group__legend', 'color')).toBe('var(--sv-text-2)');
    expect(decl('.sv-radio-group__legend', 'font-size')).toBe('var(--sv-text-sm)');
  });
});

describe('.sv-sr-only hides visually without leaving the accessibility tree', () => {
  test('clips the box instead of removing it', () => {
    expect(decl('.sv-sr-only', 'clip-path')).toBe('inset(50%)');
    expect(decl('.sv-sr-only', 'position')).toBe('absolute');
    expect(decl('.sv-sr-only', 'overflow')).toBe('hidden');
  });

  test('never uses display:none or visibility:hidden', () => {
    expect(decl('.sv-sr-only', 'display')).toBeUndefined();
    expect(decl('.sv-sr-only', 'visibility')).toBeUndefined();
  });
});

describe('no rule hardcodes a color literal', () => {
  test.each(REQUIRED_SELECTORS)('%s references only var(--sv-*) colors', (selector) => {
    expect(bodyOf(selector)).not.toMatch(/#[0-9a-fA-F]{3}|oklch\(|rgba?\(|hsla?\(/);
  });
});
