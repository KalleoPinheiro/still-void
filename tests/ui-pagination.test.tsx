import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../src/components/ui/pagination';

afterEach(cleanup);

function renderFullPagination() {
  return render(
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="/p/1" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/p/1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/p/2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="/p/3" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>,
  );
}

describe('Pagination — root (R4-05 AC1)', () => {
  test('is a nav with aria-label="pagination" and sv-pagination', () => {
    render(<Pagination data-testid="pg" />);
    const nav = screen.getByTestId('pg');
    expect(nav.tagName.toLowerCase()).toBe('nav');
    expect(nav.getAttribute('aria-label')).toBe('pagination');
    expect(nav.className).toContain('sv-pagination');
  });
});

describe('Pagination — content (R4-05 AC2)', () => {
  test('PaginationContent is a ul with sv-pagination__content', () => {
    render(
      <PaginationContent data-testid="ct">
        <li>x</li>
      </PaginationContent>,
    );
    const ul = screen.getByTestId('ct');
    expect(ul.tagName.toLowerCase()).toBe('ul');
    expect(ul.className).toContain('sv-pagination__content');
  });
});

describe('Pagination — item (R4-05 AC3)', () => {
  test('PaginationItem is a li with sv-pagination__item', () => {
    render(
      <ul>
        <PaginationItem data-testid="it">x</PaginationItem>
      </ul>,
    );
    const li = screen.getByTestId('it');
    expect(li.tagName.toLowerCase()).toBe('li');
    expect(li.className).toContain('sv-pagination__item');
  });
});

describe('Pagination — link href vs button (R4-05 AC4)', () => {
  test('href renders an <a href>', () => {
    render(<PaginationLink href="/p/2">2</PaginationLink>);
    const link = screen.getByText('2');
    expect(link.tagName.toLowerCase()).toBe('a');
    expect(link.getAttribute('href')).toBe('/p/2');
  });

  test('no href renders a <button type="button">', () => {
    const onClick = () => {};
    render(<PaginationLink onClick={onClick}>2</PaginationLink>);
    const button = screen.getByText('2');
    expect(button.tagName.toLowerCase()).toBe('button');
    expect(button.getAttribute('type')).toBe('button');
  });
});

describe('Pagination — active state (R4-05 AC5)', () => {
  test('isActive sets aria-current="page" and sv-pagination__link--active', () => {
    render(
      <PaginationLink href="/p/2" isActive>
        2
      </PaginationLink>,
    );
    const link = screen.getByText('2');
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.className).toContain('sv-pagination__link--active');
  });

  test('without isActive, no aria-current and no active class', () => {
    render(<PaginationLink href="/p/1">1</PaginationLink>);
    const link = screen.getByText('1');
    expect(link.hasAttribute('aria-current')).toBe(false);
    expect(link.className).not.toContain('sv-pagination__link--active');
  });
});

describe('Pagination — previous/next (R4-05 AC6)', () => {
  test('PaginationPrevious renders a chevron-left icon and default label', () => {
    render(<PaginationPrevious href="/p/1" />);
    const link = screen.getByRole('link', { name: 'Previous' });
    expect(link.querySelector('svg')).not.toBeNull();
  });

  test('PaginationNext renders a chevron-right icon and default label', () => {
    render(<PaginationNext href="/p/3" />);
    const link = screen.getByRole('link', { name: 'Next' });
    expect(link.querySelector('svg')).not.toBeNull();
  });

  test('label prop overrides the accessible name (i18n)', () => {
    render(<PaginationPrevious href="/p/1" label="Anterior" />);
    expect(screen.getByRole('link', { name: 'Anterior' })).toBeInTheDocument();
  });
});

describe('Pagination — ellipsis (R4-05 AC7)', () => {
  test('is aria-hidden and not a focusable link', () => {
    render(<PaginationEllipsis data-testid="ell" />);
    const el = screen.getByTestId('ell');
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.tagName.toLowerCase()).toBe('span');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('Pagination — composition', () => {
  test('a full range renders with the active page marked', () => {
    renderFullPagination();
    expect(screen.getByRole('link', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Next' })).toBeInTheDocument();
    expect(screen.getByText('2').closest('a')).toHaveAttribute('aria-current', 'page');
  });
});

describe('Pagination — href + onClick together (edge case)', () => {
  test('renders <a> (href wins) but still fires onClick', () => {
    let clicked = false;
    render(
      <PaginationLink
        href="/p/2"
        onClick={(event) => {
          // jsdom logs "Not implemented: navigation" on a real <a> click —
          // prevented the same way a client-side router would.
          event.preventDefault();
          clicked = true;
        }}
      >
        2
      </PaginationLink>,
    );
    const link = screen.getByText('2');
    expect(link.tagName.toLowerCase()).toBe('a');
    fireEvent.click(link);
    expect(clicked).toBe(true);
  });
});

describe('Pagination — component identity', () => {
  test.each([
    ['Pagination', Pagination],
    ['PaginationEllipsis', PaginationEllipsis],
  ])('%s has a literal displayName', (name, Component) => {
    expect(Component.displayName).toBe(name);
  });
});
