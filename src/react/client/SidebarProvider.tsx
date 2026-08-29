'use client'

import {
  createContext,
  useContext,
  useId,
  useState,
  useCallback,
  type ReactNode,
  type ComponentPropsWithoutRef,
  forwardRef,
} from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useMediaQuery } from './hooks'
import { Icon } from '../../components/ui/icon'
import { cn } from '../../lib/utils'

/**
 * R5-02, R5-03: Sidebar state provider and context
 */

export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none'

export interface SidebarContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  isMobile: boolean
  collapsible: SidebarCollapsible
  panelId: string
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
      if (isControlled) {
        onOpenChange?.(newOpen)
      } else {
        setUncontrolledOpen(newOpen)
      }
    },
    [isControlled, onOpenChange],
  )

  const toggle = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(!controlledOpen)
    } else {
      setUncontrolledOpen((prev) => !prev)
    }
  }, [isControlled, controlledOpen, onOpenChange])

  const contextValue: SidebarContextValue = {
    open,
    setOpen,
    toggle,
    isMobile,
    collapsible: collapsibleProp,
    panelId,
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

export const SidebarPanel = forwardRef<HTMLDivElement, SidebarPanelProps>(
  function SidebarPanel({ className, title = 'Navigation', children, ...props }, ref) {
    const { open, setOpen, isMobile, panelId } = useSidebar()

    if (isMobile) {
      // Below breakpoint: drawer in portal
      return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="sv-overlay" />
            <Dialog.Content
              className={cn('sv-app-sidebar sv-app-sidebar__drawer', className)}
              role="dialog"
              aria-modal="true"
              id={panelId}
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
  function SidebarTrigger({ className, label, children, ...props }, ref) {
    const { open, toggle, collapsible, panelId } = useSidebar()

    // collapsible="none" → render nothing
    if (collapsible === 'none') {
      return null
    }

    return (
      <button
        ref={ref}
        type="button"
        {...props}
        className={cn('sv-app-sidebar-trigger', className)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label || 'Toggle sidebar'}
        onClick={toggle}
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
