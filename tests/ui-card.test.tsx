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
