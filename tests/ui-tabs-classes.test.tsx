import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../src/components/ui/tabs';

afterEach(cleanup);

/**
 * Every class token emitted anywhere in a rendered tree.
 *
 * jsdom never loads `style.css`, so `getComputedStyle` cannot resolve a
 * `var(--sv-*)`; the declared values are pinned as text by
 * `tests/client-css-contract.test.ts`. What this file can prove is the other
 * half of CLIENT-01 — which class names the component actually emits.
 */
function classTokens(container: HTMLElement): string[] {
  return [...container.querySelectorAll('[class]')].flatMap((element) =>
    (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean),
  );
}

function classOf(container: HTMLElement, selector: string): string {
  const element = container.querySelector(selector);
  if (element === null) throw new Error(`no element matched ${selector}`);
  return element.getAttribute('class') ?? '';
}

function renderTabs(className?: string) {
  return render(
    <Tabs defaultValue="one">
      <TabsList className={className}>
        <TabsTrigger className={className} value="one">
          One
        </TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent className={className} value="one">
        First panel
      </TabsContent>
    </Tabs>,
  );
}

describe('Tabs — emitted classes (CLIENT-01)', () => {
  test('List, Trigger and Content each emit exactly their sv-* class', () => {
    const { container } = renderTabs();
    expect(classOf(container, '[role="tablist"]')).toBe('sv-tabs__list');
    expect(classOf(container, '[role="tab"]')).toBe('sv-tabs__trigger');
    expect(classOf(container, '[role="tabpanel"]')).toBe('sv-tabs__content');
  });

  test('no class outside the sv- prefix survives anywhere in the tree', () => {
    const { container } = renderTabs();
    const foreign = classTokens(container).filter((token) => !token.startsWith('sv-'));
    expect(foreign).toEqual([]);
  });

  test('the dead utilities the shadcn strings carried are gone', () => {
    // These named colours were never declared by this package, so the classes
    // resolved to nothing: `ring-ring` and `ring-offset-background` left the
    // keyboard focus invisible and `shadow-sm` contradicted Flat-By-Default.
    const emitted = classTokens(renderTabs().container).join(' ');
    for (const dead of [
      'ring-ring',
      'ring-offset-background',
      'shadow-sm',
      'focus-visible:ring-2',
      'data-[state=active]:bg-sv-surface',
    ]) {
      expect(emitted).not.toContain(dead);
    }
  });
});

describe('Tabs — consumer className (CLIENT-01 control case)', () => {
  test('a consumer class is merged onto the sv-* class, never replaces it', () => {
    // The control for the sweep above: `cn()` still has to let a consumer add
    // their own class, so "only sv-*" must mean "only what the component
    // itself emits", not "className is being dropped on the floor".
    const { container } = renderTabs('mine');
    for (const selector of ['[role="tablist"]', '[role="tab"]', '[role="tabpanel"]']) {
      expect(classOf(container, selector)).toContain('mine');
    }
    expect(classOf(container, '[role="tablist"]')).toContain('sv-tabs__list');
    expect(classOf(container, '[role="tab"]')).toContain('sv-tabs__trigger');
    expect(classOf(container, '[role="tabpanel"]')).toContain('sv-tabs__content');
  });
});

describe('Tabs — component identity (CLIENT-07)', () => {
  test('displayName on the three members is unchanged by the migration', () => {
    // Radix ships these primitives without a displayName, so the value the
    // migration must not disturb is `undefined`. Asserting it pins the
    // identity the barrel and the stories resolve against.
    expect(TabsList.displayName).toBeUndefined();
    expect(TabsTrigger.displayName).toBeUndefined();
    expect(TabsContent.displayName).toBeUndefined();
  });
});

describe('Tabs — no utility survives in the source (CLIENT-01)', () => {
  test('every class literal in tabs.tsx is an sv-* name', () => {
    // The render sweep proves what today's tree emits; this proves the file
    // itself carries nothing else — a utility parked in a variant string on a
    // branch no test exercises would slip past the sweep.
    const source = readFileSync(resolve(process.cwd(), 'src/components/ui/tabs.tsx'), 'utf-8');
    const literals = [...source.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
    const classLiterals = literals.filter(
      (literal) => literal !== 'react' && !literal.includes('/'),
    );
    expect(classLiterals.length).toBeGreaterThan(0);
    for (const literal of classLiterals) {
      expect(literal).toMatch(/^sv-[a-z0-9_-]+$/);
    }
  });
});
