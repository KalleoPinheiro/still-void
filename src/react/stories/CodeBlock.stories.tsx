import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeBlock } from '../components/Article';
import { CopyButton } from '../client/CopyButton';

const sample = `import { createThemeManager } from '@still-void/ui/react/client';

const theme = createThemeManager();
theme.setAccent('violet');`;

const meta: Meta<typeof CodeBlock> = {
  title: 'Article/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof CodeBlock>;

export const Static: Story = {
  args: { code: sample, language: 'ts' },
};

export const WithFilenameAndCopy: Story = {
  args: {
    code: sample,
    filename: 'theme.ts',
    actions: <CopyButton code={sample} />,
  },
};
