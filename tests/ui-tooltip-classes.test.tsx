import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../src/components/ui/tooltip';

afterEach(cleanup);

/**
 * Every class token emitted anywhere in the document.
 *
 * The search root is `document.body`, not the render container: Radix portals
 * the tooltip out of the tree. jsdom never loads `style.css`, so the declared
 * values are pinned as text by `tests/client-css-contract.test.ts`; what this
 * file proves is the other half of CLIENT-01 — the class names emitted.
 */
function classTokens(): string[] {
  return [...document.body.querySelectorAll('[class]')].flatMap((element) =>
    (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean),
  );
}

function renderTooltip(className?: string) {
  render(
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent className={className}>Helpful text</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );
  // Radix renders the text twice: the visible panel and a visually hidden copy
  // for the trigger's accessible name. The panel is the one carrying classes.
  const panel = document.body.querySelector('[data-radix-popper-content-wrapper] [class]');
  if (panel === null) throw new Error('TooltipContent rendered no classed element');
  return panel;
}

describe('Tooltip — emitted classes (CLIENT-01)', () => {
  test('TooltipContent composes .sv-pop with the .sv-tooltip delta', () => {
    // .sv-tooltip declares only what differs from the shared floating panel —
    // the tooltip layer and a tighter padding — so dropping .sv-pop would leave
    // the panel with no surface, border or radius at all.
    expect(renderTooltip().getAttribute('class')).toBe('sv-pop sv-tooltip');
  });

  test('no class outside the sv- prefix survives anywhere in the tree', () => {
    renderTooltip();
    expect(classTokens().filter((token) => !token.startsWith('sv-'))).toEqual([]);
  });
});

describe('Tooltip — no utility survives in the source (CLIENT-01)', () => {
  test('every class literal in tooltip.tsx is an sv-* name', () => {
    // The render sweep proves what today's tree emits; this proves the file
    // itself carries nothing else — the string it replaces packed eleven
    // `animate-in` / `data-[side=…]` variants that no render exercises at once.
    const source = readFileSync(resolve(process.cwd(), 'src/components/ui/tooltip.tsx'), 'utf-8');
    // Only className positions — a bare string sweep would also pick up module
    // specifiers, displayName values and words quoted inside comments.
    const classAttributes = [...source.matchAll(/className=(?:\{cn\(([^)]*)\)\}|"([^"]*)")/g)];
    const classLiterals = classAttributes.flatMap(([, call, literal]) =>
      literal === undefined
        ? [...(call ?? '').matchAll(/"([^"]*)"/g)].flatMap((m) => m[1] ?? [])
        : [literal],
    );
    expect(classLiterals.length).toBeGreaterThan(0);
    for (const literal of classLiterals) {
      expect(literal).toMatch(/^sv-[a-z0-9_-]+$/);
    }
  });
});

describe('Tooltip — consumer className (CLIENT-01 control case)', () => {
  test('a consumer class is merged onto the sv-* classes, never replaces them', () => {
    // The control for the sweep above: "only sv-*" has to mean "only what the
    // component emits", not "className is being dropped on the floor".
    const panelClass = renderTooltip('mine').getAttribute('class') ?? '';
    expect(panelClass).toContain('sv-pop');
    expect(panelClass).toContain('sv-tooltip');
    expect(panelClass).toContain('mine');
  });
});

describe('Tooltip — component identity (CLIENT-07, R3-01)', () => {
  test('carries a literal displayName equal to its export name', () => {
    // Radix ships Content without a displayName (`TooltipContent.displayName
    // = TooltipPrimitive.Content.displayName` used to resolve to
    // `undefined`), so it is now assigned a literal string instead of
    // inheriting from the primitive.
    expect(TooltipContent.displayName).toBe('TooltipContent');
  });
});
