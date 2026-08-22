import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

const meta: Meta = {
  title: 'shadcn/Tabs',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Content for Tab 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>Content for Tab 2</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>Content for Tab 3</p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithContent: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" style={{ marginTop: '1rem' }}>
        <h4>Overview</h4>
        <p>This is the overview tab with general information.</p>
      </TabsContent>
      <TabsContent value="details" style={{ marginTop: '1rem' }}>
        <h4>Details</h4>
        <p>This is the details tab with more specific information.</p>
      </TabsContent>
      <TabsContent value="settings" style={{ marginTop: '1rem' }}>
        <h4>Settings</h4>
        <p>Configure settings in this tab.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList style={{ display: 'flex', overflowX: 'auto' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <TabsTrigger key={i} value={`tab${i}`}>
            Tab {i + 1}
          </TabsTrigger>
        ))}
      </TabsList>
      {Array.from({ length: 8 }, (_, i) => (
        <TabsContent key={i} value={`tab${i}`} style={{ marginTop: '1rem' }}>
          <p>Content for Tab {i + 1}</p>
        </TabsContent>
      ))}
    </Tabs>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Enabled</TabsTrigger>
        <TabsTrigger value="tab2" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="tab3">Enabled</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Content for Tab 1</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>Content for Tab 3</p>
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="account" orientation="vertical">
      <TabsList style={{ flexDirection: 'column', alignItems: 'flex-start', width: '150px' }}>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <div style={{ marginLeft: '2rem' }}>
        <TabsContent value="account">
          <h4>Account Settings</h4>
          <p>Manage your account information</p>
        </TabsContent>
        <TabsContent value="password">
          <h4>Password</h4>
          <p>Change your password</p>
        </TabsContent>
        <TabsContent value="notifications">
          <h4>Notifications</h4>
          <p>Configure notification preferences</p>
        </TabsContent>
      </div>
    </Tabs>
  ),
};

export const WithRichContent: Story = {
  render: () => (
    <Tabs defaultValue="features">
      <TabsList>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
      </TabsList>
      <TabsContent value="features" style={{ marginTop: '1rem' }}>
        <h4>Key Features</h4>
        <ul style={{ marginTop: '0.5rem' }}>
          <li>Feature 1</li>
          <li>Feature 2</li>
          <li>Feature 3</li>
        </ul>
      </TabsContent>
      <TabsContent value="pricing" style={{ marginTop: '1rem' }}>
        <h4>Pricing Plans</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ padding: '1rem', border: '1px solid var(--sv-border)' }}>
            <h5>Basic</h5>
            <p>$9/month</p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid var(--sv-border)' }}>
            <h5>Pro</h5>
            <p>$29/month</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
