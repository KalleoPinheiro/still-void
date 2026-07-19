import type { Meta, StoryObj } from '@storybook/react-vite';
import { Callout } from '../components/Article';

const meta: Meta<typeof Callout> = {
  title: 'Article/Callout',
  component: Callout,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Callout>;

export const Note: Story = {
  args: {
    kind: 'note',
    children: 'Callouts use an accent-colored left border, never a background wash.',
  },
};

export const Warn: Story = {
  args: {
    kind: 'warn',
    children: 'Cards never get shadows. Elevation comes from border + surface tokens.',
  },
};

export const Aha: Story = {
  args: {
    kind: 'aha',
    children: "Accent switching is pure CSS via data-accent — Server Component safe.",
  },
};
