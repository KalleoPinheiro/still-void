import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '../../components/ui/checkbox';
import { fieldClasses } from '../../recipes/field';

const meta: Meta<typeof Checkbox> = {
  title: 'shadcn/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    name: 'ativo',
  },
};

export const CheckedByDefault: Story = {
  args: {
    name: 'ativo',
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    name: 'ativo',
    disabled: true,
  },
};

export const WithLabel: Story = {
  name: 'With a label (sv-choice wrapper)',
  render: () => (
    <label className={fieldClasses.choice}>
      <Checkbox name="terms" />
      I agree to the terms
    </label>
  ),
};
