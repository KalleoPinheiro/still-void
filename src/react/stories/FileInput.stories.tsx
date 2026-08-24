import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileInput } from '../../components/ui/file-input';

const meta: Meta<typeof FileInput> = {
  title: 'shadcn/FileInput',
  component: FileInput,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof FileInput>;

export const Default: Story = {
  args: {},
};

export const AcceptImages: Story = {
  args: {
    accept: 'image/*',
  },
};

export const Multiple: Story = {
  args: {
    accept: 'image/*',
    multiple: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
