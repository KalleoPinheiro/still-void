import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryPill } from '../components/Content';

const meta: Meta<typeof CategoryPill> = {
  title: 'Content/CategoryPill',
  component: CategoryPill,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['cyan', 'violet', 'mint', 'amber', 'ia', 'prompt', 'dev', 'arch', 'ts'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof CategoryPill>;

export const Default: Story = {
  args: { label: 'IA', color: 'ia' },
};

export const Interactive: Story = {
  args: { label: 'DEV', color: 'dev', interactive: true },
};

export const Active: Story = {
  args: { label: 'ARCH', color: 'arch', interactive: true, active: true },
};

export const RawColor: Story = {
  args: { label: 'Custom', color: '#ff5566' },
};
