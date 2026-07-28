import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeaturedPostCard } from '../components/Content';
import type { PostSummary } from '../../types';

const post: PostSummary = {
  title: 'Recipes over runtime CSS-in-JS',
  href: '#',
  excerpt: 'Pure functions that return class names are the cheapest abstraction there is.',
  date: '2026-07-10',
  readMinutes: 6,
  category: { label: 'IA', color: 'ia' },
};

const meta: Meta<typeof FeaturedPostCard> = {
  title: 'Content/FeaturedPostCard',
  component: FeaturedPostCard,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof FeaturedPostCard>;

export const Default: Story = {
  args: { post },
};

export const WithVisual: Story = {
  args: {
    post,
    visual: (
      <svg width="120" height="80" viewBox="0 0 120 80" aria-hidden="true">
        <rect
          x="8"
          y="8"
          width="104"
          height="64"
          rx="8"
          fill="none"
          stroke="var(--sv-accent)"
          strokeWidth="1.5"
        />
        <circle cx="60" cy="40" r="14" fill="var(--sv-accent)" opacity="0.35" />
      </svg>
    ),
  },
};
