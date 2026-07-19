import type { Meta, StoryObj } from '@storybook/react-vite';
import { TableOfContents } from '../client/TableOfContents';

const meta: Meta<typeof TableOfContents> = {
  title: 'Client/TableOfContents',
  component: TableOfContents,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Active state depends on IntersectionObserver against real headings in the page — in this isolated story no heading elements exist, so no item is active. See the playground for the live version.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof TableOfContents>;

export const Default: Story = {
  args: {
    items: [
      { id: 's-typography', label: 'Prose typography', depth: 2 },
      { id: 's-motion', label: 'Motion', depth: 2 },
      { id: 's-details', label: 'Fine print', depth: 3 },
      { id: 's-theming', label: 'Theming', depth: 2 },
    ],
  },
};
