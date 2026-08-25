import * as React from "react"
import { cn } from "../../lib/utils"
import { Slot } from "./slot"

/**
 * Closed set of tags `Card` may render as `as`. `section`/`article` cover the
 * two landmark cases the report asked for; `li`/`aside` are the other shapes
 * a presentational surface legitimately needs (a card inside a `<ul>`, a card
 * used as a page aside). A `Set` lookup, not a bare cast: `as={value as any}`
 * would render whatever string reaches JSX as a literal tag name, including
 * an invalid one — the fallback below is what keeps that impossible.
 */
const CARD_ELEMENTS = new Set(["div", "section", "article", "li", "aside"] as const)
export type CardElement = "div" | "section" | "article" | "li" | "aside"

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Tag to render. Defaults to `div`. Ignored when `asChild` is also passed (AD-006). */
  as?: CardElement
  /** Merge sv-card's class, ref and props onto a single child instead of rendering a wrapper. Wins over `as` when both are given (AD-006). */
  asChild?: boolean
}

const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ className, as, asChild = false, ...props }, ref) => {
    if (asChild) {
      return <Slot ref={ref} className={cn("sv-card", className)} {...props} />
    }
    const Comp = as !== undefined && CARD_ELEMENTS.has(as) ? as : "div"
    return React.createElement(Comp, {
      ref,
      className: cn("sv-card", className),
      ...props,
    })
  },
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("sv-card__header", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("sv-card__title", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("sv-card__description", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("sv-card__content", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("sv-card__footer", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
