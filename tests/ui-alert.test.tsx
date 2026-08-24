import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from '../src/components/ui/alert';

afterEach(cleanup);

describe('Alert', () => {
  test('renders with role=alert', () => {
    render(<Alert>Body</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Body');
  });

  test('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Alert ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  test('merges custom className', () => {
    render(<Alert className="custom">X</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom');
  });
});

describe('AlertTitle', () => {
  test('renders as heading text and forwards ref', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(<AlertTitle ref={ref}>Title</AlertTitle>);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe('AlertDescription', () => {
  test('renders description text and forwards ref', () => {
    const ref = createRef<HTMLParagraphElement>();
    render(<AlertDescription ref={ref}>Desc</AlertDescription>);
    expect(screen.getByText('Desc')).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Alert family renders sv-* classes (FDP-12)', () => {
  test('Alert renders role=alert with the sv-alert class', () => {
    render(<Alert>Body</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('sv-alert');
    expect(alert).toHaveAttribute('role', 'alert');
  });

  test('AlertTitle renders the sv-alert__title class', () => {
    render(<AlertTitle>Title</AlertTitle>);
    expect(screen.getByText('Title')).toHaveClass('sv-alert__title');
  });

  test('AlertDescription renders the sv-alert__description class', () => {
    render(<AlertDescription>Desc</AlertDescription>);
    expect(screen.getByText('Desc')).toHaveClass('sv-alert__description');
  });

  test('no leftover Tailwind color utility on Alert', () => {
    render(<Alert>Body</Alert>);
    const classList = Array.from(screen.getByRole('alert').classList);
    const leftover = classList.find(
      (cls) => cls.startsWith('bg-sv-') || cls.startsWith('border-sv-') || cls.startsWith('text-sv-'),
    );
    expect(leftover).toBeUndefined();
  });
});

describe('style.css Alert section — CSS contract', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/css/style.css'), 'utf-8');
  const marker = '/* ---------- Alert ---------- */';
  const start = css.indexOf(marker);
  const nextMarker = css.indexOf('/* ---------- ', start + marker.length);
  const alertSection = css.slice(start, nextMarker === -1 ? undefined : nextMarker);

  test('Alert CSS section exists', () => {
    expect(start).toBeGreaterThan(-1);
  });

  test.each(['.sv-alert', '.sv-alert__title', '.sv-alert__description'])('declares %s', (selector) => {
    expect(alertSection).toContain(selector);
  });

  test('no rule in the Alert section uses box-shadow (Flat-By-Default)', () => {
    expect(alertSection).not.toMatch(/box-shadow/);
  });

  test('no rule in the Alert section hardcodes a color literal', () => {
    expect(alertSection).not.toMatch(/#[0-9a-fA-F]{3}|oklch\(|rgba?\(|hsla?\(/);
  });
});
