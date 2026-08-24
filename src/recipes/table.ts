/**
 * Table recipes: the class map behind the Table component family, exported so
 * a consumer composing a raw <table> gets the same tokenized decoration
 * instead of re-deriving borders, header band and caption by hand. Pure —
 * Server Component safe.
 */

export function table(): string {
  return 'sv-table';
}

export const tableClasses = {
  container: 'sv-table-container',
  head: 'sv-table__head',
  body: 'sv-table__body',
  foot: 'sv-table__foot',
  row: 'sv-table__row',
  th: 'sv-table__th',
  td: 'sv-table__td',
  caption: 'sv-table__caption',
} as const;
