import type { Meta, StoryObj } from '@storybook/react-vite';
import { Lead, Prose } from '../components/Article';

const meta: Meta<typeof Prose> = {
  title: 'Article/Prose',
  component: Prose,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Prose>;

export const Default: Story = {
  render: () => (
    <Prose>
      <Lead>Lead paragraphs are larger and use the primary text color.</Lead>
      <p>
        Body text uses Manrope at 16px with relaxed line-height. Inline <code>code</code> uses
        JetBrains Mono. Links get the <a href="#">accent color</a>.
      </p>
      <h2>A section heading</h2>
      <p>Headings balance their line breaks via `text-wrap: balance`.</p>
      <blockquote>Quiet Tech: calm engineering, sharp accents.</blockquote>
    </Prose>
  ),
};
