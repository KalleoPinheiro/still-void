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
  // `color` accepts "any CSS color" by design (see CategoryPillBaseProps in
  // Content.tsx); DESIGN.md's One-Accent Rule exempts CategoryPill from the
  // site accent constraint, so this is a documented passthrough, not drift.
  // impeccable-disable-next-line design-system-color: intentional raw-color passthrough demo
  args: { label: 'Custom', color: '#ff5566' },
};
