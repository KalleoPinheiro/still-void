import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../src/components/ui/card';

afterEach(cleanup);

describe('Card family', () => {
  test('renders full composition', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  test.each([
    ['Card', Card, HTMLDivElement],
    ['CardHeader', CardHeader, HTMLDivElement],
    ['CardTitle', CardTitle, HTMLHeadingElement],
    ['CardDescription', CardDescription, HTMLParagraphElement],
    ['CardContent', CardContent, HTMLDivElement],
    ['CardFooter', CardFooter, HTMLDivElement],
  ] as const)('%s forwards ref and merges className', (name, Component, ctor) => {
    const ref = createRef<HTMLElement>();
    render(
      // @ts-expect-error generic ref across the union of element types
      <Component ref={ref} className="custom">
        {name}
      </Component>,
    );
    expect(ref.current).toBeInstanceOf(ctor);
    expect(screen.getByText(name)).toHaveClass('custom');
  });
});

// FDP-12 / AC P2-1: each subcomponent must emit real sv-* CSS instead of the
// Tailwind utility strings it used before migration.
describe('Card family renders sv-* classes (FDP-12)', () => {
  test.each([
    ['Card', Card, 'sv-card'],
    ['CardHeader', CardHeader, 'sv-card__header'],
    ['CardTitle', CardTitle, 'sv-card__title'],
    ['CardDescription', CardDescription, 'sv-card__description'],
    ['CardContent', CardContent, 'sv-card__content'],
    ['CardFooter', CardFooter, 'sv-card__footer'],
  ] as const)('%s renders %s', (name, Component, expectedClass) => {
    render(<Component>{name}</Component>);
    expect(screen.getByText(name)).toHaveClass(expectedClass);
  });

  test('no leftover Tailwind color utility on Card', () => {
    render(<Card>Body</Card>);
    const classList = Array.from(screen.getByText('Body').classList);
    // (^|:) rather than startsWith, so a variant-prefixed leftover such as
    // `hover:bg-sv-surface-2` is caught too — the hover states are exactly
    // where a half-finished migration would leave one behind.
    const leftover = classList.find((cls) => /(^|:)(bg-sv-|border-sv-|text-sv-)/.test(cls));
    expect(leftover).toBeUndefined();
  });
});

describe('style.css Card section — CSS contract', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/css/style.css'), 'utf-8');
  const marker = '/* ---------- Card ---------- */';
  const start = css.indexOf(marker);
  const nextMarker = css.indexOf('/* ---------- ', start + marker.length);
  const cardSection = css.slice(start, nextMarker === -1 ? undefined : nextMarker);

  test('Card CSS section exists', () => {
    expect(start).toBeGreaterThan(-1);
  });

  test.each([
    '.sv-card',
    '.sv-card__header',
    '.sv-card__title',
    '.sv-card__description',
    '.sv-card__content',
    '.sv-card__footer',
  ])('declares %s', (selector) => {
    expect(cardSection).toContain(selector);
  });

  test('no rule in the Card section uses box-shadow (Flat-By-Default)', () => {
    expect(cardSection).not.toMatch(/box-shadow/);
  });

  test('no rule in the Card section hardcodes a color literal', () => {
    expect(cardSection).not.toMatch(/#[0-9a-fA-F]{3}|oklch\(|rgba?\(|hsla?\(/);
  });
});
