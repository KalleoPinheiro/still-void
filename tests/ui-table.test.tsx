import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../src/components/ui/table';

afterEach(cleanup);

// AC P1-Tabela #1 + #5 — each of the 8 exports renders its native element and
// forwards ref to that same native element.
describe('Table family — element and ref per component', () => {
  test('Table renders a <table> and forwards ref to HTMLTableElement', () => {
    const ref = createRef<HTMLTableElement>();
    render(<Table ref={ref} aria-label="t" />);
    expect(screen.getByRole('table')).toBeInstanceOf(HTMLTableElement);
    expect(ref.current).toBeInstanceOf(HTMLTableElement);
  });

  test('TableHeader renders a <thead> and forwards ref to HTMLTableSectionElement', () => {
    const ref = createRef<HTMLTableSectionElement>();
    const { container } = render(
      <table>
        <TableHeader ref={ref} data-testid="head" />
      </table>
    );
    const thead = container.querySelector('thead');
    expect(thead).not.toBeNull();
    expect(thead).toHaveClass('sv-table__head');
    expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
  });

  test('TableBody renders a <tbody> and forwards ref to HTMLTableSectionElement', () => {
    const ref = createRef<HTMLTableSectionElement>();
    const { container } = render(
      <table>
        <TableBody ref={ref} />
      </table>
    );
    const tbody = container.querySelector('tbody');
    expect(tbody).not.toBeNull();
    expect(tbody).toHaveClass('sv-table__body');
    expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
  });

  test('TableFooter renders a <tfoot> and forwards ref to HTMLTableSectionElement', () => {
    const ref = createRef<HTMLTableSectionElement>();
    const { container } = render(
      <table>
        <TableFooter ref={ref} />
      </table>
    );
    const tfoot = container.querySelector('tfoot');
    expect(tfoot).not.toBeNull();
    expect(tfoot).toHaveClass('sv-table__foot');
    expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
  });

  test('TableRow renders a <tr> and forwards ref to HTMLTableRowElement', () => {
    const ref = createRef<HTMLTableRowElement>();
    const { container } = render(
      <table>
        <tbody>
          <TableRow ref={ref} />
        </tbody>
      </table>
    );
    const tr = container.querySelector('tr');
    expect(tr).not.toBeNull();
    expect(tr).toHaveClass('sv-table__row');
    expect(ref.current).toBeInstanceOf(HTMLTableRowElement);
  });

  test('TableHead renders a <th> and forwards ref to HTMLTableCellElement', () => {
    const ref = createRef<HTMLTableCellElement>();
    render(
      <table>
        <thead>
          <tr>
            <TableHead ref={ref}>Name</TableHead>
          </tr>
        </thead>
      </table>
    );
    const th = screen.getByRole('columnheader');
    expect(th.tagName).toBe('TH');
    expect(th).toHaveClass('sv-table__th');
    expect(ref.current).toBeInstanceOf(HTMLTableCellElement);
  });

  test('TableCell renders a <td> and forwards ref to HTMLTableCellElement', () => {
    const ref = createRef<HTMLTableCellElement>();
    render(
      <table>
        <tbody>
          <tr>
            <TableCell ref={ref}>Value</TableCell>
          </tr>
        </tbody>
      </table>
    );
    const td = screen.getByRole('cell');
    expect(td.tagName).toBe('TD');
    expect(td).toHaveClass('sv-table__td');
    expect(ref.current).toBeInstanceOf(HTMLTableCellElement);
  });

  test('TableCaption renders a <caption> and forwards ref to HTMLTableCaptionElement', () => {
    const ref = createRef<HTMLTableCaptionElement>();
    const { container } = render(
      <table>
        <TableCaption ref={ref}>Users</TableCaption>
      </table>
    );
    const caption = container.querySelector('caption');
    expect(caption).not.toBeNull();
    expect(caption).toHaveClass('sv-table__caption');
    expect(ref.current).toBeInstanceOf(HTMLTableCaptionElement);
  });
});

describe('Table — container and class targeting', () => {
  // AC P1-Tabela #2
  test('wraps the <table> in a scroll container carrying sv-table-container', () => {
    const { container } = render(<Table aria-label="t" />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass('sv-table-container');
    expect(wrapper?.querySelector('table')).not.toBeNull();
  });

  // AC P1-Tabela #3 — containerClassName and className are independently addressable
  test('containerClassName targets the container and className targets the table, independently', () => {
    const { container } = render(
      <Table aria-label="t" containerClassName="h-96" className="custom-table" />
    );
    const wrapper = container.firstElementChild as HTMLElement;
    const tableEl = screen.getByRole('table');
    expect(wrapper).toHaveClass('sv-table-container');
    expect(wrapper).toHaveClass('h-96');
    expect(wrapper).not.toHaveClass('custom-table');
    expect(tableEl).toHaveClass('sv-table');
    expect(tableEl).toHaveClass('custom-table');
    expect(tableEl).not.toHaveClass('h-96');
  });
});

describe('Table — semantic integrity', () => {
  // AC P1-Tabela #4 — table and columnheader roles resolve
  test('getByRole resolves table and columnheader', () => {
    render(
      <Table aria-label="Users">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
  });

  // AC P1-Tabela #4 — row and cell roles resolve
  test('getAllByRole resolves row and cell', () => {
    render(
      <Table aria-label="Users">
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
            <TableCell>ada@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    // one row for the body row (no header row present)
    expect(screen.getAllByRole('row')).toHaveLength(1);
    expect(screen.getAllByRole('cell')).toHaveLength(2);
  });

  // AC P1-Tabela #6 — TableCaption names the table for screen readers
  test('TableCaption names the table for assistive tech', () => {
    render(
      <Table>
        <TableCaption>List of users</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole('table', { name: 'List of users' })).toBeInTheDocument();
  });

  // Independent Test from spec.md: a 3x3 table with caption and footer renders
  // with correct ARIA roles end to end.
  test('a full 3-column x 3-row table with caption and footer renders with correct structure', () => {
    render(
      <Table aria-label="Full table">
        <TableCaption>Report</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>A</TableHead>
            <TableHead>B</TableHead>
            <TableHead>C</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
            <TableCell>2</TableCell>
            <TableCell>3</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>4</TableCell>
            <TableCell>5</TableCell>
            <TableCell>6</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>7</TableCell>
            <TableCell>8</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    // 1 header row + 2 body rows + 1 footer row = 4
    expect(screen.getAllByRole('row')).toHaveLength(4);
    // 2 body rows * 3 cells + 1 footer row * 3 cells = 9
    expect(screen.getAllByRole('cell')).toHaveLength(9);
    expect(screen.getByText('Report').tagName).toBe('CAPTION');
  });
});

describe('Table — className composition and edge cases', () => {
  // Design instruction: every subcomponent composes className with its base
  // class rather than replacing it (cn(base, className)).
  test('subcomponents compose a custom className with their base sv-table__* class', () => {
    const { container } = render(
      <table>
        <TableHeader className="h-custom" />
        <TableBody className="b-custom" />
        <TableFooter className="f-custom" />
      </table>
    );
    expect(container.querySelector('thead')).toHaveClass('sv-table__head', 'h-custom');
    expect(container.querySelector('tbody')).toHaveClass('sv-table__body', 'b-custom');
    expect(container.querySelector('tfoot')).toHaveClass('sv-table__foot', 'f-custom');
  });

  // Edge case: Table with direct children, without TableHeader/TableBody wrappers
  test('Table renders even with children that bypass TableHeader/TableBody', () => {
    expect(() =>
      render(
        <Table aria-label="Raw">
          <tbody>
            <tr>
              <td>raw cell</td>
            </tr>
          </tbody>
        </Table>
      )
    ).not.toThrow();
    expect(screen.getByText('raw cell')).toBeInTheDocument();
  });
});
