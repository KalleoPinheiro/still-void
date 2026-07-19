import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArticleHeader } from '../components/Article';
import { CategoryPill } from '../components/Content';

const meta: Meta<typeof ArticleHeader> = {
  title: 'Article/ArticleHeader',
  component: ArticleHeader,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof ArticleHeader>;

export const Default: Story = {
  args: {
    title: 'Server Components without the framework lock-in',
    author: 'Kalleo Pinheiro',
    date: '2026-07-19',
    readMinutes: 8,
    eyebrow: <CategoryPill label="DEV" color="dev" />,
  },
};

export const MetaOnly: Story = {
  args: {
    title: 'A calmer way to ship UI',
    date: '2026-06-01',
  },
};
