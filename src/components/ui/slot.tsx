import * as React from "react"

/**
 * A server-safe port of `@radix-ui/react-slot`'s core behavior (AD-006,
 * superseding the plan to import the real package — see AD-015 in
 * .specs/STATE.md).
 *
 * `@radix-ui/react-slot@1.3.3` ships no `'use client'` directive, but its
 * `Slot` component calls `useComposedRefs`, which calls `React.useCallback`
 * — a real hook, verified against the installed package's dist. A hook with
 * no dispatcher throws when it reaches a real Next.js Server Component, so
 * importing it here would have broken exactly the property
 * tests/server-safety.test.ts exists to protect, silently, the same way
 * lucide-react almost did (AD-013).
 *
 * `@radix-ui/react-compose-refs` exports the hook AND the plain function it
 * wraps — `composeRefs` itself has no hook inside it, only `useComposedRefs`
 * does — but that package's own module still *contains* the hook, so even a
 * named import of only the safe half makes tests/server-safety.test.ts's
 * bare-specifier walker (correctly) flag the module it resolves to: the
 * walker checks what a module contains, not which export of it gets called,
 * and it has no way to prove the unused hook is truly unreachable from here.
 * Rather than carve out an exception for something the tooling can't verify,
 * `composeRefs` (below) is the same ref-merging logic inlined directly, with
 * no import of the package at all — the safety property becomes mechanically
 * true instead of argued.
 *
 * This file uses the plain ref-merge as the ref callback directly, instead
 * of memoizing it through `useCallback` the way Radix does. The cost is
 * real but small: without memoization the merged ref callback has a new
 * identity every render, so React detaches and reattaches it each time
 * instead of reusing the same function — harmless for a DOM node, and
 * Card's usage (one wrapped child, re-rendered no more often than any other
 * styling wrapper) is exactly the case that cost doesn't matter for.
 *
 * Scope is deliberately narrower than the real Slot: no `Slottable`, no
 * lazy-component `use()` support. Card only ever wraps exactly one element,
 * so that surface was never reachable from here.
 */

/** Ported from @radix-ui/react-compose-refs (MIT) — the hook-free half only. */
function composeRefs<T>(...refs: (React.Ref<T> | null | undefined)[]) {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node)
      } else if (ref !== null && ref !== undefined) {
        ;(ref as React.MutableRefObject<T | null>).current = node
      }
    }
  }
}

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...slotProps, ...childProps }
  for (const key in childProps) {
    const slotValue = slotProps[key]
    const childValue = childProps[key]
    const isHandler = /^on[A-Z]/.test(key)
    if (isHandler && typeof slotValue === "function" && typeof childValue === "function") {
      merged[key] = (...args: unknown[]) => {
        const result = (childValue as (...a: unknown[]) => unknown)(...args)
        ;(slotValue as (...a: unknown[]) => unknown)(...args)
        return result
      }
    } else if (key === "style") {
      merged[key] = { ...(slotValue as object), ...(childValue as object) }
    } else if (key === "className") {
      merged[key] = [slotValue, childValue].filter(Boolean).join(" ")
    }
  }
  return merged
}

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...slotProps }, forwardedRef) => {
    // A Fragment counts as "one valid element" for isValidElement/Children.count,
    // but it has no DOM node to attach className/ref/props to — the real Slot
    // handles that case through `Slottable`, which this narrower port doesn't
    // support (Card only ever wraps exactly one real element). Rejecting it
    // explicitly, rather than letting React.cloneElement's own dev-only prop
    // warning be the only signal, is what keeps CARD-03's "erro explícito"
    // true for every multi-child shape a caller might pass, Fragment included.
    if (
      !React.isValidElement(children) ||
      React.Children.count(children) !== 1 ||
      children.type === React.Fragment
    ) {
      throw new Error(
        "Slot expected a single React element child. Pass exactly one element to asChild.",
      )
    }

    // A valid React element's `.props` is always an object (React itself
    // guarantees this, `{}` for a childless element) — no fallback needed.
    const child = children as React.ReactElement<
      Record<string, unknown> & { ref?: React.Ref<unknown> }
    >
    // React 19 moved `ref` onto `props`; reading `element.ref` directly still
    // works but is deprecated and logs a dev warning ("ref is now a regular
    // prop"). `child.props.ref` is the same value without the warning.
    const childRef = child.props.ref ?? null
    const mergedProps = mergeProps(slotProps, child.props)
    mergedProps.ref = forwardedRef ? composeRefs(forwardedRef, childRef) : childRef
    return React.cloneElement(child, mergedProps)
  },
)
Slot.displayName = "Slot"
