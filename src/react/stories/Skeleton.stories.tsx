import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardSkeleton, Skeleton } from '../components/Content';

const meta: Meta<typeof Skeleton> = {
  title: 'Content/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Line: Story = {
  args: {},
};

export const SmallLine: Story = {
  args: { small: true },
};

export const Card: Story = {
  render: () => <CardSkeleton />,
};
