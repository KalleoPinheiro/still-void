import type { Meta, StoryObj } from '@storybook/react-vite';
import { Hero } from '../components/Content';

const meta: Meta<typeof Hero> = {
  title: 'Content/Hero',
  component: Hero,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Hero>;

export const Default: Story = {
  args: {
    eyebrow: 'design system',
    title: 'Quiet Tech — calm engineering, sharp accents',
    description:
      'Framework-agnostic tokens, recipes and behaviors, with first-class Server Component support.',
  },
};

export const NoDescription: Story = {
  args: {
    eyebrow: 'blog',
    title: 'Shipping without shadows',
  },
};
