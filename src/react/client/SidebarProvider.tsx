'use client'

import {
  createContext,
  useContext,
  useId,
  useState,
  useCallback,
  useRef,
  type ReactNode,
  type ComponentPropsWithoutRef,
  type Ref,
  type RefObject,
  type MutableRefObject,
  forwardRef,
} from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useMediaQuery } from './hooks'
import { Icon } from '../../components/ui/icon'
import { cn } from '../../lib/utils'

/**
 * R5-02, R5-03: Sidebar state provider and context
 */

/**
 * Same ref-merge as `src/components/ui/slot.tsx`'s `composeRefs`, inlined
 * here rather than imported: that file's version is a *local*, unexported
 * helper (its own docstring explains why — a server-safety concern that
 * doesn't apply to this already-`'use client'` module), and this component
 * needs to merge SidebarTrigger's own forwarded ref with the internal
 * `triggerRef` the provider uses to restore focus after the drawer closes.
 */
function composeRefs<T>(...refs: (Ref<T> | null | undefined)[]) {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref !== null && ref !== undefined) {
        ;(ref as MutableRefObject<T | null>).current = node
      }
    }
  }
}

export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none'

export interface SidebarContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  isMobile: boolean
  collapsible: SidebarCollapsible
  panelId: string
  /**
   * R5-02 AC-5: SidebarTrigger is a plain button, not Radix's own
   * `Dialog.Trigger` (structurally it can't be — Dialog.Root only exists
   * inside SidebarPanel's conditional drawer render, and SidebarTrigger is
   * that component's sibling, not its child) — so Radix's built-in
   * "restore focus to the trigger that opened the dialog" behavior has no
   * trigger ref to restore to. SidebarPanel's Dialog.Content reads this ref
   * directly in its own `onCloseAutoFocus` to do that restoration itself.
   */
  triggerRef: RefObject<HTMLButtonElement | null>
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export interface SidebarProviderProps {
  children: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  collapsible?: SidebarCollapsible
  breakpoint?: number
}

/**
 * Wrapper component that provides sidebar state to the tree.
 * Renders as <div class="sv-app-shell" data-state data-collapsible data-mobile>
 */
export function SidebarProvider({
  children,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  collapsible: collapsibleProp = 'offcanvas',
  breakpoint: breakpointProp,
}: SidebarProviderProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const panelId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Normalize breakpoint: invalid values (0, negative, NaN, Infinity) fall back to 1024
  const breakpoint = (() => {
    if (
      breakpointProp === undefined ||
      breakpointProp === 0 ||
      breakpointProp < 0 ||
      Number.isNaN(breakpointProp) ||
      !Number.isFinite(breakpointProp)
    ) {
      return 1024
    }
    return breakpointProp
  })()

  // Read breakpoint: desktop when viewport >= breakpoint
  const isMobile = !useMediaQuery(`(min-width: ${breakpoint}px)`)

  // Determine if controlled or uncontrolled
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = useCallback(
    (newOpen: boolean) => {
      // R5-03 AC-4: collapsible="none" means always expanded, setOpen is no-op
      if (collapsibleProp === 'none') return

      if (isControlled) {
        onOpenChange?.(newOpen)
      } else {
        setUncontrolledOpen(newOpen)
      }
    },
    [collapsibleProp, isControlled, onOpenChange],
  )

  const toggle = useCallback(() => {
    // R5-03 AC-4: collapsible="none" means always expanded, toggle is no-op
    if (collapsibleProp === 'none') return

    if (isControlled) {
      onOpenChange?.(!controlledOpen)
    } else {
      setUncontrolledOpen((prev) => !prev)
    }
  }, [collapsibleProp, isControlled, controlledOpen, onOpenChange])

  const contextValue: SidebarContextValue = {
    open,
    setOpen,
    toggle,
    isMobile,
    collapsible: collapsibleProp,
    panelId,
    triggerRef,
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        className="sv-app-shell"
        data-state={open ? 'open' : 'closed'}
        data-collapsible={collapsibleProp}
        data-mobile={isMobile}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

/**
 * Hook to access sidebar state.
 * Throws if called outside SidebarProvider.
 */
export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}

/**
 * R5-02: Sidebar panel that is static in-flow above breakpoint,
 * drawer in portal below breakpoint.
 */
export interface SidebarPanelProps extends ComponentPropsWithoutRef<'aside'> {
  title?: string
}

export const SidebarPanel = forwardRef<HTMLElement, SidebarPanelProps>(
  function SidebarPanel({ className, title = 'Navigation', children, ...props }, ref) {
    const { open, setOpen, isMobile, collapsible, panelId, triggerRef } = useSidebar()

    // R5-03 AC-4: collapsible="none" is always expanded in flow — never a
    // dismissable drawer, even below the breakpoint. Without this guard,
    // toggle/setOpen are no-ops (see SidebarProvider) and SidebarTrigger
    // renders null, so a mobile drawer here would have no control to close it.
    if (isMobile && collapsible !== 'none') {
      // Below breakpoint: drawer in portal
      return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="sv-overlay" />
            <Dialog.Content
              // Dialog.Content's ref type is Ref<HTMLDivElement> (Radix's
              // primitive always renders a div); the consumer-facing ref
              // here is typed HTMLElement to also cover the desktop
              // <aside> branch below, so this cast documents that the
              // underlying node genuinely is a div in the drawer branch.
              ref={ref as Ref<HTMLDivElement>}
              className={cn('sv-app-sidebar sv-app-sidebar__drawer', className)}
              role="dialog"
              aria-modal="true"
              id={panelId}
              // R5-02 AC-5: restore focus to SidebarTrigger on close. Radix's
              // own default tries `context.triggerRef.current?.focus()`, but
              // that's Radix's *own* Dialog.Trigger ref — SidebarTrigger
              // isn't one (see the SidebarContextValue.triggerRef docstring
              // for why it structurally can't be), so that ref is always
              // null and focus would otherwise fall back to <body>.
              onCloseAutoFocus={(event) => {
                event.preventDefault()
                triggerRef.current?.focus()
              }}
              {...props}
            >
              <Dialog.Title className="sv-sr-only">{title}</Dialog.Title>
              <div className="sv-app-sidebar__body">{children}</div>
              <Dialog.Close className="sv-dialog__close" asChild>
                <button aria-label="Close sidebar">
                  <Icon name="x" />
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )
    }

    // Above breakpoint: in flow
    return (
      <aside
        ref={ref}
        className={cn('sv-app-sidebar', className)}
        id={panelId}
        {...props}
      >
        <div className="sv-app-sidebar__body">{children}</div>
      </aside>
    )
  },
)
SidebarPanel.displayName = 'SidebarPanel'

/**
 * R5-02: Trigger button to open/close sidebar.
 * Renders as menu icon by default, or custom children.
 * aria-expanded and aria-controls are derived and override props.
 */
export interface SidebarTriggerProps extends ComponentPropsWithoutRef<'button'> {
  label?: string
}

export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  function SidebarTrigger({ className, label, children, onClick, ...props }, ref) {
    const { open, toggle, collapsible, panelId, triggerRef } = useSidebar()

    // collapsible="none" → render nothing
    if (collapsible === 'none') {
      return null
    }

    return (
      <button
        ref={composeRefs(ref, triggerRef)}
        type="button"
        {...props}
        className={cn('sv-app-sidebar-trigger', className)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label || 'Toggle sidebar'}
        onClick={(event) => {
          onClick?.(event)
          toggle()
        }}
      >
        {children || <Icon name="menu" />}
      </button>
    )
  },
)
SidebarTrigger.displayName = 'SidebarTrigger'

/**
 * R5-04: Inset container that adjusts to sidebar state via CSS.
 * Does not read context — state is read by CSS selectors on the wrapper.
 */
export interface SidebarInsetProps extends ComponentPropsWithoutRef<'main'> {}

export const SidebarInset = forwardRef<HTMLElement, SidebarInsetProps>(
  function SidebarInset({ className, ...props }, ref) {
    return (
      <main ref={ref} className={cn('sv-app-sidebar-inset', className)} {...props} />
    )
  },
)
SidebarInset.displayName = 'SidebarInset'
