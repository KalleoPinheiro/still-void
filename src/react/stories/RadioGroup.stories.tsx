import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';

const meta: Meta<typeof RadioGroup> = {
  title: 'shadcn/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Vertical: Story = {
  render: () => (
    <RadioGroup legend="Tipo de diagnóstico" name="nanda">
      <RadioGroupItem value="real">Real</RadioGroupItem>
      <RadioGroupItem value="risco">Risco</RadioGroupItem>
      <RadioGroupItem value="promocao">Promoção da saúde</RadioGroupItem>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup legend="Tipo de diagnóstico" name="nanda-horizontal" orientation="horizontal">
      <RadioGroupItem value="real">Real</RadioGroupItem>
      <RadioGroupItem value="risco">Risco</RadioGroupItem>
      <RadioGroupItem value="promocao">Promoção da saúde</RadioGroupItem>
    </RadioGroup>
  ),
};

export const LegendHidden: Story = {
  name: 'Legend hidden (still in the DOM, sv-sr-only)',
  render: () => (
    <RadioGroup legend="Tipo de diagnóstico" legendHidden name="nanda-hidden">
      <RadioGroupItem value="real">Real</RadioGroupItem>
      <RadioGroupItem value="risco">Risco</RadioGroupItem>
    </RadioGroup>
  ),
};
