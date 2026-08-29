import { render, screen, fireEvent } from '@testing-library/react'
import { type ReactNode } from 'react'
import { describe, it, expect } from 'vitest'
import {
  SidebarProvider,
  SidebarPanel,
  SidebarTrigger,
  useSidebar,
} from '../src/react/client/SidebarProvider'

/**
 * T7: collapsible="icon" and collapsible="none" modes
 * Spec: R5-03
 */

describe('Sidebar collapsible modes', () => {
  describe('collapsible="icon" mode', () => {
    it('should set data-collapsible="icon"', () => {
      const { container } = render(
        <SidebarProvider collapsible="icon" defaultOpen={true}>
          <div>Content</div>
        </SidebarProvider>,
      )

      const wrapper = container.querySelector('.sv-app-shell')
      expect(wrapper).toHaveAttribute('data-collapsible', 'icon')
    })

    it('should render trigger in icon mode', () => {
      const { container } = render(
        <SidebarProvider collapsible="icon" defaultOpen={false}>
          <SidebarTrigger data-testid="trigger" />
          <SidebarPanel>Content</SidebarPanel>
        </SidebarProvider>,
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('collapsible="none" mode', () => {
    it('should set data-collapsible="none"', () => {
      const { container } = render(
        <SidebarProvider collapsible="none">
          <div>Content</div>
        </SidebarProvider>,
      )

      const wrapper = container.querySelector('.sv-app-shell')
      expect(wrapper).toHaveAttribute('data-collapsible', 'none')
    })

    it('should render null trigger in none mode', () => {
      const { container } = render(
        <SidebarProvider collapsible="none">
          <SidebarTrigger data-testid="trigger" />
          <SidebarPanel>Content</SidebarPanel>
        </SidebarProvider>,
      )

      const trigger = container.querySelector('[data-testid="trigger"]')
      expect(trigger).not.toBeInTheDocument()
    })

    it('toggle should be no-op in none mode', () => {
      const TestComponent = () => {
        const { toggle, open } = useSidebar()
        return (
          <div>
            <button onClick={toggle} data-testid="toggle-btn">
              Toggle
            </button>
            <div data-testid="open-state">{open ? 'open' : 'closed'}</div>
          </div>
        )
      }

      render(
        <SidebarProvider collapsible="none" defaultOpen={false}>
          <TestComponent />
        </SidebarProvider>,
      )

      const toggleBtn = screen.getByTestId('toggle-btn')
      const openState = screen.getByTestId('open-state')

      // Initial state: closed
      expect(openState).toHaveTextContent('closed')

      // Click toggle button — should have no effect in "none" mode
      fireEvent.click(toggleBtn)
      expect(openState).toHaveTextContent('closed')

      // Click again — still no effect
      fireEvent.click(toggleBtn)
      expect(openState).toHaveTextContent('closed')
    })

    // `setOpen` is a separate code path from `toggle` (SidebarProvider
    // manages its own open state directly rather than routing toggle
    // through setOpen), so it needs its own no-op guard and its own test —
    // exercising only `toggle` never calls `setOpen` at all.
    it('setOpen should also be a no-op in none mode', () => {
      const TestComponent = () => {
        const { setOpen, open } = useSidebar()
        return (
          <div>
            <button onClick={() => setOpen(true)} data-testid="open-btn">
              Open
            </button>
            <div data-testid="open-state">{open ? 'open' : 'closed'}</div>
          </div>
        )
      }

      render(
        <SidebarProvider collapsible="none" defaultOpen={false}>
          <TestComponent />
        </SidebarProvider>,
      )

      expect(screen.getByTestId('open-state')).toHaveTextContent('closed')
      fireEvent.click(screen.getByTestId('open-btn'))
      expect(screen.getByTestId('open-state')).toHaveTextContent('closed')
    })
  })

  describe('default collapsible value', () => {
    it('should default to "offcanvas" when collapsible not provided', () => {
      const TestComponent = () => {
        const { collapsible } = useSidebar()
        return <div data-testid="collapsible">{collapsible}</div>
      }

      render(
        <SidebarProvider>
          <TestComponent />
        </SidebarProvider>,
      )

      expect(screen.getByTestId('collapsible')).toHaveTextContent('offcanvas')
    })
  })
})
