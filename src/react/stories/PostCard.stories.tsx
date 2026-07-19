import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostCard } from '../components/Content';
import type { PostSummary } from '../../types';

const post: PostSummary = {
  title: 'Server Components without the framework lock-in',
  href: '#',
  excerpt: 'How class recipes keep a design system portable across React, Angular and plain HTML.',
  date: '2026-07-19',
  readMinutes: 8,
  category: { label: 'DEV', color: 'dev' },
};

const meta: Meta<typeof PostCard> = {
  title: 'Content/PostCard',
  component: PostCard,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof PostCard>;

export const Comfortable: Story = {
  args: { post },
};

export const Dense: Story = {
  args: { post, dense: true },
};
