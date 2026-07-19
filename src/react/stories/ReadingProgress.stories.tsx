import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReadingProgress } from '../client/ReadingProgress';

const meta: Meta<typeof ReadingProgress> = {
  title: 'Client/ReadingProgress',
  component: ReadingProgress,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Fixed top progress bar tracking document scroll. Motion is linear by spec.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ReadingProgress>;

export const Default: Story = {
  render: () => (
    <div style={{ height: '200vh' }}>
      <ReadingProgress />
      <p>Scroll this story's canvas to see the bar fill in.</p>
    </div>
  ),
};
