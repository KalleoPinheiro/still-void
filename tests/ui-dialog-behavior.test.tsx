import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../src/components/ui/dialog';

afterEach(cleanup);

/**
 * Radix listens for pointer events that jsdom does not synthesize from a bare
 * `click`, so a dismiss has to be driven the same way `tests/ui-dialog.test.tsx`
 * drives one.
 */
function act(element: HTMLElement) {
  fireEvent.pointerDown(element);
  fireEvent.mouseDown(element);
  fireEvent.click(element);
}

/** Radix portals the dialog out of the render container. */
function query(selector: string): Element | null {
  return document.body.querySelector(selector);
}

function classOf(selector: string): string {
  const element = query(selector);
  if (element === null) throw new Error(`no element matched ${selector}`);
  return element.getAttribute('class') ?? '';
}

/**
 * Every class token emitted anywhere in the document.
 *
 * jsdom never loads `style.css`, so `getComputedStyle` cannot resolve a
 * `var(--sv-*)`; the declared values are pinned as text by
 * `tests/client-css-contract.test.ts`. What this file proves is the other half
 * of CLIENT-01 — which class names the components actually emit.
 */
function classTokens(): string[] {
  return [...document.body.querySelectorAll('[class]')].flatMap((element) =>
    (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean),
  );
}

function renderDialog(
  options: { showCloseButton?: boolean; className?: string; footerClose?: boolean } = {},
) {
  const { showCloseButton, className, footerClose = false } = options;
  render(
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent className={className} showCloseButton={showCloseButton}>
        <DialogHeader className={className}>
          <DialogTitle className={className}>Title</DialogTitle>
          <DialogDescription className={className}>Description</DialogDescription>
        </DialogHeader>
        {footerClose ? (
          <DialogFooter className={className}>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        ) : (
          <DialogFooter className={className}>Footer</DialogFooter>
        )}
      </DialogContent>
    </Dialog>,
  );
  act(screen.getByText('Open'));
}

describe('Dialog — emitted classes (CLIENT-01)', () => {
  test('every member emits exactly its sv-* class', async () => {
    renderDialog();
    await screen.findByRole('dialog');
    expect(classOf('[data-radix-dialog-overlay], [aria-hidden][data-state]')).toContain(
      'sv-overlay',
    );
    expect(classOf('[role="dialog"]')).toBe('sv-dialog');
    expect(classOf('[role="dialog"] > div:first-child')).toBe('sv-dialog__header');
    expect(classOf('h2')).toBe('sv-dialog__title');
    expect(classOf('p')).toBe('sv-dialog__description');
  });

  test('no class outside the sv- prefix survives anywhere in the tree', async () => {
    renderDialog();
    await screen.findByRole('dialog');
    const tokens = classTokens();
    // Guard the sweep against passing over an empty set.
    expect(tokens).toContain('sv-dialog');
    expect(tokens.filter((token) => !token.startsWith('sv-'))).toEqual([]);
  });

  test('every class literal in dialog.tsx is an sv-* name', () => {
    // The render sweep proves what today's tree emits; this proves the file
    // itself carries nothing else. The string it replaces packed `shadow-lg`,
    // `bg-background/80` and fourteen `data-[state=…]` animation variants, most
    // of which no single render exercises.
    const source = readFileSync(resolve(process.cwd(), 'src/components/ui/dialog.tsx'), 'utf-8');
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

  test('a consumer class is merged onto the sv-* class, never replaces it', async () => {
    // The control for the sweep above: "only sv-*" has to mean "only what the
    // component emits", not "className is being dropped on the floor".
    renderDialog({ className: 'mine' });
    await screen.findByRole('dialog');
    expect(classOf('[role="dialog"]')).toContain('sv-dialog');
    expect(classOf('[role="dialog"]')).toContain('mine');
    expect(classOf('h2')).toContain('sv-dialog__title');
    expect(classOf('h2')).toContain('mine');
  });
});

describe('Dialog — modality is announced (CLIENT-05)', () => {
  test('the open dialog exposes aria-modal="true"', async () => {
    // Radix renders role="dialog" but never aria-modal, so assistive tech was
    // told nothing about the content behind the panel being inert.
    renderDialog();
    expect(await screen.findByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});

describe('Dialog — the default close button (CLIENT-06)', () => {
  test('renders by default with the x icon and an sr-only name', async () => {
    renderDialog();
    await screen.findByRole('dialog');
    const close = query('.sv-dialog__close');
    expect(close).not.toBeNull();
    expect(close?.querySelector('svg')?.getAttribute('class')).toContain('sv-icon');
    expect(close?.querySelector('.sv-sr-only')?.textContent).toBe('Close dialog');
  });

  test('its accessible name is the sr-only text, not the icon', async () => {
    // The icon is aria-hidden, so without the span the control would reach a
    // screen reader as an unnamed button.
    renderDialog();
    await screen.findByRole('dialog');
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveClass('sv-dialog__close');
  });

  test('clicking it closes the dialog', async () => {
    renderDialog();
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    act(screen.getByRole('button', { name: 'Close dialog' }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('showCloseButton={false} renders no close button', async () => {
    renderDialog({ showCloseButton: false });
    await screen.findByRole('dialog');
    expect(query('.sv-dialog__close')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument();
    // The opt-out removes the button, not the panel.
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  test('the default button does not collide with a consumer DialogClose', async () => {
    // The new default adds a second dismiss affordance to every dialog. A
    // consumer whose own control is labelled `Close` must still be able to
    // address each one unambiguously — the reason the sr-only text is
    // `Close dialog` and the reason showCloseButton exists.
    renderDialog({ footerClose: true });
    await screen.findByRole('dialog');
    expect(screen.getByRole('button', { name: 'Close' })).not.toHaveClass('sv-dialog__close');
    expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveClass('sv-dialog__close');
  });
});

describe('Dialog — component identity (CLIENT-07)', () => {
  test('displayName on every member is unchanged by the migration', () => {
    // Radix ships its primitives without a displayName, so the value the
    // migration must not disturb is `undefined` for the forwarded members and
    // the literal string for the two plain-div members.
    expect(DialogContent.displayName).toBeUndefined();
    expect(DialogTitle.displayName).toBeUndefined();
    expect(DialogDescription.displayName).toBeUndefined();
    expect(DialogHeader.displayName).toBe('DialogHeader');
    expect(DialogFooter.displayName).toBe('DialogFooter');
  });
});
