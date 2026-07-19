import type { Meta, StoryObj } from '@storybook/react-vite';
import { Layout, PostCard, PostGrid, Sidebar, SidebarSection } from '../components/Content';
import type { PostSummary } from '../../types';

const posts: PostSummary[] = [
  { title: 'Recipes over runtime CSS-in-JS', href: '#', excerpt: 'Pure functions win.', category: { label: 'DEV', color: 'dev' } },
  { title: 'Dense variant for list views', href: '#', excerpt: 'Compact by design.', category: { label: 'PROMPT', color: 'prompt' } },
];

const meta: Meta<typeof Layout> = {
  title: 'Content/PostGrid + Sidebar',
  component: Layout,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Layout>;

export const WithSidebar: Story = {
  render: () => (
    <Layout withSidebar>
      <PostGrid>
        {posts.map((post) => (
          <PostCard key={post.href} post={post} />
        ))}
      </PostGrid>
      <Sidebar>
        <SidebarSection title="Categories">
          <p>DEV, PROMPT, ARCH…</p>
        </SidebarSection>
      </Sidebar>
    </Layout>
  ),
};

export const GridOnly: Story = {
  render: () => (
    <PostGrid>
      {posts.map((post) => (
        <PostCard key={post.href} post={post} />
      ))}
    </PostGrid>
  ),
};
