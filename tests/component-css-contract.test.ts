import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * AC "P2-2" #1: Button, Card, Alert and Badge must emit sv-* classes backed by
 * REAL CSS in style.css — that is the half of AD-001 that makes them work
 * without Tailwind.
 *
 * The per-component tests assert the class lands on the element. That is only
 * half the claim: a class with no rule behind it is a ghost. The contracts
 * those tests carried checked rule existence with `toContain('.sv-card')`,
 * which `.sv-card__header` already satisfies — so a discrimination sensor
 * could delete the entire `.sv-card`, `.sv-alert` and `.sv-btn` base rules and
 * the suite stayed green.
 *
 * This file closes that hole the way tests/field-css-contract.test.ts already
 * does for the field frame: parse each section into a selector -> body map and
 * assert on the exact selector and its declarations, never on a substring of
 * the section text.
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

const sections = {
  Button: parseRules(stripComments(section(css, 'Button'))),
  Card: parseRules(stripComments(section(css, 'Card'))),
  Alert: parseRules(stripComments(section(css, 'Alert'))),
  Badge: parseRules(stripComments(section(css, 'Badge'))),
} as const;

function bodyOf(sectionName: keyof typeof sections, selector: string): string {
  const body = sections[sectionName].get(selector);
  if (body === undefined) {
    throw new Error(`Rule not found in ${sectionName} section: ${selector}`);
  }
  return body;
}

function decl(
  sectionName: keyof typeof sections,
  selector: string,
  property: string,
): string | undefined {
  const re = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`, 'm');
  const found = bodyOf(sectionName, selector).match(re);
  return found ? (found[1] as string).trim() : undefined;
}

/**
 * The base rule of each family, with the declarations that carry its identity.
 * Deleting the rule, or hollowing it out, must fail — that is the mutation
 * these cases exist to kill.
 */
const baseRules = [
  {
    name: 'Button' as const,
    selector: '.sv-btn',
    required: {
      height: 'var(--sv-space-10)',
      'border-radius': 'var(--sv-radius-sm)',
      background: 'var(--sv-surface)',
      color: 'var(--sv-text)',
    },
  },
  {
    name: 'Card' as const,
    selector: '.sv-card',
    required: {
      border: '1px solid var(--sv-border)',
      'border-radius': 'var(--sv-radius-md)',
      background: 'var(--sv-surface)',
      color: 'var(--sv-text)',
    },
  },
  {
    name: 'Alert' as const,
    selector: '.sv-alert',
    required: {
      border: '1px solid var(--sv-border)',
      'border-radius': 'var(--sv-radius-md)',
      background: 'var(--sv-surface)',
      color: 'var(--sv-text)',
    },
  },
  {
    name: 'Badge' as const,
    selector: '.sv-badge',
    required: {
      'border-radius': 'var(--sv-radius-full)',
      // One-Accent Rule: the default badge follows [data-accent] instead of
      // locking to cyan. A fixed hue here is the regression to catch.
      background: 'var(--sv-accent)',
    },
  },
];

describe('component CSS contract — base rules exist with real declarations', () => {
  test.each(baseRules)('$selector exists as an exact selector, not a prefix match', ({
    name,
    selector,
  }) => {
    // `.sv-card__header` contains the substring `.sv-card`; only an exact-key
    // lookup proves the base rule itself is present.
    expect([...sections[name].keys()]).toContain(selector);
  });

  test.each(baseRules)('$selector declares its identity properties', ({
    name,
    selector,
    required,
  }) => {
    for (const [property, value] of Object.entries(required)) {
      expect(decl(name, selector, property)).toBe(value);
    }
  });
});

describe('component CSS contract — Still Void design rules', () => {
  const sectionNames = Object.keys(sections) as (keyof typeof sections)[];

  test.each(sectionNames)('%s section has no box-shadow (Flat-By-Default)', (name) => {
    for (const body of sections[name].values()) {
      expect(body).not.toMatch(/box-shadow/);
    }
  });

  test.each(sectionNames)('%s section uses no literal color value', (name) => {
    // Every color must come from a token. A literal here is the exact defect
    // that froze the shadcn layer on the dark palette (D1).
    for (const body of sections[name].values()) {
      expect(body).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(body).not.toMatch(/\boklch\(/);
      expect(body).not.toMatch(/\brgba?\(/);
    }
  });

  test.each(sectionNames)('%s section states focus with outline, never a ring', (name) => {
    for (const [selector, body] of sections[name].entries()) {
      if (!selector.includes(':focus-visible')) continue;
      // AD-005: ring-* is implemented as box-shadow, which the Flat-By-Default
      // rule forbids, and the Tailwind ring color it named never existed.
      expect(body).toMatch(/outline:\s*2px solid var\(--sv-accent-ink\)/);
    }
  });
});
