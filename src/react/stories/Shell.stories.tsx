import type { Meta, StoryObj } from '@storybook/react-vite';
import { Footer, Header, Logo } from '../components/Shell';

const meta: Meta<typeof Header> = {
  title: 'Shell/Header',
  component: Header,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    logo: <Logo label="quiet.tech" />,
    items: [
      { label: 'Home', href: '#', active: true },
      { label: 'Articles', href: '#' },
      { label: 'About', href: '#' },
    ],
  },
};

export const WithActions: Story = {
  args: {
    ...Default.args,
    actions: <span className="qt-header__link">Search</span>,
  },
};

export const NoGlass: Story = {
  args: {
    ...Default.args,
    glass: false,
  },
};
