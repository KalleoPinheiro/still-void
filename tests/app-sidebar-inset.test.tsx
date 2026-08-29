import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SidebarProvider, SidebarInset } from '../src/react/client/SidebarProvider'

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
})
