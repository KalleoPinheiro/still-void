import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SidebarProvider, SidebarPanel, SidebarInset } from '../src/react/client/SidebarProvider'

/**
 * T8: SidebarInset component
 * Spec: R5-04
 */

describe('SidebarInset', () => {
  it('should render as main element with sv-app-sidebar-inset class', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarInset>
          <div>Content</div>
        </SidebarInset>
      </SidebarProvider>,
    )

    const inset = container.querySelector('main.sv-app-sidebar-inset')
    expect(inset).toBeInTheDocument()
    expect(inset?.tagName).toBe('MAIN')
  })

  it('should render children', () => {
    render(
      <SidebarProvider>
        <SidebarInset>
          <div data-testid="inset-content">Inset Content</div>
        </SidebarInset>
      </SidebarProvider>,
    )

    expect(screen.getByTestId('inset-content')).toBeInTheDocument()
  })

  it('should merge custom className', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarInset className="custom-class">
          <div>Content</div>
        </SidebarInset>
      </SidebarProvider>,
    )

    const inset = container.querySelector('main.sv-app-sidebar-inset.custom-class')
    expect(inset).toBeInTheDocument()
  })

  it('should accept data attributes', () => {
    const { container } = render(
      <SidebarProvider>
        <SidebarInset data-testid="inset">
          <div>Content</div>
        </SidebarInset>
      </SidebarProvider>,
    )

    expect(screen.getByTestId('inset')).toBeInTheDocument()
  })

  it('should work with different content structures', () => {
    render(
      <SidebarProvider>
        <SidebarInset>
          <article>
            <h1>Main Article</h1>
            <p>Content</p>
          </article>
        </SidebarInset>
      </SidebarProvider>,
    )

    expect(screen.getByText('Main Article')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  // AC-3: below the breakpoint the inset spans full width. jsdom doesn't
  // compute real layout, so this can't be asserted by measuring pixels —
  // instead it asserts the mechanism that makes it true: .sv-app-shell is
  // `display: flex` (see the CSS contract test) and SidebarPanel renders
  // into a portal when mobile (the global matchMedia stub defaults to
  // mobile), so the inset is left as the *only* direct child of the flex
  // row — `flex: 1` on a lone flex item necessarily fills 100% of it.
  it('should be the sole flex child of .sv-app-shell when the panel is in drawer mode', () => {
    const { container } = render(
      <SidebarProvider defaultOpen={false}>
        <SidebarPanel>Nav</SidebarPanel>
        <SidebarInset data-testid="inset">Main content</SidebarInset>
      </SidebarProvider>,
    )

    const shell = container.querySelector('.sv-app-shell')
    expect(shell).toBeInTheDocument()
    expect(Array.from(shell!.children)).toEqual([screen.getByTestId('inset')])
  })
})
