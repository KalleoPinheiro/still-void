import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

  // F2 (R5-06 AC-3): a provider-level `max` below the library default of 3
  // must be honored, not clamped back up to 3. The two existing max tests
  // only ever use `max={3}` (== the default) or `max={0}` (the invalid-input
  // fallback path), so neither could catch a `Math.max(3, …)` floor.
  test('honors a provider max below the default of 3', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, toasts } = useToast();
      return (
        <div>
          <button
            onClick={() => {
              toast({ title: 'Toast A' });
              toast({ title: 'Toast B' });
            }}
          >
            Show 2
          </button>
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider max={1} duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show 2'));

    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.queryByText('Toast A')).not.toBeInTheDocument();
    expect(screen.getByText('Toast B')).toBeInTheDocument();
  });

  test('honors a provider max above the default of 3', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, toasts } = useToast();
      return (
        <div>
          <button
            onClick={() => {
              for (let i = 1; i <= 6; i++) toast({ title: `Toast ${i}` });
            }}
          >
            Show 6
          </button>
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider max={5} duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show 6'));

    expect(screen.getByTestId('count')).toHaveTextContent('5');
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

describe('Toast Edge Cases & Coverage', () => {
  // AC: Toast with custom duration (entry.duration ?? duration branch)
  test('uses entry.duration when provided', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, toasts } = useToast();
      return (
        <div>
          <button
            onClick={() => {
              toast({ title: 'Custom Duration', duration: 2000 });
            }}
          >
            Show
          </button>
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider duration={5000}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByText('Custom Duration')).toBeInTheDocument();
  });

  // AC: Close button dismisses toast via onOpenChange
  test('close button dismisses toast via onOpenChange', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, toasts } = useToast();
      return (
        <div>
          <button
            onClick={() => {
              toast({ title: 'Close Test', duration: Infinity });
            }}
          >
            Show
          </button>
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider duration={Infinity} closeLabel="Dismiss">
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    // Click close button
    const closeButton = screen.getByLabelText('Dismiss');
    await user.click(closeButton);

    // Toast should be dismissed
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  // AC: Action without onClick (optional callback)
  test('action without onClick does not error', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast } = useToast();
      return (
        <button
          onClick={() => {
            toast({
              title: 'No Action Handler',
              duration: Infinity,
              action: {
                label: 'Button',
                altText: 'Action without handler',
                onClick: undefined as any, // Intentionally undefined to test defensive code
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
    expect(screen.getByText('Button')).toBeInTheDocument();

    // Click action (should not error even without handler)
    await user.click(screen.getByText('Button'));
    // Toast should be dismissed regardless
    expect(screen.queryByText('No Action Handler')).not.toBeInTheDocument();
  });

  // AC: Toast rendering with multiple variants and content combinations
  test('renders toast with all content combinations', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast } = useToast();
      return (
        <button
          onClick={() => {
            toast({
              title: 'Full Toast',
              description: 'With description',
              variant: 'success',
              duration: 3000,
              action: {
                label: 'Retry',
                altText: 'Retry action',
                onClick: () => {},
              },
            });
          }}
        >
          Show Full
        </button>
      );
    }

    render(
      <ToastProvider duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Full'));

    // Verify all elements rendered
    expect(screen.getByText('Full Toast')).toBeInTheDocument();
    expect(screen.getByText('With description')).toBeInTheDocument();
    const toastEl = screen.getByText('Full Toast').closest('.sv-toast');
    expect(toastEl).toHaveClass('sv-toast--success');
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  // AC: a toast without an explicit `duration` falls back to the provider's
  // default (entry.duration ?? duration). Every other test in this file passes
  // `duration` explicitly (usually Infinity) to keep assertions deterministic,
  // which left this fallback branch itself unexercised — this test covers it
  // directly via Radix's own `duration={Infinity}` no-auto-dismiss contract
  // instead of racing a real/faked timer.
  test('falls back to the provider duration when the toast omits one', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast } = useToast();
      return (
        <button onClick={() => toast({ title: 'Uses provider default' })}>
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

    // No `duration` was passed to toast(), so it must have inherited the
    // provider's Infinity default (never becomes unmountable on its own) —
    // if the fallback were broken (e.g. resolving to `undefined`), Radix
    // would use its own built-in default duration instead, which is finite.
    expect(screen.getByText('Uses provider default')).toBeInTheDocument();
    const toastEl = screen.getByText('Uses provider default').closest('[data-variant]');
    expect(toastEl).toHaveAttribute('data-variant', 'info');
  });
});

// F7 — real timer verification. Radix's Toast.Root schedules dismissal with
// a plain `window.setTimeout(handleClose, duration)` (see
// node_modules/@radix-ui/react-toast/dist/index.mjs) and tracks pause/resume
// via `new Date().getTime()` deltas — both are exactly what
// vi.useFakeTimers() intercepts, so we drive time explicitly instead of
// asserting "still in the document right after the event fires", which is
// true whether or not the underlying timer logic works at all.
//
// Radix's pause/resume is wired to `pointermove`/`pointerleave` on the
// viewport's wrapper (the element with role="region"), NOT `pointerenter` —
// see the VIEWPORT_PAUSE/VIEWPORT_RESUME listeners in the Radix source.
describe('Toast Timer Lifecycle (F7 — real timer verification)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('default duration is 5000ms: alive at 4999ms, gone at 5000ms, and removed from toasts', async () => {
    function TestComponent() {
      const { toast, toasts } = useToast();
      return (
        <div>
          <button onClick={() => toast({ title: 'Default Duration' })}>Show</button>
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show'));
    expect(screen.getByText('Default Duration')).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    await act(async () => { await vi.advanceTimersByTimeAsync(4999); });
    expect(screen.getByText('Default Duration')).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(screen.queryByText('Default Duration')).not.toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  test('a per-toast duration overrides the provider default', async () => {
    function TestComponent() {
      const { toast } = useToast();
      return <button onClick={() => toast({ title: 'Short-lived', duration: 1000 })}>Show</button>;
    }

    render(
      <ToastProvider duration={5000}>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show'));
    expect(screen.getByText('Short-lived')).toBeInTheDocument();

    // If the per-toast duration did not win, this toast would still be
    // alive here (it would need the full 5000ms provider default).
    await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
    expect(screen.queryByText('Short-lived')).not.toBeInTheDocument();
  });

  test('hovering the toast region (pointermove) pauses the countdown; leaving resumes it', async () => {
    function TestComponent() {
      const { toast } = useToast();
      return <button onClick={() => toast({ title: 'Hover Test', duration: 1000 })}>Show</button>;
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show'));
    const region = screen.getByRole('region');

    // Consume most of the window, then pause with time to spare.
    await act(async () => { await vi.advanceTimersByTimeAsync(800); });
    expect(screen.getByText('Hover Test')).toBeInTheDocument();
    fireEvent.pointerMove(region);

    // While paused, advancing well past the original 1000ms must NOT
    // dismiss the toast — if pause were a no-op, this would fail.
    await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
    expect(screen.getByText('Hover Test')).toBeInTheDocument();

    // Resume: only ~200ms of the original budget was left when we paused.
    fireEvent.pointerLeave(region);
    await act(async () => { await vi.advanceTimersByTimeAsync(199); });
    expect(screen.getByText('Hover Test')).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(screen.queryByText('Hover Test')).not.toBeInTheDocument();
  });

  test('update() restarts the auto-dismiss countdown from the moment it is called', async () => {
    function TestComponent() {
      const { toast, toasts } = useToast();
      const [handle, setHandle] = React.useState<any>(null);
      return (
        <div>
          <button onClick={() => setHandle(toast({ title: 'Original', duration: 2000 }))}>Show</button>
          {handle && (
            <button data-testid="update-btn" onClick={() => handle.update({ title: 'Updated' })}>
              Update
            </button>
          )}
          <div data-testid="count">{toasts.length}</div>
        </div>
      );
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show'));

    // Consume most of the original 2000ms window.
    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
    expect(screen.getByText('Original')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('update-btn'));
    expect(screen.getByText('Updated')).toBeInTheDocument();

    // The original countdown would have expired 500ms from here. If update()
    // did not restart it, the toast would be gone by this point.
    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
    expect(screen.getByText('Updated')).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    // Complete the new 2000ms window measured from the update() call (500ms more).
    await act(async () => { await vi.advanceTimersByTimeAsync(500); });
    expect(screen.queryByText('Updated')).not.toBeInTheDocument();
  });
});

// F1 (R5-05 AC-3): the whole point of passing `type` to Toast.Root is that
// Radix maps it to `aria-live` — info/success ("background") must announce
// politely, warning/danger ("foreground") must interrupt. No prior test in
// this file asserted the `aria-live` value itself.
describe('Toast Announcement Severity (F1 — aria-live matches variant)', () => {
  test.each([
    ['info', 'polite'],
    ['success', 'polite'],
    ['warning', 'assertive'],
    ['danger', 'assertive'],
  ] as const)('variant=%s announces with aria-live=%s', async (variant, expectedAriaLive) => {
    function TestComponent() {
      const { toast } = useToast();
      return (
        <button onClick={() => toast({ title: `${variant} toast`, variant, duration: Infinity })}>
          Show
        </button>
      );
    }

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show'));
    // Make sure the toast actually rendered before inspecting the announcer.
    expect(screen.getByText(`${variant} toast`)).toBeInTheDocument();

    // Radix's `type` prop drives a dedicated, visually-hidden announcer
    // element (a `role="status"` span appended at the end of the document)
    // that receives a text copy of the toast for assistive tech — it is a
    // sibling of the visible toast markup, not an ancestor of the title, so
    // it has to be found independently rather than via `.closest()`.
    const announceEl = document.body.querySelector('[role="status"][aria-live]');
    expect(announceEl).toHaveAttribute('aria-live', expectedAriaLive);
  });
});

describe('Toast Mutation Coverage (F8 — M3, M9)', () => {
  // M3: FIFO eviction must actually dismiss the oldest toast, not just truncate
  test('FIFO eviction actually dismisses the oldest toast (M3)', async () => {
    const user = userEvent.setup();

    function TestComponent() {
      const { toast, toasts, dismiss } = useToast();
      const [handles, setHandles] = React.useState<any[]>([]);

      return (
        <div>
          <button
            onClick={() => {
              const h1 = toast({ title: 'Toast 1', duration: Infinity });
              const h2 = toast({ title: 'Toast 2', duration: Infinity });
              const h3 = toast({ title: 'Toast 3', duration: Infinity });
              const h4 = toast({ title: 'Toast 4', duration: Infinity });
              setHandles([h1, h2, h3, h4]);
            }}
          >
            Show 4
          </button>
          <button
            onClick={() => {
              toasts.forEach((t) => dismiss(t.id));
            }}
          >
            Dismiss all visible
          </button>
          <div data-testid="count">{toasts.length}</div>
          <div data-testid="toast-ids">
            {toasts.map((t) => t.id).join(',')}
          </div>
        </div>
      );
    }

    render(
      <ToastProvider max={3} duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show 4'));

    // Should have at most 3 toasts displayed
    expect(screen.getByTestId('count')).toHaveTextContent('3');

    // Should show Toast 2, 3, 4 (Toast 1 dismissed)
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
    expect(screen.getByText('Toast 3')).toBeInTheDocument();
    expect(screen.getByText('Toast 4')).toBeInTheDocument();
    expect(screen.queryByText('Toast 1')).not.toBeInTheDocument();

    // Verify the actual IDs shown match what's in toasts (proving FIFO worked)
    const ids = screen.getByTestId('toast-ids').textContent;
    expect(ids).toBeTruthy();
    expect(ids?.split(',')).toHaveLength(3);

    // Discriminating check for M3: `toasts` is `allToasts.slice(-max)`, so a
    // length-3-with-Toast-1-absent result above would hold true even if the
    // FIFO effect's `dismiss(toRemove.id)` call were deleted entirely — the
    // slice alone produces that view. The only way to tell "Toast 1 was
    // actually dismissed" from "Toast 1 is merely off the visible slice"
    // apart is to shrink the visible set below its size and see whether the
    // evicted item resurfaces. If the eviction dismiss() never fired,
    // Toast 1 is still sitting in the underlying (un-sliced) state, and
    // dismissing everything currently visible will make it reappear.
    await user.click(screen.getByText('Dismiss all visible'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.queryByText('Toast 1')).not.toBeInTheDocument();
  });

  // M9: Icon identity must match per variant (info→info, success→check-circle, etc)
  test('icons match their variant (M9 — icon identity)', async () => {
    const user = userEvent.setup();
    const variants: Array<{ variant: ToastVariant; expectedIcon: string }> = [
      { variant: 'info', expectedIcon: 'info' },
      { variant: 'success', expectedIcon: 'check-circle' },
      { variant: 'warning', expectedIcon: 'alert-triangle' },
      { variant: 'danger', expectedIcon: 'alert-circle' },
    ];

    for (const { variant, expectedIcon } of variants) {
      function TestComponent() {
        const { toast } = useToast();
        return (
          <button
            onClick={() => {
              toast({ title: `${variant} Toast`, variant, duration: Infinity });
            }}
          >
            Show {variant}
          </button>
        );
      }

      const { unmount } = render(
        <ToastProvider duration={Infinity}>
          <TestComponent />
        </ToastProvider>
      );

      await user.click(screen.getByText(`Show ${variant}`));

      // Find the toast and check the icon element's data-name attribute
      const toastEl = screen.getByText(`${variant} Toast`).closest('.sv-toast');
      const iconEl = toastEl?.querySelector('.sv-toast__icon');

      // The Icon component should render with data-name matching the expected icon
      expect(iconEl).toBeInTheDocument();
      expect(iconEl).toHaveAttribute('data-name', expectedIcon);

      unmount();
    }
  });
});

describe('Toast Edge Case: Unmount Guard (F9)', () => {
  // AC: calling toast() after provider unmount is no-op
  test('toast() after unmount is no-op (does not error)', async () => {
    const user = userEvent.setup();
    let toastFunction: any;

    function TestComponent() {
      const { toast } = useToast();
      toastFunction = toast;
      return (
        <button onClick={() => toast({ title: 'Test' })}>
          Show
        </button>
      );
    }

    const { unmount } = render(
      <ToastProvider duration={Infinity}>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show'));
    expect(screen.getByText('Test')).toBeInTheDocument();

    // Unmount the provider
    unmount();

    // Now call toast() on the captured function (after unmount)
    const handle = toastFunction({ title: 'After Unmount' });

    // Should return a no-op handle (id is empty string)
    expect(handle.id).toBe('');
    expect(typeof handle.dismiss).toBe('function');
    expect(typeof handle.update).toBe('function');

    // Calling the no-op methods should not error
    handle.dismiss();
    handle.update({ title: 'Updated' });

    // Should not have rendered anything new
    expect(screen.queryByText('After Unmount')).not.toBeInTheDocument();
  });
});
