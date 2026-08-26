---
"@still-void/ui": minor
---

Add the `Pagination` family — `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis` — server-safe markup composition (nav/ul/li/a-or-button), no client boundary. `PaginationLink` renders an `<a>` when `href` is passed and a `<button type="button">` otherwise; `isActive` sets `aria-current="page"`. Closes the gap where numbered pagination had no catalog component, only a repeated "Load more" outline button.
