import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'

/**
 * T6: CSS contract for App Sidebar classes
 * Spec: AC-11, AC-12
 * Done when:
 * - .sv-app-sidebar uses --sv-surface/--sv-border/--sv-space-*, no box-shadow
 * - Focus is outline (AD-005)
 * - Fade animation uses [data-state] with --sv-duration-fast/--sv-ease-hover
 * - Reduced motion block exists in same file after base rule
 */

describe('App Sidebar CSS Contract', () => {
  let styleContent: string

  beforeAll(() => {
    const stylePath = path.join(__dirname, '../src/css/style.css')
    styleContent = fs.readFileSync(stylePath, 'utf-8')
  })

  // AC-11: .sv-app-sidebar exists and uses tokens
  it('should define .sv-app-sidebar with var(--sv-surface)', () => {
    const appSidebarSection = styleContent.match(/\.sv-app-sidebar\s*\{[^}]*\}/s)
    expect(appSidebarSection).toBeTruthy()
    const match = appSidebarSection![0]
    expect(match).toContain('var(--sv-surface)')
  })

  it('should define .sv-app-sidebar with var(--sv-border)', () => {
    const appSidebarSection = styleContent.match(/\.sv-app-sidebar\s*\{[^}]*\}/s)
    const match = appSidebarSection![0]
    expect(match).toContain('var(--sv-border)')
  })

  it('should not contain box-shadow in .sv-app-sidebar', () => {
    const appSidebarSection = styleContent.match(/\.sv-app-sidebar\s*\{[^}]*\}/s)
    const match = appSidebarSection![0]
    expect(match).not.toMatch(/box-shadow/)
  })

  // AC-11: Focus is outline (not ring or shadow)
  it('should use outline for focus-visible on sidebar elements', () => {
    const focusMatch = styleContent.match(
      /\.sv-app-sidebar(?:__trigger)?.*:focus-visible\s*\{[^}]*outline[^}]*\}/s,
    )
    expect(focusMatch?.join()).toMatch(/outline.*solid.*var\(--sv-accent-ink\)/)
  })

  // AC-12: data-state animation exists. Anchored on the exact selector
  // (`.sv-app-sidebar[data-state=...]`, shared by drawer and desktop via
  // the `sv-app-sidebar sv-app-sidebar__drawer` class pair — see
  // SidebarPanel's Dialog.Content className) and stopped at the first `}`
  // so an unrelated later rule can't satisfy the match.
  it('should animate .sv-app-sidebar with data-state', () => {
    const dataStateMatch = styleContent.match(
      /\.sv-app-sidebar\[data-state=['"]open['"]\]\s*\{[^}]*animation[^}]*\}/,
    )
    expect(dataStateMatch).toBeTruthy()
  })

  // AC-12: Animation uses var(--sv-duration-fast) and var(--sv-ease-hover)
  it('should use --sv-duration-fast in sidebar animations', () => {
    const appSidebarSection = extractSection('App Sidebar')
    expect(appSidebarSection).toContain('var(--sv-duration-fast)')
  })

  it('should use --sv-ease-hover in sidebar animations', () => {
    const appSidebarSection = extractSection('App Sidebar')
    expect(appSidebarSection).toContain('var(--sv-ease-hover)')
  })

  // Reduced motion: block exists and comes AFTER base rule
  it('should have prefers-reduced-motion block for animated classes', () => {
    // Extract the entire prefers-reduced-motion block
    const reducedMotionStart = styleContent.indexOf('@media (prefers-reduced-motion: reduce)')
    expect(reducedMotionStart).toBeGreaterThan(-1)

    // Find the closing brace
    let braceCount = 0
    let endIndex = reducedMotionStart
    for (let i = reducedMotionStart; i < styleContent.length; i++) {
      if (styleContent[i] === '{') braceCount++
      if (styleContent[i] === '}') {
        braceCount--
        if (braceCount === 0) {
          endIndex = i + 1
          break
        }
      }
    }

    const reducedMotionBlock = styleContent.substring(reducedMotionStart, endIndex)

    // Should contain animation: none for .sv-app-sidebar
    expect(reducedMotionBlock).toMatch(/\.sv-app-sidebar/)
    expect(reducedMotionBlock).toMatch(/animation:\s*none/)
  })

  it('should place prefers-reduced-motion AFTER base App Sidebar rule', () => {
    const appSidebarIndex = styleContent.indexOf('/* ---------- App Sidebar ---------- */')
    const reducedMotionIndex = styleContent.indexOf('@media (prefers-reduced-motion: reduce)')

    expect(appSidebarIndex).toBeGreaterThan(-1)
    expect(reducedMotionIndex).toBeGreaterThan(appSidebarIndex)
  })

  // Trigger styling
  it('should define .sv-app-sidebar-trigger with transition', () => {
    const triggerMatch = styleContent.match(/\.sv-app-sidebar-trigger\s*\{[^}]*\}/s)
    expect(triggerMatch).toBeTruthy()
    expect(triggerMatch![0]).toContain('transition')
  })

  // R5-02/R5-04: .sv-app-shell must be a real flex container, not
  // `display: contents` — SidebarPanel and SidebarInset are both rendered
  // as its direct children, and side-by-side layout falls out of this rule
  // alone (no per-child positioning needed).
  it('should lay out .sv-app-shell as flex so the panel and inset sit side by side', () => {
    const shellMatch = styleContent.match(/\.sv-app-shell\s*\{[^}]*\}/s)
    expect(shellMatch).toBeTruthy()
    expect(shellMatch![0]).toMatch(/display:\s*flex/)
    expect(shellMatch![0]).not.toMatch(/display:\s*contents/)
  })

  // Inset styling
  it('should define .sv-app-sidebar-inset', () => {
    const insetMatch = styleContent.match(/\.sv-app-sidebar-inset\s*\{[^}]*\}/s)
    expect(insetMatch).toBeTruthy()
  })

  // R5-04 AC-2: the inset must not let wide content push the sidebar off
  // its rail/full width — a flex item's implicit `min-width: auto` would
  // otherwise let overflow content grow the row instead of scrolling
  // internally.
  it('should define min-width: 0 on .sv-app-sidebar-inset so it never pushes the sidebar', () => {
    const insetMatch = styleContent.match(/\.sv-app-sidebar-inset\s*\{[^}]*\}/s)
    expect(insetMatch![0]).toMatch(/min-width:\s*0/)
  })

  // R5-03: Icon mode CSS. The selector is matched exactly (anchored at
  // `.sv-app-sidebar:not(` and stopping at the first `}`) rather than with a
  // greedy `.*` up to *any* later `.sv-app-sidebar…{…width…}` — a greedy
  // version here previously matched the label-hiding rule below instead
  // (it also contains a `width` declaration, `width: 1px`), so deleting the
  // real width rule entirely still passed this test.
  it('should define width constraint for icon mode, scoped to the closed state', () => {
    const iconModeMatch = styleContent.match(
      /\.sv-app-shell\[data-collapsible=['"]icon['"]\]\[data-state=['"]closed['"]\] \.sv-app-sidebar:not\([^)]*\)\s*\{[^}]*\}/,
    )
    expect(iconModeMatch).toBeTruthy()
    const match = iconModeMatch![0]
    expect(match).toMatch(/width:\s*var\(--sv-space-/)
  })

  // R5-03: Icon mode hides text labels visually but keeps SR access — same
  // exact-anchor reasoning as the width test above.
  it('should visually hide label text in icon mode, scoped to the closed state', () => {
    const iconLabelMatch = styleContent.match(
      /\.sv-app-shell\[data-collapsible=['"]icon['"]\]\[data-state=['"]closed['"]\] \.sv-app-sidebar__label\s*\{[^}]*\}/,
    )
    expect(iconLabelMatch).toBeTruthy()
    const match = iconLabelMatch?.[0]
    // Should use sr-only pattern: position absolute + width/height 1px + overflow hidden + clip
    expect(match).toContain('position')
    expect(match).toContain('width')
    expect(match).toContain('height')
    expect(match).toContain('overflow')
    expect(match).toContain('clip')
  })
})

/**
 * Helper: extract section content by comment header
 */
function extractSection(sectionName: string): string {
  const styleContent = fs.readFileSync(
    path.join(__dirname, '../src/css/style.css'),
    'utf-8',
  )

  const startMarker = `/* ---------- ${sectionName} ---------- */`
  const startIndex = styleContent.indexOf(startMarker)

  if (startIndex === -1) {
    return ''
  }

  // Find next section marker
  const nextMarker = styleContent.indexOf('/* ----------', startIndex + 1)
  const endIndex = nextMarker === -1 ? styleContent.length : nextMarker

  return styleContent.substring(startIndex, endIndex)
}
