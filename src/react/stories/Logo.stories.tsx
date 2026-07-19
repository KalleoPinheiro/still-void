import type { Meta, StoryObj } from '@storybook/react-vite';
import { Logo } from '../components/Shell';

const meta: Meta<typeof Logo> = {
  title: 'Shell/Logo',
  component: Logo,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Logo>;

export const Default: Story = {
  args: { label: 'quiet.tech' },
};

export const CustomHref: Story = {
  args: { label: 'quiet.tech', href: '/home' },
};
