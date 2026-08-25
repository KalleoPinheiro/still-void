import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../src/components/ui/alert-dialog';

afterEach(cleanup);

function open(trigger: HTMLElement) {
  fireEvent.pointerDown(trigger);
  fireEvent.mouseDown(trigger);
  fireEvent.click(trigger);
}

function classOf(selector: string): string {
  const element = document.body.querySelector(selector);
  if (element === null) throw new Error(`no element matched ${selector}`);
  return element.getAttribute('class') ?? '';
}

/** Every class token emitted anywhere in the document — mirrors the Dialog sweep (CLIENT-01). */
function classTokens(): string[] {
  return [...document.body.querySelectorAll('[class]')].flatMap((element) =>
    (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean),
  );
}

function renderAlertDialog(className?: string) {
  render(
    <AlertDialog>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent className={className}>
        <AlertDialogHeader className={className}>
          <AlertDialogTitle className={className}>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className={className}>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={className}>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  );
}

describe('AlertDialog — basic interaction (ALERT-01)', () => {
  test('content is not rendered until opened', () => {
    renderAlertDialog();
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  test('opening the trigger renders title, description, cancel and action', async () => {
    renderAlertDialog();
    open(screen.getByText('Delete'));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  test('the 11 named exports resolve, and the three plain aliases are the Radix primitives themselves', () => {
    // Root/Trigger/Portal are re-exported as-is (same pattern as Dialog); the
    // other 8 are wrapped in forwardRef, so identity is proven by the render
    // assertions below instead of reference equality.
    expect(AlertDialog).toBe(AlertDialogPrimitive.Root);
    expect(AlertDialogTrigger).toBe(AlertDialogPrimitive.Trigger);
    expect(AlertDialogPortal).toBe(AlertDialogPrimitive.Portal);
    expect(AlertDialogOverlay).toBeDefined();
    expect(AlertDialogContent).toBeDefined();
    expect(AlertDialogHeader).toBeDefined();
    expect(AlertDialogFooter).toBeDefined();
    expect(AlertDialogTitle).toBeDefined();
    expect(AlertDialogDescription).toBeDefined();
    expect(AlertDialogAction).toBeDefined();
    expect(AlertDialogCancel).toBeDefined();
  });
});

describe('AlertDialog — role and modality (ALERT-02)', () => {
  test('the open content carries role="alertdialog", set automatically by the Radix primitive', async () => {
    renderAlertDialog();
    open(screen.getByText('Delete'));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
  });

  test('the open content exposes aria-modal="true"', async () => {
    renderAlertDialog();
    open(screen.getByText('Delete'));
    expect(await screen.findByRole('alertdialog')).toHaveAttribute('aria-modal', 'true');
  });
});

describe('AlertDialog — reuses Dialog CSS, no new block (ALERT-03)', () => {
  test('every member emits exactly the Dialog class it reuses', async () => {
    renderAlertDialog();
    open(screen.getByText('Delete'));
    await screen.findByRole('alertdialog');
    expect(classOf('[role="alertdialog"]')).toBe('sv-dialog');
    expect(classOf('[role="alertdialog"] > div:first-child')).toBe('sv-dialog__header');
    expect(classOf('h2')).toBe('sv-dialog__title');
    expect(classOf('p')).toBe('sv-dialog__description');
  });

  test('no class outside the sv- prefix survives anywhere in the tree', async () => {
    renderAlertDialog();
    open(screen.getByText('Delete'));
    await screen.findByRole('alertdialog');
    const tokens = classTokens();
    expect(tokens).toContain('sv-dialog');
    expect(tokens.filter((token) => !token.startsWith('sv-'))).toEqual([]);
  });

  test('every class literal in alert-dialog.tsx is an sv-* name — no new CSS block was added', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/ui/alert-dialog.tsx'),
      'utf-8',
    );
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

  test('a consumer className is merged onto the sv-* class, never replaces it', async () => {
    renderAlertDialog('mine');
    open(screen.getByText('Delete'));
    await screen.findByRole('alertdialog');
    expect(classOf('[role="alertdialog"]')).toContain('sv-dialog');
    expect(classOf('[role="alertdialog"]')).toContain('mine');
    expect(classOf('h2')).toContain('sv-dialog__title');
    expect(classOf('h2')).toContain('mine');
  });
});

describe('AlertDialog — no close X button (ALERT-04)', () => {
  test('the open content has no .sv-dialog__close and no unlabeled dismiss button', async () => {
    renderAlertDialog();
    open(screen.getByText('Delete'));
    await screen.findByRole('alertdialog');
    expect(document.body.querySelector('.sv-dialog__close')).toBeNull();
    // Only the two explicit affordances exist — no third, icon-only escape hatch.
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});

describe('AlertDialog — dismissal', () => {
  test('AlertDialogCancel closes the dialog', async () => {
    renderAlertDialog();
    open(screen.getByText('Delete'));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    open(screen.getByText('Cancel'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  test('AlertDialogAction closes the dialog', async () => {
    renderAlertDialog();
    open(screen.getByText('Delete'));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    open(screen.getByText('Continue'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});

describe('AlertDialog — component identity (ALERT-05, R3-01)', () => {
  test('every member carries a literal displayName equal to its export name', () => {
    // Radix ships its primitives without a displayName (confirmed for Dialog
    // in ui-dialog-behavior.test.tsx); every forwardRef member here is now
    // assigned a literal string instead of inheriting from the primitive.
    expect(AlertDialogContent.displayName).toBe('AlertDialogContent');
    expect(AlertDialogOverlay.displayName).toBe('AlertDialogOverlay');
    expect(AlertDialogTitle.displayName).toBe('AlertDialogTitle');
    expect(AlertDialogDescription.displayName).toBe('AlertDialogDescription');
    expect(AlertDialogAction.displayName).toBe('AlertDialogAction');
    expect(AlertDialogCancel.displayName).toBe('AlertDialogCancel');
    expect(AlertDialogHeader.displayName).toBe('AlertDialogHeader');
    expect(AlertDialogFooter.displayName).toBe('AlertDialogFooter');
  });
});
