import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Callout, CategoryPill, CodeBlock, Header, Hero, PostCard } from '../src/react';
import { CopyButton } from '../src/react/client';
import { accents } from '../src/tokens/colors';
import type { PostSummary } from '../src/types';

afterEach(cleanup);

const post: PostSummary = {
  title: 'Understanding RSC',
  href: '/posts/rsc',
  excerpt: 'Server Components explained.',
  date: '2026-07-19',
  readMinutes: 7,
  category: { label: 'Arch', color: 'arch' },
};

describe('PostCard', () => {
  test('renders title link, excerpt and meta', () => {
    render(<PostCard post={post} />);
    expect(screen.getByRole('link', { name: 'Understanding RSC' })).toHaveAttribute(
      'href',
      '/posts/rsc',
    );
    expect(screen.getByText('Server Components explained.')).toBeInTheDocument();
    expect(screen.getByText('7 min')).toBeInTheDocument();
  });

  test('dense variant hides excerpt and applies modifier', () => {
    const { container } = render(<PostCard post={post} dense />);
    expect(container.querySelector('.qt-post-card--dense')).toBeInTheDocument();
    expect(screen.queryByText('Server Components explained.')).not.toBeInTheDocument();
  });
});

describe('CategoryPill', () => {
  test('resolves category color to the pill CSS var', () => {
    const { container } = render(<CategoryPill label="IA" color="ia" />);
    const pill = container.querySelector('.qt-pill') as HTMLElement;
    expect(pill.style.getPropertyValue('--qt-pill-color')).toBe(accents.violet);
  });
});

describe('Callout', () => {
  test.each(['note', 'warn', 'aha'] as const)('renders %s kind with label', (kind) => {
    const { container } = render(<Callout kind={kind}>Content</Callout>);
    expect(container.querySelector(`.qt-callout--${kind}`)).toBeInTheDocument();
  });

  test('accepts custom label', () => {
    render(
      <Callout kind="note" label="Dica">
        Texto
      </Callout>,
    );
    expect(screen.getByText('Dica')).toBeInTheDocument();
  });
});

describe('Header', () => {
  test('marks the active nav item with aria-current', () => {
    render(
      <Header
        items={[
          { label: 'Home', href: '/', active: true },
          { label: 'About', href: '/about' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current');
  });
});

describe('Hero', () => {
  test('renders eyebrow, balanced title and description', () => {
    render(<Hero eyebrow="blog" title="Quiet Tech" description="Calm engineering notes." />);
    expect(screen.getByRole('heading', { level: 1, name: 'Quiet Tech' })).toBeInTheDocument();
    expect(screen.getByText('blog')).toBeInTheDocument();
  });
});

describe('CodeBlock + CopyButton', () => {
  test('copy button writes code to clipboard and shows feedback', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <CodeBlock code="const a = 1;" language="ts" actions={<CopyButton code="const a = 1;" />} />,
    );

    const button = screen.getByRole('button', { name: 'Copy' });
    button.click();
    expect(writeText).toHaveBeenCalledWith('const a = 1;');
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  test('renders filename in header when provided', () => {
    render(<CodeBlock code="x" filename="index.ts" />);
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });
});
