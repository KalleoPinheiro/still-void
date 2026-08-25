import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../../components/ui/input';

const meta: Meta<typeof Input> = {
  title: 'shadcn/Input',
  component: Input,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'user@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const WithValue: Story = {
  args: {
    type: 'text',
    defaultValue: 'Filled input',
  },
};

export const Disabled: Story = {
  args: {
    type: 'text',
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Text</label>
        <Input type="text" placeholder="Text input" />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
        <Input type="email" placeholder="user@example.com" />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
        <Input type="password" placeholder="Password" />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Number</label>
        <Input type="number" placeholder="0" />
      </div>
    </div>
  ),
};

export const FocusState: Story = {
  args: {
    type: 'text',
    placeholder: 'Focus this input (2px accent-ink outline)',
    autoFocus: true,
  },
};
