import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import {
  ToastProvider,
  useToast,
  type ToastVariant,
} from '../src/react/client/index';

describe('Toast (T10)', () => {
  // AC-1: useToast outside provider throws error
  test('throws error when useToast is used outside provider', () => {
    function ComponentOutsideProvider() {
      useToast();
      return null;
    }

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      render(<ComponentOutsideProvider />);
      expect.fail('Should have thrown');
    } catch (e) {
      expect((e as Error).message).toContain('useToast must be used within ToastProvider');
    }

    consoleError.mockRestore();
  });

  // AC-2: Toast renders in region with role
  test('renders toast in a region with role="region"', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast } = useToast();
      return (
        <button
          onClick={() => {
            toast({ title: 'Test Toast', description: 'Test description' });
          }}
        >
          Show Toast
        </button>
      );
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Toast'));

    // Check that viewport region exists
    const viewport = screen.getByRole('region');
    expect(viewport).toBeInTheDocument();

    // Check toast content
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  // AC-4: Variant defaults to 'info'
  test('defaults to info variant when variant is omitted', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast } = useToast();
      return (
        <button
          onClick={() => {
            toast({ title: 'Info Toast' });
          }}
        >
          Show
        </button>
      );
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show'));

    const toastElement = screen.getByText('Info Toast').closest('.sv-toast');
    expect(toastElement).toHaveClass('sv-toast--info');
  });

  // AC-5: Classes sv-toast and sv-toast--{variant}
  test('renders with correct classes for each variant', async () => {
    const user = userEvent.setup();
    const variants: ToastVariant[] = ['info', 'success', 'warning', 'danger'];

    for (const variant of variants) {
      function TestComponent() {
        const { toast } = useToast();
        return (
          <button
            onClick={() => {
              toast({ title: `${variant} toast`, variant });
            }}
          >
            Show {variant}
          </button>
        );
      }

      const { unmount } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = screen.getByText(`Show ${variant}`);
      await user.click(button);

      const toastElement = screen.getByText(`${variant} toast`).closest('.sv-toast');
      expect(toastElement).toHaveClass('sv-toast');
      expect(toastElement).toHaveClass(`sv-toast--${variant}`);

      unmount();
    }
  });

  // AC-9: Close button with default and custom labels
  test('renders close button with label', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast } = useToast();
      return (
        <button
          onClick={() => {
            toast({ title: 'Test' });
          }}
        >
          Show
        </button>
      );
    }

    render(
      <ToastProvider closeLabel="Close Toast">
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show'));

    const closeButton = screen.getByLabelText('Close Toast');
    expect(closeButton).toBeInTheDocument();
  });

  // Stacking: multiple toasts allowed up to max
  test('allows multiple toasts up to max limit', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, toasts } = useToast();
      return (
        <div>
          <button
            onClick={() => {
              toast({ title: 'Toast 1' });
              toast({ title: 'Toast 2' });
              toast({ title: 'Toast 3' });
            }}
          >
            Show 3
          </button>
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider max={3} duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show 3'));

    expect(screen.getByTestId('count')).toHaveTextContent('3');
    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
    expect(screen.getByText('Toast 3')).toBeInTheDocument();
  });

  // Stacking: 4th toast removes oldest when max is 3
  test('removes oldest toast when exceeding max', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, toasts } = useToast();
      return (
        <div>
          <button
            onClick={() => {
              toast({ title: 'Toast 1' });
              toast({ title: 'Toast 2' });
              toast({ title: 'Toast 3' });
              toast({ title: 'Toast 4' });
            }}
          >
            Show 4
          </button>
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider max={3} duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show 4'));

    // Should have at most 3 toasts
    expect(screen.getByTestId('count')).toHaveTextContent('3');

    // Toast 1 should be removed (oldest, FIFO)
    expect(screen.queryByText('Toast 1')).not.toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
    expect(screen.getByText('Toast 3')).toBeInTheDocument();
    expect(screen.getByText('Toast 4')).toBeInTheDocument();
  });

  // toast() returns handle
  test('toast() returns handle with id, dismiss, and update methods', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast } = useToast();
      const [handle, setHandle] = React.useState<any>(null);

      return (
        <div>
          <button
            onClick={() => {
              const h = toast({ title: 'Test' });
              setHandle(h);
            }}
          >
            Show
          </button>
          {handle && (
            <div data-testid="handle">
              <span data-testid="id">{handle.id}</span>
              <span data-testid="has-dismiss">
                {typeof handle.dismiss === 'function' ? 'yes' : 'no'}
              </span>
              <span data-testid="has-update">
                {typeof handle.update === 'function' ? 'yes' : 'no'}
              </span>
            </div>
          )}
        </div>
      );
    }

    render(
      <ToastProvider duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show'));

    expect(screen.getByTestId('id')).toBeInTheDocument();
    expect(screen.getByTestId('id').textContent).toBeTruthy();
    expect(screen.getByTestId('has-dismiss')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-update')).toHaveTextContent('yes');
  });

  // Edge case: identical content produces distinct entries
  test('creates distinct entries for identical content', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, toasts } = useToast();
      return (
        <div>
          <button
            onClick={() => {
              toast({ title: 'Same Title' });
              toast({ title: 'Same Title' });
            }}
          >
            Show Same
          </button>
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Same'));

    // Should have 2 toasts
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    const titles = screen.getAllByText('Same Title');
    expect(titles).toHaveLength(2);
  });

  // Edge case: empty toast valid
  test('empty toast without title/description is valid', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, toasts } = useToast();
      return (
        <div>
          <button
            onClick={() => {
              toast({});
            }}
          >
            Show Empty
          </button>
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Empty'));

    // Should have 1 toast
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    // Viewport should exist
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  // Edge case: max invalid defaults to 3
  test('invalid max defaults to 3', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, toasts } = useToast();
      return (
        <div>
          <button
            onClick={() => {
              for (let i = 1; i <= 5; i++) {
                toast({ title: `Toast ${i}` });
              }
            }}
          >
            Show 5
          </button>
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider max={0} duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show 5'));

    // Should default to 3
    expect(screen.getByTestId('count')).toHaveTextContent('3');
  });
});
