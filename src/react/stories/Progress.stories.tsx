import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from '../../components/ui/progress';

const meta: Meta<typeof Progress> = {
  title: 'shadcn/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'number', min: 0 } },
    max: { control: { type: 'number', min: 1 } },
  },
};
export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: { value: 40, max: 100 },
  render: (args) => (
    <div style={{ width: '280px' }}>
      <Progress {...args} />
    </div>
  ),
};

export const ClinicalScores: Story = {
  name: 'PUSH / DET / pain scale — three different scales',
  render: () => (
    <div style={{ display: 'grid', gap: '16px', width: '280px' }}>
      <div>
        <span style={{ fontSize: '0.8125rem' }}>PUSH (0–17)</span>
        <Progress value={9} max={17} />
      </div>
      <div>
        <span style={{ fontSize: '0.8125rem' }}>DET (0–15)</span>
        <Progress value={3} max={15} />
      </div>
      <div>
        <span style={{ fontSize: '0.8125rem' }}>Escala de dor (0–10)</span>
        <Progress value={6} max={10} />
      </div>
    </div>
  ),
};

export const OutOfRangeClamps: Story = {
  name: 'value above max clamps at 100%',
  args: { value: 25, max: 17 },
  render: (args) => (
    <div style={{ width: '280px' }}>
      <Progress {...args} />
    </div>
  ),
};
