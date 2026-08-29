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

  // AC-12: data-state animation exists
  it('should animate .sv-app-sidebar__drawer with data-state', () => {
    // Check for animation rule tied to data-state
    const dataStateMatch = styleContent.match(
      /\.sv-app-shell\[data-state=['\"]open['\"]\].*\.sv-app-sidebar.*\{[^}]*animation[^}]*\}/s,
    )
    // The rule exists (either inline or in separate selector)
    expect(styleContent).toContain('data-state')
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

  // Inset styling
  it('should define .sv-app-sidebar-inset', () => {
    const insetMatch = styleContent.match(/\.sv-app-sidebar-inset\s*\{[^}]*\}/s)
    expect(insetMatch).toBeTruthy()
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
