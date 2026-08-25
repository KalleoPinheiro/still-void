import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Deliberately separate from `recipes/cx`: this family's own classes are
 * `sv-*`, never Tailwind utilities, but a consumer can still compose these
 * components with their own Tailwind `className` override (see
 * `@still-void/ui/tailwind.css`) — `twMerge` is what makes that override
 * actually win instead of colliding. `cx()` has no such job and stays a
 * plain joiner. See docs/design-system.md's Recipes section.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
