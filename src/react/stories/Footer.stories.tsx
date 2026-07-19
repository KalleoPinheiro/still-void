import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer } from '../components/Shell';

const meta: Meta<typeof Footer> = {
  title: 'Shell/Footer',
  component: Footer,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  args: {
    author: 'Kalleo Pinheiro',
    links: [
      { label: 'RSS', href: '#' },
      { label: 'GitHub', href: '#' },
    ],
  },
};

export const AuthorOnly: Story = {
  args: {
    author: 'Kalleo Pinheiro',
  },
};
