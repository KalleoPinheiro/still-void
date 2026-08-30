import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  HomeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UsersIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { SidebarProvider, SidebarPanel, SidebarTrigger, SidebarInset } from '../client/SidebarProvider';
import { SidebarSection } from '../components/Content';

const meta: Meta = {
  title: 'shadcn/App Sidebar',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

// Navigation items for sidebar. The icons come straight from `@heroicons/react`
// (already a dependency, AD-013) rather than the design system's own curated
// `Icon` set: generic app-nav glyphs (home, users, ...) aren't part of that
// curated set, and this demo doesn't need to expand the package's public API
// just to illustrate SidebarPanel with realistic-looking content.
const navItems = [
  { icon: HomeIcon, label: 'Dashboard' },
  { icon: ChartBarIcon, label: 'Analytics' },
  { icon: Cog6ToothIcon, label: 'Settings' },
  { icon: UsersIcon, label: 'Team' },
  { icon: DocumentIcon, label: 'Docs' },
];

// Shared by every story below: real nav content a consumer would plug into
// SidebarPanel's `children`. Colored via the same text-2/text tokens as
// .sv-header__link (no shipped nav-link class exists for this newer App
// Sidebar family) instead of the browser's default link blue.
function DemoNav() {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sv-space-1)' }}>
      <style>{`
        .sv-demo-nav-link:hover { background: var(--sv-surface-2); color: var(--sv-text); }
        .sv-demo-nav-link:focus-visible { outline: 2px solid var(--sv-accent-ink); outline-offset: 2px; }
      `}</style>
      {navItems.map(({ icon: ItemIcon, label }) => (
        <a
          key={label}
          href="#"
          onClick={(e) => e.preventDefault()}
          className="sv-demo-nav-link"
          style={{
            padding: 'var(--sv-space-2) var(--sv-space-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sv-space-2)',
            textDecoration: 'none',
            cursor: 'pointer',
            borderRadius: 'var(--sv-radius-sm)',
            color: 'var(--sv-text-2)',
            fontSize: 'var(--sv-text-sm)',
            fontWeight: 500,
            transition:
              'background var(--sv-duration-fast) var(--sv-ease-hover), color var(--sv-duration-fast) var(--sv-ease-hover)',
          }}
        >
          <ItemIcon className="sv-icon sv-icon--sm" aria-hidden="true" />
          <span className="sv-app-sidebar__label">{label}</span>
        </a>
      ))}
    </nav>
  );
}

export const Offcanvas: Story = {
  render: () => (
    <SidebarProvider collapsible="offcanvas" defaultOpen={true}>
      <SidebarPanel>
        <SidebarSection title="Main">
          <DemoNav />
        </SidebarSection>
      </SidebarPanel>
      <SidebarInset>
        <div style={{ padding: '16px' }}>
          <p>Offcanvas mode: sidebar appears as a drawer below breakpoint.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const IconRail: Story = {
  render: () => (
    // defaultOpen={false}: in "icon" mode, `open` toggles rail width vs.
    // full width (the same way it toggles visible vs. hidden in
    // "offcanvas") — closed is the collapsed rail this story demonstrates
    // by default. Use the trigger below to expand it.
    <SidebarProvider collapsible="icon" defaultOpen={false}>
      <SidebarPanel>
        <SidebarSection title="Main">
          <DemoNav />
        </SidebarSection>
      </SidebarPanel>
      <SidebarInset>
        <div style={{ padding: '16px' }}>
          <SidebarTrigger />
          <p>
            Icon rail mode: labels carry the <code>sv-app-sidebar__label</code> class, so they
            visually hide (but stay in the accessibility tree) while the rail is collapsed to
            icon width — the default here. Click the trigger above to expand it to full width
            with labels visible, and collapse it again. Below the breakpoint it behaves like a
            normal drawer regardless of this state.
          </p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const None: Story = {
  render: () => (
    <SidebarProvider collapsible="none" defaultOpen={true}>
      <SidebarPanel>
        <SidebarSection title="Main">
          <DemoNav />
        </SidebarSection>
      </SidebarPanel>
      <SidebarInset>
        <div style={{ padding: '16px' }}>
          <p>None mode: sidebar is always expanded, no toggle button is shown.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};

export const WithHeaderTrigger: Story = {
  render: () => (
    <SidebarProvider collapsible="offcanvas" defaultOpen={false}>
      <SidebarPanel>
        <SidebarSection title="Main">
          <DemoNav />
        </SidebarSection>
      </SidebarPanel>
      <SidebarInset>
        <header
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid var(--sv-border)',
          }}
        >
          <SidebarTrigger />
          <h1 style={{ fontSize: 'var(--sv-text-md)', fontWeight: 600 }}>My App</h1>
        </header>
        <div style={{ padding: '16px' }}>
          <p>Trigger button positioned in header. Sidebar controlled from outside the panel.</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};
