import { render, screen, fireEvent } from '@testing-library/react'
import { type ReactNode, useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import {
  SidebarProvider,
  SidebarPanel,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '../src/react/client/SidebarProvider'

/**
 * T6: SidebarPanel + SidebarTrigger (off-canvas drawer mode)
 * Spec: R5-02
 * Test focus: trigger behavior, context binding, component composition
 * (drawer/dialog rendering behavior tested via CSS contract and integration tests)
 */

describe('SidebarPanel and SidebarTrigger', () => {
  describe('SidebarPanel', () => {
    // AC-9: SidebarPanel renders and accepts children
    it('should render with children', () => {
      const { container } = render(
        <SidebarProvider defaultOpen={true}>
          <SidebarPanel>
            <div data-testid="panel-content">Panel Content</div>
          </SidebarPanel>
        </SidebarProvider>,
      )

      expect(screen.getByTestId('panel-content')).toBeInTheDocument()
    })

    // Edge case: SidebarPanel outside provider throws error
    it('should throw error when rendered outside provider', () => {
      expect(() => {
        render(
          <SidebarPanel>
            <div>Content</div>
          </SidebarPanel>,
        )
      }).toThrow(/useSidebar.*provider/i)
    })

    // AC-9: Panel can accept title prop
    it('should accept title prop (for Dialog title)', () => {
      const { container } = render(
        <SidebarProvider defaultOpen={true}>
          <SidebarPanel title="Custom Title">
            <div>Content</div>
          </SidebarPanel>
        </SidebarProvider>,
      )

      // Title is rendered in sr-only when in drawer mode
      // For now, just check it doesn't error
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    // AC-9: Panel renders content (in body wrapper or Dialog Content)
    it('should render content inside panel', () => {
      const { container } = render(
        <SidebarProvider defaultOpen={true}>
          <SidebarPanel>
            <div data-testid="panel-content">Content</div>
          </SidebarPanel>
        </SidebarProvider>,
      )

      // Content should be rendered (either in .sv-app-sidebar__body or in Dialog)
      expect(screen.getByTestId('panel-content')).toBeInTheDocument()
    })
  })

  describe('SidebarTrigger', () => {
    // AC-7: Trigger toggles open state
    it('should toggle open on click', () => {
      const { container } = render(
        <SidebarProvider defaultOpen={false}>
          <SidebarTrigger data-testid="trigger" />
          <SidebarPanel>Content</SidebarPanel>
        </SidebarProvider>,
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    // AC-7: aria-expanded reflects open state
    it('should expose aria-expanded reflecting open state', () => {
      const { container } = render(
        <SidebarProvider defaultOpen={true}>
          <SidebarTrigger data-testid="trigger" />
          <SidebarPanel>Content</SidebarPanel>
        </SidebarProvider>,
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    // AC-7: aria-controls points to panel ID
    it('should expose aria-controls pointing to valid panelId', () => {
      const { container } = render(
        <SidebarProvider defaultOpen={false}>
          <SidebarTrigger data-testid="trigger" />
          <SidebarPanel data-testid="panel">Content</SidebarPanel>
        </SidebarProvider>,
      )

      const trigger = screen.getByTestId('trigger')
      const ariaControls = trigger.getAttribute('aria-controls')

      expect(ariaControls).toBeTruthy()
      expect(ariaControls).toMatch(/^\S+$/)
    })

    // AC-7: aria-expanded and aria-controls are derived (derived === override props)
    it('should derive aria-expanded and aria-controls even when passed as props', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <SidebarTrigger data-testid="trigger" aria-expanded="true" aria-controls="ignored" />
          <SidebarPanel data-testid="panel">Content</SidebarPanel>
        </SidebarProvider>,
      )

      const trigger = screen.getByTestId('trigger')
      // aria-expanded should come from provider state (false), not from props
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      // aria-controls should NOT be 'ignored', it should be derived
      expect(trigger.getAttribute('aria-controls')).not.toBe('ignored')
    })

    // AC-8: Trigger without children renders Icon menu
    it('should render Icon menu when no children provided', () => {
      const { container } = render(
        <SidebarProvider defaultOpen={false}>
          <SidebarTrigger data-testid="trigger" />
          <SidebarPanel>Content</SidebarPanel>
        </SidebarProvider>,
      )

      const trigger = screen.getByTestId('trigger')
      const svg = trigger.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    // AC-8: Default aria-label is set
    it('should have default aria-label when no label prop', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <SidebarTrigger data-testid="trigger" />
          <SidebarPanel>Content</SidebarPanel>
        </SidebarProvider>,
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('aria-label')
      // Default should mention sidebar/toggle
      const label = trigger.getAttribute('aria-label')
      expect(label?.toLowerCase()).toMatch(/sidebar|toggle|menu/)
    })

    // AC-8: Label prop sets custom aria-label
    it('should accept label prop and set custom aria-label', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <SidebarTrigger data-testid="trigger" label="Custom Label" />
          <SidebarPanel>Content</SidebarPanel>
        </SidebarProvider>,
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('aria-label', 'Custom Label')
    })

    // AC-8: Trigger with custom children
    it('should render custom children when provided', () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <SidebarTrigger data-testid="trigger">Custom Button</SidebarTrigger>
          <SidebarPanel>Content</SidebarPanel>
        </SidebarProvider>,
      )

      expect(screen.getByText('Custom Button')).toBeInTheDocument()
    })

    // Edge case: SidebarTrigger without panel doesn't throw
    it('should render and toggle without error even without panel mounted', () => {
      const { container } = render(
        <SidebarProvider defaultOpen={false}>
          <SidebarTrigger data-testid="trigger" />
          {/* No SidebarPanel */}
        </SidebarProvider>,
      )

      const trigger = screen.getByTestId('trigger')
      expect(() => {
        fireEvent.click(trigger)
      }).not.toThrow()

      // State should still change
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    // Edge case: collapsible="none" → trigger renders null
    it('should render null when collapsible is "none"', () => {
      const { container } = render(
        <SidebarProvider defaultOpen={false} collapsible="none">
          <SidebarTrigger data-testid="trigger" />
          <SidebarPanel>Content</SidebarPanel>
        </SidebarProvider>,
      )

      const trigger = container.querySelector('[data-testid="trigger"]')
      expect(trigger).not.toBeInTheDocument()
    })
  })

  describe('Controlled sidebar', () => {
    // AC-2: Controlled mode respects open prop
    it('should work with controlled open state', () => {
      const TestComponent = () => {
        const [open, setOpen] = useState(false)
        return (
          <>
            <button onClick={() => setOpen(!open)} data-testid="external-toggle">
              External Toggle
            </button>
            <SidebarProvider open={open} onOpenChange={setOpen}>
              <SidebarTrigger data-testid="trigger" />
              <SidebarPanel>Content</SidebarPanel>
            </SidebarProvider>
          </>
        )
      }

      render(<TestComponent />)

      const trigger = screen.getByTestId('trigger')
      const externalToggle = screen.getByTestId('external-toggle')

      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      // Toggle via external control
      fireEvent.click(externalToggle)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      // Toggle back
      fireEvent.click(externalToggle)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      // Trigger also works
      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('useSidebar hook in panel/trigger context', () => {
    // Ensure useSidebar exposes all expected properties
    it('useSidebar should expose panelId usable by trigger', () => {
      const TestComponent = () => {
        const { panelId } = useSidebar()
        return <div data-testid="panel-id">{panelId}</div>
      }

      const { container } = render(
        <SidebarProvider defaultOpen={false}>
          <SidebarTrigger data-testid="trigger" />
          <TestComponent />
          <SidebarPanel>Content</SidebarPanel>
        </SidebarProvider>,
      )

      const panelIdElement = screen.getByTestId('panel-id')
      const panelId = panelIdElement.textContent

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveAttribute('aria-controls', panelId)
    })
  })

  describe('Coverage: additional paths', () => {
    // Test SidebarInset rendering (line 231)
    it('should render SidebarInset element with main tag', () => {
      const { container } = render(
        <SidebarProvider defaultOpen={false}>
          <SidebarInset>
            <p>Content</p>
          </SidebarInset>
        </SidebarProvider>,
      )

      const inset = container.querySelector('main.sv-app-sidebar-inset')
      expect(inset).toBeInTheDocument()
      expect(inset?.tagName).toBe('MAIN')
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    // Test SidebarInset with custom className
    it('should merge custom className on SidebarInset', () => {
      const { container } = render(
        <SidebarProvider defaultOpen={false}>
          <SidebarInset className="custom-class">
            <p>Content</p>
          </SidebarInset>
        </SidebarProvider>,
      )

      const inset = container.querySelector('main.sv-app-sidebar-inset.custom-class')
      expect(inset).toBeInTheDocument()
    })

    // Desktop path (line ~173): above breakpoint, SidebarPanel renders a plain
    // <aside> in flow instead of the Dialog-based drawer. The global matchMedia
    // stub (tests/setup.ts) always resolves `matches: false`, so this branch
    // needs a local override to exercise it — it is a real, user-facing render
    // path (the default desktop layout), not a legacy-browser fallback, so it
    // must be covered by a real test rather than a coverage-ignore pragma.
    it('should render a plain <aside> in flow above the breakpoint (desktop)', () => {
      const originalMatchMedia = window.matchMedia
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      try {
        const { container } = render(
          <SidebarProvider defaultOpen={true}>
            <SidebarPanel className="custom-class">
              <div data-testid="desktop-panel-content">Desktop Content</div>
            </SidebarPanel>
          </SidebarProvider>,
        )

        const aside = container.querySelector('aside.sv-app-sidebar')
        expect(aside).toBeInTheDocument()
        expect(aside).toHaveClass('custom-class')
        expect(aside?.getAttribute('role')).not.toBe('dialog')
        expect(screen.getByTestId('desktop-panel-content')).toBeInTheDocument()
        // No drawer chrome (overlay/close button) in the in-flow desktop render
        expect(container.querySelector('.sv-overlay')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Close sidebar')).not.toBeInTheDocument()
      } finally {
        window.matchMedia = originalMatchMedia
      }
    })
  })
})
