import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../../components/ui/badge';

const meta: Meta<typeof Badge> = {
  title: 'shadcn/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      options: ['default', 'secondary', 'destructive', 'outline'],
      control: { type: 'select' },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge>New</Badge>
      <Badge>Featured</Badge>
      <Badge>Popular</Badge>
      <Badge variant="secondary">In Progress</Badge>
      <Badge variant="outline">Draft</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge>✓ Verified</Badge>
      <Badge variant="secondary">★ Featured</Badge>
      <Badge variant="destructive">✕ Blocked</Badge>
      <Badge variant="outline">→ Pending</Badge>
    </div>
  ),
};

export const LargeCollection: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Badge>React</Badge>
      <Badge>TypeScript</Badge>
      <Badge>Design System</Badge>
      <Badge variant="secondary">Component Library</Badge>
      <Badge variant="secondary">Open Source</Badge>
      <Badge variant="outline">Featured</Badge>
      <Badge variant="destructive">Important</Badge>
    </div>
  ),
};
