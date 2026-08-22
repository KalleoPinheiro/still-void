import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const meta: Meta<typeof Card> = {
  title: 'shadcn/Card',
  component: Card,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card style={{ maxWidth: '400px' }}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content. It can contain any elements.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card style={{ maxWidth: '300px' }}>
      <CardContent style={{ paddingTop: '1.5rem' }}>
        <p>Simple card with just content</p>
      </CardContent>
    </Card>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Card style={{ maxWidth: '400px' }}>
      <CardHeader>
        <CardTitle>Feature Highlight</CardTitle>
        <CardDescription>
          This card has a longer description that provides more context about the content below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content here</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card style={{ maxWidth: '400px' }}>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Configure your preferences</p>
      </CardContent>
      <CardFooter style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithMultipleElements: Story = {
  render: () => (
    <Card style={{ maxWidth: '500px' }}>
      <CardHeader>
        <CardTitle>Article Summary</CardTitle>
        <CardDescription>Published on August 22, 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Introduction</h4>
          <p>This is a sample article card demonstrating the card component structure.</p>
        </div>
        <div>
          <h4 style={{ marginBottom: '0.5rem' }}>Key Points</h4>
          <ul>
            <li>Point 1</li>
            <li>Point 2</li>
            <li>Point 3</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="link">Read more →</Button>
      </CardFooter>
    </Card>
  ),
};
