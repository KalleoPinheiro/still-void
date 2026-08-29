import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ToastProvider, useToast } from '../client/ToastProvider';
import { Button } from '../../components/ui/button';

const meta: Meta = {
  title: 'shadcn/Toast',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

/**
 * Story wrapper that provides ToastProvider context
 */
function StoryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}

/**
 * Severities story: demonstrates all four variants
 */
function SeveritiesContent() {
  const { toast } = useToast();

  const handleInfo = () => {
    toast({
      title: 'Information',
      description: 'This is an info toast with a polite aria-live announcement.',
      variant: 'info',
    });
  };

  const handleSuccess = () => {
    toast({
      title: 'Success',
      description: 'Your operation completed successfully.',
      variant: 'success',
    });
  };

  const handleWarning = () => {
    toast({
      title: 'Warning',
      description: 'Please review this warning before proceeding.',
      variant: 'warning',
    });
  };

  const handleDanger = () => {
    toast({
      title: 'Error',
      description: 'An error occurred. Please try again later.',
      variant: 'danger',
    });
  };

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Button onClick={handleInfo} variant="secondary">
        Info
      </Button>
      <Button onClick={handleSuccess} variant="secondary">
        Success
      </Button>
      <Button onClick={handleWarning} variant="secondary">
        Warning
      </Button>
      <Button onClick={handleDanger} variant="destructive">
        Danger
      </Button>
    </div>
  );
}

export const Severities: Story = {
  render: () => (
    <StoryWrapper>
      <SeveritiesContent />
    </StoryWrapper>
  ),
};

/**
 * WithAction story: demonstrates action button in toast
 */
function WithActionContent() {
  const { toast } = useToast();

  const handleActionToast = () => {
    toast({
      title: 'File deleted',
      description: 'Your file has been moved to trash.',
      variant: 'info',
      action: {
        label: 'Undo',
        altText: 'Undo delete (Ctrl+Z)',
        onClick: () => {
          console.log('Undo clicked');
        },
      },
    });
  };

  return (
    <Button onClick={handleActionToast} variant="secondary">
      Show Toast with Action
    </Button>
  );
}

export const WithAction: Story = {
  render: () => (
    <StoryWrapper>
      <WithActionContent />
    </StoryWrapper>
  ),
};

/**
 * Stacking story: shows behavior with max=3 toasts
 */
function StackingContent() {
  const { toast, toasts } = useToast();
  const [count, setCount] = useState(0);

  const handleStack = () => {
    const newCount = count + 1;
    setCount(newCount);

    const variants = ['info', 'success', 'warning', 'danger'] as const;
    const variant = variants[newCount % 4];

    toast({
      title: `Toast #${newCount}`,
      description: `This is toast number ${newCount}. Only the last 3 will be shown.`,
      variant,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Button onClick={handleStack} variant="secondary">
        Add Toast (max 3 shown, FIFO)
      </Button>
      <p style={{ fontSize: '0.875rem', color: 'var(--sv-text-2)' }}>
        Toasts shown: {toasts.length} / 3 (oldest is removed when exceeding limit)
      </p>
    </div>
  );
}

export const Stacking: Story = {
  render: () => (
    <StoryWrapper>
      <StackingContent />
    </StoryWrapper>
  ),
};

/**
 * Persistent story: toast with infinite duration until dismissed
 */
function PersistentContent() {
  const { toast } = useToast();

  const handlePersistent = () => {
    toast({
      title: 'Persistent Notification',
      description: 'This toast will not auto-dismiss. You must close it manually.',
      variant: 'warning',
      duration: Infinity,
    });
  };

  return (
    <Button onClick={handlePersistent} variant="secondary">
      Show Persistent Toast (duration: Infinity)
    </Button>
  );
}

export const Persistent: Story = {
  render: () => (
    <StoryWrapper>
      <PersistentContent />
    </StoryWrapper>
  ),
};
