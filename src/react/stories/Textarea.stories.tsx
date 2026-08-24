import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from '../../components/ui/textarea';

const meta: Meta<typeof Textarea> = {
  title: 'shadcn/Textarea',
  component: Textarea,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Enter multi-line text...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Filled textarea content spanning a few words.',
  },
};

export const CustomRows: Story = {
  args: {
    rows: 6,
    placeholder: 'rows={6} — the attribute Input never accepted',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea',
    disabled: true,
  },
};
