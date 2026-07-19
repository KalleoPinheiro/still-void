import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeProvider } from '../client/ThemeProvider';
import { ThemeToggle } from '../client/ThemeToggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Client/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider storageKey={null}>
        <Story />
      </ThemeProvider>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {};
