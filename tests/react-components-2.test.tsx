import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { ArticleHeader, Lead, Prose } from '../src/react/components/Article';
import {
  CardSkeleton,
  FeaturedPostCard,
  Layout,
  PostGrid,
  Sidebar,
  SidebarSection,
  Skeleton,
} from '../src/react/components/Content';
import { Footer, Logo } from '../src/react/components/Shell';
import type { PostSummary } from '../src/types';

afterEach(cleanup);

const post: PostSummary = {
  title: 'Understanding RSC',
  href: '/posts/rsc',
  excerpt: 'Server Components explained.',
};

describe('ArticleHeader', () => {
  test('renders the meta row when author, date or readMinutes is present', () => {
    render(<ArticleHeader title="My Post" author="Kalleo" date="2026-08-22" readMinutes={5} />);
    expect(screen.getByRole('heading', { level: 1, name: 'My Post' })).toBeInTheDocument();
    expect(screen.getByText('Kalleo')).toBeInTheDocument();
    expect(screen.getByText('2026-08-22')).toBeInTheDocument();
    expect(screen.getByText('5 min')).toBeInTheDocument();
  });

  test('omits the meta row entirely when author, date and readMinutes are all absent', () => {
    const { container } = render(<ArticleHeader title="My Post" />);
    expect(container.querySelector('.sv-article-header__meta')).not.toBeInTheDocument();
  });

  test('renders an eyebrow slot when provided', () => {
    render(<ArticleHeader title="My Post" eyebrow={<span>Eyebrow</span>} />);
    expect(screen.getByText('Eyebrow')).toBeInTheDocument();
  });
});

describe('Prose and Lead', () => {
  test('Prose renders children and merges className', () => {
    render(<Prose className="custom">Body text</Prose>);
    expect(screen.getByText('Body text')).toHaveClass('sv-prose', 'custom');
  });

  test('Lead renders as a paragraph with the lead class', () => {
    render(<Lead>Lead text</Lead>);
    expect(screen.getByText('Lead text').tagName).toBe('P');
    expect(screen.getByText('Lead text')).toHaveClass('sv-prose__lead');
  });
});

describe('FeaturedPostCard', () => {
  test('renders without a visual slot', () => {
    const { container } = render(<FeaturedPostCard post={post} />);
    expect(screen.getByRole('link', { name: 'Understanding RSC' })).toBeInTheDocument();
    expect(container.querySelector('.sv-featured-card__visual')).not.toBeInTheDocument();
  });

  test('renders the visual slot when provided', () => {
    render(<FeaturedPostCard post={post} visual={<img alt="cover" />} />);
    expect(screen.getByAltText('cover')).toBeInTheDocument();
  });
});

describe('PostGrid, Layout, Sidebar, SidebarSection', () => {
  test('PostGrid renders children', () => {
    render(<PostGrid>grid content</PostGrid>);
    expect(screen.getByText('grid content')).toBeInTheDocument();
  });

  test('Layout applies withSidebar modifier when true', () => {
    const { container } = render(<Layout withSidebar>content</Layout>);
    expect(container.querySelector('.sv-layout--with-sidebar')).toBeInTheDocument();
  });

  test('Layout omits the modifier when withSidebar is false/undefined', () => {
    const { container } = render(<Layout>content</Layout>);
    expect(container.querySelector('.sv-layout--with-sidebar')).not.toBeInTheDocument();
  });

  test('Sidebar renders children', () => {
    render(<Sidebar>sidebar content</Sidebar>);
    expect(screen.getByText('sidebar content')).toBeInTheDocument();
  });

  test('SidebarSection renders a title and children', () => {
    render(<SidebarSection title="Section">section content</SidebarSection>);
    expect(screen.getByText('Section')).toBeInTheDocument();
    expect(screen.getByText('section content')).toBeInTheDocument();
  });
});

describe('Skeleton and CardSkeleton', () => {
  test('Skeleton applies the small modifier when small is true', () => {
    const { container } = render(<Skeleton small />);
    expect(container.querySelector('.sv-skeleton-line--sm')).toBeInTheDocument();
  });

  test('Skeleton omits the small modifier by default', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('.sv-skeleton-line--sm')).not.toBeInTheDocument();
  });

  test('CardSkeleton renders three skeleton lines', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelectorAll('.sv-skeleton-line')).toHaveLength(3);
  });
});

describe('Logo', () => {
  test('defaults href to "/"', () => {
    render(<Logo label="Still Void" />);
    expect(screen.getByRole('link', { name: 'Still Void' })).toHaveAttribute('href', '/');
  });

  test('accepts a custom href', () => {
    render(<Logo label="Still Void" href="/home" />);
    expect(screen.getByRole('link', { name: 'Still Void' })).toHaveAttribute('href', '/home');
  });
});

describe('Footer', () => {
  test('renders author, links and children when provided', () => {
    render(
      <Footer author="Kalleo" links={[{ label: 'Privacy', href: '/privacy' }]}>
        <span>extra</span>
      </Footer>,
    );
    expect(screen.getByText('Kalleo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByText('extra')).toBeInTheDocument();
  });

  test('omits author and links sections when absent', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('.sv-footer__links')).not.toBeInTheDocument();
  });
});
