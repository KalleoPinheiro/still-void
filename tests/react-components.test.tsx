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
    expect(container.querySelector('.sv-post-card--dense')).toBeInTheDocument();
    expect(screen.queryByText('Server Components explained.')).not.toBeInTheDocument();
  });
});

describe('CategoryPill', () => {
  test('resolves category color to the pill CSS var', () => {
    const { container } = render(<CategoryPill label="IA" color="ia" />);
    const pill = container.querySelector('.sv-pill') as HTMLElement;
    expect(pill.style.getPropertyValue('--sv-pill-color')).toBe(accents.violet);
  });

  test('renders a real button with aria-pressed when interactive', () => {
    render(<CategoryPill label="IA" interactive active />);
    expect(screen.getByRole('button', { name: 'IA' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('interactive without active defaults aria-pressed to false', () => {
    render(<CategoryPill label="IA" interactive />);
    expect(screen.getByRole('button', { name: 'IA' })).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('Callout', () => {
  test.each(['note', 'warn', 'aha'] as const)('renders %s kind with label', (kind) => {
    const { container } = render(<Callout kind={kind}>Content</Callout>);
    expect(container.querySelector(`.sv-callout--${kind}`)).toBeInTheDocument();
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

  test('renders the actions slot when provided', () => {
    render(<Header actions={<button>Toggle</button>} />);
    expect(screen.getByRole('button', { name: 'Toggle' })).toBeInTheDocument();
  });

  test('wraps the nav in a <details> disclosure with a labeled summary toggle', () => {
    render(<Header items={[{ label: 'Home', href: '/' }]} />);
    const nav = screen.getByRole('navigation');
    const details = nav.closest('details');
    expect(details).not.toBeNull();
    expect(details?.querySelector('summary')).toHaveAccessibleName('Menu');
  });

  test('renders no nav wrapper at all when there are no items', () => {
    render(<Header />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});

describe('Hero', () => {
  test('renders eyebrow, balanced title and description', () => {
    render(<Hero eyebrow="blog" title="Still Void" description="Calm engineering notes." />);
    expect(screen.getByRole('heading', { level: 1, name: 'Still Void' })).toBeInTheDocument();
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

  test('stays in the un-copied state when the clipboard write fails', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });
    render(<CopyButton code="x" />);
    const button = screen.getByRole('button', { name: 'Copy' });
    button.click();
    await Promise.resolve();
    await Promise.resolve();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  test('a second copy click resets the pending "copied" timeout instead of stacking it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CopyButton code="x" />);
    const button = screen.getByRole('button', { name: 'Copy' });
    button.click();
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
    screen.getByRole('button', { name: 'Copied' }).click();
    expect(writeText).toHaveBeenCalledTimes(2);
  });

  test('reverts to "Copy" after the feedback window elapses', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CopyButton code="x" />);
    screen.getByRole('button', { name: 'Copy' }).click();
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument());
    vi.advanceTimersByTime(2000);
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument());
    vi.useRealTimers();
  });

  test('unmounting while the "copied" timeout is pending does not throw', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const { unmount } = render(<CopyButton code="x" />);
    screen.getByRole('button', { name: 'Copy' }).click();
    await screen.findByRole('button', { name: 'Copied' });
    expect(() => unmount()).not.toThrow();
  });

  test('renders filename in header when provided', () => {
    render(<CodeBlock code="x" filename="index.ts" />);
    expect(screen.getByText('index.ts')).toBeInTheDocument();
  });

  test('falls back to "code" in the header when neither filename nor language is provided', () => {
    render(<CodeBlock code="x" />);
    expect(screen.getByText('code')).toBeInTheDocument();
  });
});
