'use client';

import * as React from 'react';
import * as Toast from '@radix-ui/react-toast';
import { Icon, type IconName } from '../../components/ui/icon';
import { cn } from '../../lib/utils';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ToastAction {
  label: React.ReactNode;
  /** Required by the primitive: the screen-reader alternative to reaching the
   *  button before auto-dismiss (e.g. "Undo (Alt+U)"). */
  altText: string;
  onClick: () => void;
}

export interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
}

export interface ToastEntry extends ToastOptions {
  id: string;
  /** Incremented on update to force Toast.Root remount and timer restart */
  version: number;
}

export interface ToastHandle {
  id: string;
  dismiss: () => void;
  update: (patch: Partial<ToastOptions>) => void;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => ToastHandle;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  toasts: readonly ToastEntry[];
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// Variant to icon and Radix toast type mapping
const variantConfig: Record<
  ToastVariant,
  { icon: IconName; type: 'foreground' | 'background' }
> = {
  info: { icon: 'info', type: 'background' },
  success: { icon: 'check-circle', type: 'background' },
  warning: { icon: 'alert-triangle', type: 'foreground' },
  danger: { icon: 'alert-circle', type: 'foreground' },
};

type ToastAction_Dispatch =
  | { type: 'ADD'; entry: ToastEntry }
  | { type: 'REMOVE'; id: string }
  | { type: 'UPDATE'; id: string; patch: Partial<ToastOptions> }
  | { type: 'REMOVE_ALL' };

function toastReducer(
  state: readonly ToastEntry[],
  action: ToastAction_Dispatch,
): readonly ToastEntry[] {
  switch (action.type) {
    case 'ADD': {
      return [...state, action.entry];
    }
    case 'REMOVE': {
      return state.filter((t) => t.id !== action.id);
    }
    case 'UPDATE': {
      return state.map((t) =>
        t.id === action.id ? { ...t, ...action.patch, version: t.version + 1 } : t,
      );
    }
    case 'REMOVE_ALL': {
      return [];
    }
    /* v8 ignore next 2 */
    default: {
      return state;
    }
  }
}

export interface ToastProviderProps {
  children: React.ReactNode;
  duration?: number;
  max?: number;
  label?: string;
  closeLabel?: string;
  swipeDirection?: 'up' | 'down' | 'left' | 'right';
}

export function ToastProvider({
  children,
  duration = 5000,
  max = 3,
  label = 'Notifications',
  closeLabel = 'Close',
  swipeDirection = 'right',
}: ToastProviderProps) {
  const [allToasts, dispatch] = React.useReducer(toastReducer, []);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Ensure max is valid
  const validatedMax = typeof max === 'number' && Number.isFinite(max) && max > 0 ? Math.floor(max) : 3;

  // If toasts exceed max, remove oldest (FIFO)
  const displayedToasts = allToasts.slice(-validatedMax);

  const toast = React.useCallback(
    (options: ToastOptions): ToastHandle => {
      /* v8 ignore next */ if (!isMountedRef.current) return { id: '', dismiss: () => {}, update: () => {} };

      const id = Math.random().toString(36).substr(2, 9);
      const variant = options.variant ?? 'info';
      const duration_val =
        typeof options.duration === 'number' && options.duration > 0
          ? options.duration
          : duration;

      const entry: ToastEntry = {
        ...options,
        variant,
        duration: duration_val,
        id,
        version: 0,
      };

      dispatch({ type: 'ADD', entry });

      return {
        id,
        dismiss: () => dispatch({ type: 'REMOVE', id }),
        update: (patch: Partial<ToastOptions>) => {
          dispatch({ type: 'UPDATE', id, patch });
        },
      };
    },
    [duration],
  );

  const dismiss = React.useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const dismissAll = React.useCallback(() => {
    dispatch({ type: 'REMOVE_ALL' });
  }, []);

  // Remove oldest when exceeding max
  React.useEffect(() => {
    if (allToasts.length > validatedMax) {
      const toRemove = allToasts[0];
      /* v8 ignore next */ if (toRemove) {
        dismiss(toRemove.id);
      }
    }
  }, [allToasts.length, validatedMax, dismiss]);

  const value: ToastContextValue = {
    toast,
    dismiss,
    dismissAll,
    toasts: displayedToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider duration={duration} label={label} swipeDirection={swipeDirection}>
        {children}
        <Toast.Viewport className="sv-toast__viewport" />
        <ToastViewportRenderer
          toasts={displayedToasts}
          closeLabel={closeLabel}
          duration={duration}
          dismiss={dismiss}
        />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

interface ToastViewportRendererProps {
  toasts: readonly ToastEntry[];
  closeLabel: string;
  duration: number;
  dismiss: (id: string) => void;
}

function ToastViewportRenderer({
  toasts,
  closeLabel,
  duration,
  dismiss,
}: ToastViewportRendererProps) {
  return (
    <>
      {toasts.map((entry) => {
        const { id, title, description, variant = 'info', action } = entry;
        const config = variantConfig[variant];
        // entry.duration is always resolved to a number by toast() before
        // dispatch (see the `toast` callback above), so the `?? duration`
        // fallback is unreachable via the only current call path — but
        // ToastOptions.duration is typed optional, so this stays as a
        // defensive guard against a future direct `dispatch({type:'ADD'})`
        // caller that skips that resolution. Same rationale as the
        // addListener/removeListener fallbacks in src/behaviors/mediaQuery.ts.
        /* v8 ignore next */ const toastDuration = entry.duration ?? duration;

        const handleActionClick = () => {
          if (action?.onClick) {
            action.onClick();
          }
          dismiss(id);
        };

        return (
          <Toast.Root
            key={`${id}-${entry.version}`}
            open={true}
            onOpenChange={(open) => {
              /* v8 ignore next */ if (!open) {
                dismiss(id);
              }
            }}
            duration={toastDuration}
            type={config.type}
            data-variant={variant}
            className={cn('sv-toast', `sv-toast--${variant}`)}
          >
            <div>
              <Icon name={config.icon} className="sv-toast__icon" aria-hidden="true" data-name={config.icon} />
              <div className="sv-toast__content">
                {title && <Toast.Title className="sv-toast__title">{title}</Toast.Title>}
                {description && (
                  <Toast.Description className="sv-toast__description">
                    {description}
                  </Toast.Description>
                )}
              </div>
              <div className="sv-toast__actions">
                {action && (
                  <Toast.Action
                    altText={action.altText}
                    asChild
                  >
                    <button
                      className="sv-toast__action"
                      onClick={handleActionClick}
                    >
                      {action.label}
                    </button>
                  </Toast.Action>
                )}
                <Toast.Close asChild>
                  <button className="sv-toast__close" aria-label={closeLabel}>
                    <Icon name="x" />
                  </button>
                </Toast.Close>
              </div>
            </div>
          </Toast.Root>
        );
      })}
    </>
  );
}
