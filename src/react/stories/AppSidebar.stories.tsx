import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarProvider, SidebarPanel, SidebarTrigger, SidebarInset } from '../client/SidebarProvider';
import { SidebarSection } from '../components/Content';
import { Button } from '../../components/ui/button';

const meta: Meta = {
  title: 'shadcn/App Sidebar',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

// Navigation items for sidebar
const navItems = [
  { icon: '🏠', label: 'Dashboard' },
  { icon: '📊', label: 'Analytics' },
  { icon: '⚙️', label: 'Settings' },
  { icon: '👥', label: 'Team' },
  { icon: '📄', label: 'Docs' },
];

export const Offcanvas: Story = {
  render: () => (
    <SidebarProvider collapsible="offcanvas" defaultOpen={true}>
      <SidebarPanel>
        <SidebarSection title="Main">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
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
    <SidebarProvider collapsible="icon" defaultOpen={true}>
      <SidebarPanel>
        <SidebarSection title="Main">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                <span>{item.icon}</span>
                <span className="sv-app-sidebar__label">{item.label}</span>
              </a>
            ))}
          </nav>
        </SidebarSection>
      </SidebarPanel>
      <SidebarInset>
        <div style={{ padding: '16px' }}>
          <p>
            Icon rail mode: labels carry the <code>sv-app-sidebar__label</code> class, so they
            visually hide (but stay in the accessibility tree) while the rail is collapsed to
            icon width on desktop, and reappear as a normal drawer on mobile.
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
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
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
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </SidebarSection>
      </SidebarPanel>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
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
          <h1 style={{ fontSize: '16px', fontWeight: 600 }}>My App</h1>
        </header>
        <SidebarInset>
          <div style={{ padding: '16px' }}>
            <p>Trigger button positioned in header. Sidebar controlled from outside the panel.</p>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  ),
};
