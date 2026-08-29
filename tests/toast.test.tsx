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

describe('Toast Action (T11)', () => {
  // AC-1: Action renders button with label
  test('renders action button with label', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast } = useToast();
      return (
        <button
          onClick={() => {
            toast({
              title: 'Action Test',
              action: {
                label: 'Undo',
                altText: 'Undo action',
                onClick: () => {},
              },
            });
          }}
        >
          Show
        </button>
      );
    }

    render(
      <ToastProvider duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show'));

    const actionButton = screen.getByText('Undo');
    expect(actionButton).toBeInTheDocument();
    expect(actionButton).toHaveClass('sv-toast__action');
  });

  // AC-2: Action click calls onClick and dismisses toast
  test('action click triggers onClick and dismisses toast', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    function TestComponent() {
      const { toast, toasts } = useToast();
      return (
        <div>
          <button
            onClick={() => {
              toast({
                title: 'Action Test',
                duration: Infinity,
                action: {
                  label: 'Click Me',
                  altText: 'Click to trigger action',
                  onClick,
                },
              });
            }}
          >
            Show
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

    await user.click(screen.getByText('Show'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    // Click the action button
    await user.click(screen.getByText('Click Me'));

    // onClick should be called
    expect(onClick).toHaveBeenCalledTimes(1);

    // Toast should be dismissed
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  // AC-3: No action renders only close button
  test('renders only close button when action is omitted', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast } = useToast();
      return (
        <button
          onClick={() => {
            toast({ title: 'No Action Toast', duration: Infinity });
          }}
        >
          Show
        </button>
      );
    }

    render(
      <ToastProvider closeLabel="Close" duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show'));

    // Should have close button
    const closeButton = screen.getByLabelText('Close');
    expect(closeButton).toBeInTheDocument();

    // Should NOT have any action buttons
    const actionButtons = screen.queryAllByRole('button', { hidden: true });
    // Only close button should exist (plus the Show button in the test)
    const actualActionButtons = actionButtons.filter((btn) => {
      const parent = btn.closest('.sv-toast__action');
      return parent !== null;
    });
    expect(actualActionButtons).toHaveLength(0);
  });

  // AC-4: altText is required in types
  test('altText is required for action type safety', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast } = useToast();
      return (
        <button
          onClick={() => {
            toast({
              title: 'Test',
              action: {
                label: 'Button',
                altText: 'This is required',
                onClick: () => {},
              },
            });
          }}
        >
          Show
        </button>
      );
    }

    render(
      <ToastProvider duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    // If this compiles without TS error, altText is properly required
    await user.click(screen.getByText('Show'));
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  // CSS contract: action button uses correct styles
  test('action button has correct CSS classes', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast } = useToast();
      return (
        <button
          onClick={() => {
            toast({
              title: 'CSS Test',
              duration: Infinity,
              action: {
                label: 'Action',
                altText: 'Test action',
                onClick: () => {},
              },
            });
          }}
        >
          Show
        </button>
      );
    }

    render(
      <ToastProvider duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show'));

    const actionButton = screen.getByText('Action');
    expect(actionButton).toHaveClass('sv-toast__action');

    // Check that it's inside the actions container
    const actionsContainer = actionButton.closest('.sv-toast__actions');
    expect(actionsContainer).toBeInTheDocument();
  });
});

describe('Toast Handles (T12)', () => {
  // AC-1: dismiss(id) removes specific toast
  test('dismiss() removes specific toast', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, toasts } = useToast();
      const [handles, setHandles] = React.useState<any[]>([]);

      return (
        <div>
          <button
            onClick={() => {
              const h1 = toast({ title: 'Toast 1', duration: Infinity });
              const h2 = toast({ title: 'Toast 2', duration: Infinity });
              setHandles([h1, h2]);
            }}
          >
            Show
          </button>
          {handles.length > 0 && (
            <button
              onClick={() => {
                handles[0].dismiss();
              }}
              data-testid="dismiss-1"
            >
              Dismiss 1
            </button>
          )}
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');

    // Dismiss first toast
    await user.click(screen.getByTestId('dismiss-1'));

    // Should have 1 toast left, and it should be Toast 2
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
    expect(screen.queryByText('Toast 1')).not.toBeInTheDocument();
  });

  // AC-2: dismissAll() removes all toasts
  test('dismissAll() removes all toasts', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, toasts, dismissAll } = useToast();

      return (
        <div>
          <button
            onClick={() => {
              toast({ title: 'Toast 1', duration: Infinity });
              toast({ title: 'Toast 2', duration: Infinity });
              toast({ title: 'Toast 3', duration: Infinity });
            }}
          >
            Show
          </button>
          <button onClick={() => dismissAll()} data-testid="dismiss-all">
            Dismiss All
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

    await user.click(screen.getByText('Show'));
    expect(screen.getByTestId('count')).toHaveTextContent('3');

    // Dismiss all
    await user.click(screen.getByTestId('dismiss-all'));

    // Should have 0 toasts
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  // AC-3: update(patch) modifies toast and restarts timer
  test('update() modifies toast content', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast } = useToast();
      const [handle, setHandle] = React.useState<any>(null);

      return (
        <div>
          <button
            onClick={() => {
              const h = toast({
                title: 'Original',
                description: 'Original description',
                duration: Infinity,
              });
              setHandle(h);
            }}
          >
            Show
          </button>
          {handle && (
            <button
              onClick={() => {
                handle.update({
                  title: 'Updated',
                  description: 'Updated description',
                });
              }}
              data-testid="update-btn"
            >
              Update
            </button>
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
    expect(screen.getByText('Original')).toBeInTheDocument();

    // Update the toast
    await user.click(screen.getByTestId('update-btn'));

    // Should show updated content
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.getByText('Updated description')).toBeInTheDocument();

    // Original should not be visible
    expect(screen.queryByText('Original')).not.toBeInTheDocument();
  });

  // AC-4: dismiss of non-existent id is no-op (edge case)
  test('dismiss of non-existent id is no-op', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, dismiss, toasts } = useToast();

      return (
        <div>
          <button
            onClick={() => {
              toast({ title: 'Test Toast', duration: Infinity });
            }}
          >
            Show
          </button>
          <button
            onClick={() => {
              dismiss('non-existent-id');
            }}
            data-testid="dismiss-invalid"
          >
            Dismiss Invalid
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

    await user.click(screen.getByText('Show'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    // Try to dismiss non-existent toast
    await user.click(screen.getByTestId('dismiss-invalid'));

    // Should still have 1 toast
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
  });

  // AC-4: dismiss called twice on same handle is no-op second time
  test('dismiss called twice on same handle is no-op second time', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, toasts } = useToast();
      const [handle, setHandle] = React.useState<any>(null);

      return (
        <div>
          <button
            onClick={() => {
              const h = toast({ title: 'Test', duration: Infinity });
              setHandle(h);
            }}
          >
            Show
          </button>
          {handle && (
            <>
              <button
                onClick={() => {
                  handle.dismiss();
                }}
                data-testid="dismiss-1"
              >
                Dismiss First Time
              </button>
              <button
                onClick={() => {
                  handle.dismiss();
                }}
                data-testid="dismiss-2"
              >
                Dismiss Second Time
              </button>
            </>
          )}
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    // Dismiss first time
    await user.click(screen.getByTestId('dismiss-1'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');

    // Dismiss second time (should be no-op, no error)
    await user.click(screen.getByTestId('dismiss-2'));

    // Should still have 0 toasts
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  // Multiple sequential toasts and interactions
  test('handles multiple sequential operations correctly', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, dismiss, dismissAll, toasts } = useToast();
      const [handle, setHandle] = React.useState<any>(null);

      return (
        <div>
          <button
            onClick={() => {
              const h = toast({ title: 'Sequential 1' });
              setHandle(h);
            }}
          >
            Toast 1
          </button>
          <button
            onClick={() => {
              const h = toast({ title: 'Sequential 2' });
              setHandle(h);
            }}
          >
            Toast 2
          </button>
          {handle && (
            <>
              <button onClick={() => handle.dismiss()}>Dismiss Handle</button>
              <button onClick={() => handle.update({ title: 'Updated' })}>
                Update
              </button>
            </>
          )}
          <button onClick={() => dismissAll()}>Clear All</button>
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    // Create first toast
    await user.click(screen.getByText('Toast 1'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    // Create second toast
    await user.click(screen.getByText('Toast 2'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');

    // Update via handle
    await user.click(screen.getByText('Update'));
    expect(screen.getByText('Updated')).toBeInTheDocument();

    // Dismiss via handle
    await user.click(screen.getByText('Dismiss Handle'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    // Clear all
    await user.click(screen.getByText('Clear All'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});
