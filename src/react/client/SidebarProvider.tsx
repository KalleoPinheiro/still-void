'use client'

import {
  createContext,
  useContext,
  useId,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useMediaQuery } from './hooks'
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
