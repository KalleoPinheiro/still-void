import type { Meta, StoryObj } from '@storybook/react-vite';
import { NativeSelect } from '../../components/ui/native-select';
import { Input } from '../../components/ui/input';

const meta: Meta<typeof NativeSelect> = {
  title: 'shadcn/NativeSelect',
  component: NativeSelect,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof NativeSelect>;

export const Default: Story = {
  render: () => (
    <NativeSelect defaultValue="">
      <option value="" disabled>
        Select a specialty
      </option>
      <option value="nursing">Nursing</option>
      <option value="cardiology">Cardiology</option>
      <option value="pediatrics">Pediatrics</option>
    </NativeSelect>
  ),
};

export const Multiple: Story = {
  render: () => (
    <NativeSelect multiple defaultValue={['nursing']} style={{ minHeight: '6rem' }}>
      <option value="nursing">Nursing</option>
      <option value="cardiology">Cardiology</option>
      <option value="pediatrics">Pediatrics</option>
    </NativeSelect>
  ),
};

export const Disabled: Story = {
  render: () => (
    <NativeSelect disabled defaultValue="nursing">
      <option value="nursing">Nursing</option>
    </NativeSelect>
  ),
};

export const SharedFrame: Story = {
  name: 'Shares the field frame with Input',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '320px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Input</label>
        <Input type="text" placeholder="Same height, radius, border" />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>NativeSelect</label>
        <NativeSelect defaultValue="nursing">
          <option value="nursing">Nursing</option>
          <option value="cardiology">Cardiology</option>
        </NativeSelect>
      </div>
    </div>
  ),
};
