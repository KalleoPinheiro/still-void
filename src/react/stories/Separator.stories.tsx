import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from '../../components/ui/separator';

const meta: Meta<typeof Separator> = {
  title: 'shadcn/Separator',
  component: Separator,
  tags: ['autodocs'],
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    decorative: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: '320px' }}>
      <p>Item um</p>
      <Separator style={{ margin: '12px 0' }} />
      <p>Item dois</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', height: '32px', gap: '12px' }}>
      <span>Blog</span>
      <Separator orientation="vertical" />
      <span>Docs</span>
      <Separator orientation="vertical" />
      <span>Source</span>
    </div>
  ),
};

export const MeaningfulDivider: Story = {
  name: 'decorative={false} — the "ou" between two sign-in methods',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', width: '280px', gap: '12px' }}>
      <Separator decorative={false} style={{ flex: 1 }} />
      <span>ou</span>
      <Separator decorative={false} style={{ flex: 1 }} />
    </div>
  ),
};
