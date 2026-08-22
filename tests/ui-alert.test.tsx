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
