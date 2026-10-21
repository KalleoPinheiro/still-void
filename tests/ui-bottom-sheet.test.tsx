import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetFooter,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from '../src/components/ui/bottom-sheet';

afterEach(cleanup);

function sheet(props: Parameters<typeof BottomSheetContent>[0] = {}, root: Parameters<typeof BottomSheet>[0] = {}) {
  return (
    <BottomSheet {...root}>
      <BottomSheetTrigger>Abrir ficha</BottomSheetTrigger>
      <BottomSheetContent {...props}>
        <BottomSheetHeader>
          <BottomSheetTitle>Editar paciente</BottomSheetTitle>
          <BottomSheetDescription>Dados cadastrais</BottomSheetDescription>
        </BottomSheetHeader>
        <BottomSheetBody>corpo</BottomSheetBody>
        <BottomSheetFooter>
          <BottomSheetClose>Salvar</BottomSheetClose>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  );
}

function open() {
  fireEvent.click(screen.getByText('Abrir ficha'));
  return screen.getByRole('dialog');
}

function handle(): HTMLElement {
  return document.body.querySelector('.sv-sheet__handle') as HTMLElement;
}

describe('BottomSheet behavior', () => {
  test('opens as a labelled modal dialog with the sheet classes', () => {
    render(sheet());
    const dialog = open();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.className).toContain('sv-sheet');
    expect(screen.getByText('Editar paciente').className).toContain('sv-sheet__title');
    expect(screen.getByText('Dados cadastrais').className).toContain('sv-sheet__description');
    expect(document.body.querySelector('.sv-overlay')).not.toBeNull();
  });

  test('aria-modal cannot be overridden by the caller', () => {
    render(sheet({ 'aria-modal': 'false' } as never));
    expect(open().getAttribute('aria-modal')).toBe('true');
  });

  test('Escape closes it', () => {
    render(sheet());
    const dialog = open();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('the Cancel button closes it; label is customizable and blank falls back', () => {
    render(sheet({ closeLabel: 'Cancelar' }));
    open();
    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByRole('dialog')).toBeNull();
    cleanup();
    render(sheet({ closeLabel: '  ' }));
    open();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  test('showCloseButton=false removes the Cancel button', () => {
    render(sheet({ showCloseButton: false }));
    open();
    expect(document.body.querySelector('.sv-sheet__close')).toBeNull();
  });

  test('works controlled and reports changes', () => {
    const onOpenChange = vi.fn();
    render(sheet({}, { open: true, onOpenChange }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  test('uncontrolled defaultOpen starts open and still notifies', () => {
    const onOpenChange = vi.fn();
    render(sheet({}, { defaultOpen: true, onOpenChange }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('BottomSheet drag to dismiss', () => {
  function drag(to: number) {
    const el = handle();
    fireEvent.pointerDown(el, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(el, { clientY: to, pointerId: 1 });
    return el;
  }

  test('dragging past the threshold and releasing closes the sheet', () => {
    render(sheet());
    open();
    const el = drag(220);
    expect(screen.getByRole('dialog').style.getPropertyValue('--sv-sheet-drag')).toBe('120px');
    expect(screen.getByRole('dialog').getAttribute('data-dragging')).toBe('true');
    fireEvent.pointerUp(el, { pointerId: 1 });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('a short drag snaps back and keeps it open', () => {
    render(sheet());
    open();
    const el = drag(140);
    fireEvent.pointerUp(el, { pointerId: 1 });
    expect(screen.getByRole('dialog').style.getPropertyValue('--sv-sheet-drag')).toBe('0px');
    expect(screen.getByRole('dialog').getAttribute('data-dragging')).toBeNull();
  });

  test('dragging upward never lifts the sheet', () => {
    render(sheet());
    open();
    drag(20);
    expect(screen.getByRole('dialog').style.getPropertyValue('--sv-sheet-drag')).toBe('0px');
  });

  test('pointer cancel ends the drag like a release', () => {
    render(sheet());
    open();
    const el = drag(300);
    fireEvent.pointerCancel(el, { pointerId: 1 });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  test('move and release without a press do nothing', () => {
    render(sheet());
    open();
    const el = handle();
    fireEvent.pointerMove(el, { clientY: 500 });
    fireEvent.pointerUp(el);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  test('draggable=false ignores the gesture', () => {
    render(sheet({ draggable: false }));
    open();
    drag(400);
    expect(screen.getByRole('dialog').style.getPropertyValue('--sv-sheet-drag')).toBe('0px');
    expect(handle().getAttribute('data-draggable')).toBeNull();
  });

  test('caller style is preserved', () => {
    render(sheet({ style: { color: 'red' } }));
    expect(open().style.color).toBe('red');
    act(() => {});
  });
});

describe('BottomSheet CSS contract', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/css/style.css'), 'utf-8');
  const theme = readFileSync(resolve(process.cwd(), 'src/css/theme.css'), 'utf-8');
  const block = (selector: string) => {
    const m = css.match(new RegExp(`\\n${selector.replace(/[.[\]']/g, '\\$&')}\\s*\\{([^}]*)\\}`));
    if (!m) throw new Error(`rule not found: ${selector}`);
    return m[1] as string;
  };

  test('is anchored to the bottom on the modal layer, with safe-area padding and no shadow', () => {
    const body = block('.sv-sheet');
    expect(body).toContain('bottom: 0');
    expect(body).toContain('z-index: var(--sv-z-modal)');
    expect(body).toContain('env(safe-area-inset-bottom');
    expect(body).toContain('max-height: 90dvh');
    expect(body).not.toContain('box-shadow');
  });

  test('slides in and out through keyframes that exist', () => {
    expect(block(".sv-sheet[data-state='open']")).toContain('sv-sheet-in');
    expect(block(".sv-sheet[data-state='closed']")).toContain('sv-sheet-out');
    expect(theme).toContain('@keyframes sv-sheet-in');
    expect(theme).toContain('@keyframes sv-sheet-out');
  });

  test('animation is disabled under prefers-reduced-motion', () => {
    const reduce = css.slice(css.indexOf('prefers-reduced-motion'));
    expect(reduce).toMatch(/\.sv-sheet,[\s\S]*?animation: none/);
  });

  test('the handle blocks page scroll during a drag', () => {
    expect(block(".sv-sheet__handle[data-draggable='true']")).toContain('touch-action: none');
  });
});
