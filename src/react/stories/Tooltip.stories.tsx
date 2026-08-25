import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../../components/ui/tooltip';
import { Button } from '../../components/ui/button';

const meta: Meta = {
  title: 'shadcn/Tooltip',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a tooltip</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const WithText: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Help</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to get help</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const Multiple: Story = {
  render: () => (
    <TooltipProvider>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Save</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ctrl+S</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Delete</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove item</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Settings</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Configure options</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

export const Positions: Story = {
  render: () => (
    <TooltipProvider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', padding: '2rem' }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Top</Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Positioned on top</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Right</Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Positioned on right</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Bottom</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Positioned on bottom</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Left</Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Positioned on left</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

export const LongContent: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Info</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p style={{ maxWidth: '200px' }}>
            This tooltip has longer content that provides more detailed information about the
            element being hovered. It can span multiple lines.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost">?</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Question: Need help?</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const Keyboard: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Keyboard Shortcut</Button>
        </TooltipTrigger>
        <TooltipContent>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <kbd style={{ padding: '0.25rem 0.5rem', border: '1px solid', borderRadius: 'var(--sv-radius-sm)' }}>
              Ctrl
            </kbd>
            <span>+</span>
            <kbd style={{ padding: '0.25rem 0.5rem', border: '1px solid', borderRadius: 'var(--sv-radius-sm)' }}>
              K
            </kbd>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
