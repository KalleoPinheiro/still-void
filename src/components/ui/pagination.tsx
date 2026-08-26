import * as React from "react"
import { cn } from "../../lib/utils"
import { Icon } from "./icon"

export interface PaginationProps extends React.ComponentPropsWithoutRef<"nav"> {}

/**
 * The root landmark. `aria-label="pagination"` is the one static string a
 * consumer cannot override — spread order matters here the same way
 * Dialog's `aria-modal` does — the label is what tells assistive tech
 * which `<nav>` this is among possibly several on the page.
 */
const Pagination = ({ className, ...props }: PaginationProps) => (
  <nav {...props} aria-label="pagination" className={cn("sv-pagination", className)} />
)
Pagination.displayName = "Pagination"

export type PaginationContentProps = React.ComponentPropsWithoutRef<"ul">

const PaginationContent = React.forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("sv-pagination__content", className)} {...props} />
  ),
)
PaginationContent.displayName = "PaginationContent"

export type PaginationItemProps = React.ComponentPropsWithoutRef<"li">

const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("sv-pagination__item", className)} {...props} />
  ),
)
PaginationItem.displayName = "PaginationItem"

interface PaginationLinkOwnProps {
  isActive?: boolean
}

export type PaginationLinkProps = PaginationLinkOwnProps &
  Omit<React.ComponentPropsWithoutRef<"a">, "href"> & {
    href?: string
  }

/**
 * Renders an `<a>` when `href` is passed (real navigation: SEO, right-click
 * "open in new tab"), a `<button type="button">` otherwise (client-side page
 * state with no URL to point at) — never a third `as` prop to pick between
 * them, because these are the only two real call sites (AD, design.md).
 */
const PaginationLink = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, PaginationLinkProps>(
  ({ className, isActive = false, href, ...props }, ref) => {
    const sharedClassName = cn(
      "sv-pagination__link",
      isActive && "sv-pagination__link--active",
      className,
    )
    const sharedAria = isActive ? ({ "aria-current": "page" } as const) : {}

    if (href !== undefined) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={sharedClassName}
          {...sharedAria}
          {...(props as React.ComponentPropsWithoutRef<"a">)}
        />
      )
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={sharedClassName}
        {...sharedAria}
        {...(props as React.ComponentPropsWithoutRef<"button">)}
      />
    )
  },
)
PaginationLink.displayName = "PaginationLink"

export interface PaginationPreviousProps extends Omit<PaginationLinkProps, "children"> {
  /** Accessible + visible label. Defaults to English, like closeLabel on DialogContent — override for i18n. */
  label?: string
}

const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  PaginationPreviousProps
>(({ className, label = "Previous", ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label={label}
    className={cn("sv-pagination__link--previous", className)}
    {...props}
  >
    <Icon name="chevron-left" />
    <span>{label}</span>
  </PaginationLink>
))
PaginationPrevious.displayName = "PaginationPrevious"

export interface PaginationNextProps extends Omit<PaginationLinkProps, "children"> {
  label?: string
}

const PaginationNext = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, PaginationNextProps>(
  ({ className, label = "Next", ...props }, ref) => (
    <PaginationLink
      ref={ref}
      aria-label={label}
      className={cn("sv-pagination__link--next", className)}
      {...props}
    >
      <span>{label}</span>
      <Icon name="chevron-right" />
    </PaginationLink>
  ),
)
PaginationNext.displayName = "PaginationNext"

export type PaginationEllipsisProps = React.ComponentPropsWithoutRef<"span">

/** Not a link — there is nothing to focus or activate, only a visual "more pages" marker. */
const PaginationEllipsis = ({ className, ...props }: PaginationEllipsisProps) => (
  <span aria-hidden="true" className={cn("sv-pagination__ellipsis", className)} {...props}>
    &#8230;
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
