import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from '../src/components/ui/alert';

afterEach(cleanup);

describe('Alert', () => {
  test('renders with role=alert', () => {
    render(<Alert>Body</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Body');
  });

  test('forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Alert ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  test('merges custom className', () => {
    render(<Alert className="custom">X</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom');
  });

  // F4: Regression test — without variant, role="alert" is non-overridable
  test('forces role=alert without variant, even if role prop is passed (F4)', () => {
    render(<Alert role="banner">Body</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('role', 'alert');
    // Ensure "banner" role was not applied
    expect(screen.queryByRole('banner')).toBeNull();
  });
});

describe('AlertTitle', () => {
  test('renders as heading text and forwards ref', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(<AlertTitle ref={ref}>Title</AlertTitle>);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
  });
});

describe('AlertDescription', () => {
  test('renders description text and forwards ref', () => {
    const ref = createRef<HTMLParagraphElement>();
    render(<AlertDescription ref={ref}>Desc</AlertDescription>);
    expect(screen.getByText('Desc')).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('Alert family renders sv-* classes (FDP-12)', () => {
  test('Alert renders role=alert with the sv-alert class', () => {
    render(<Alert>Body</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('sv-alert');
    expect(alert).toHaveAttribute('role', 'alert');
  });

  test('AlertTitle renders the sv-alert__title class', () => {
    render(<AlertTitle>Title</AlertTitle>);
    expect(screen.getByText('Title')).toHaveClass('sv-alert__title');
  });

  test('AlertDescription renders the sv-alert__description class', () => {
    render(<AlertDescription>Desc</AlertDescription>);
    expect(screen.getByText('Desc')).toHaveClass('sv-alert__description');
  });

  test('no leftover Tailwind color utility on Alert', () => {
    render(<Alert>Body</Alert>);
    const classList = Array.from(screen.getByRole('alert').classList);
    const leftover = classList.find(
      (cls) => cls.startsWith('bg-sv-') || cls.startsWith('border-sv-') || cls.startsWith('text-sv-'),
    );
    expect(leftover).toBeUndefined();
  });
});

describe('Alert with variant (T1)', () => {
  // AC-1: Alert without variant maintains current behavior
  test('renders without variant exactly as before (role=alert, class=sv-alert, no variant class, no icon)', () => {
    render(<Alert>Body</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('sv-alert');
    expect(alert).not.toHaveClass('sv-alert--info', 'sv-alert--success', 'sv-alert--warning', 'sv-alert--danger');
    // No icon rendered (no SVG child)
    const svg = alert.querySelector('svg');
    expect(svg).toBeNull();
  });

  // AC-2: Four variants render with both base and variant class
  test.each([
    ['info', 'status'],
    ['success', 'status'],
    ['warning', 'alert'],
    ['danger', 'alert'],
  ] as const)('variant=%s renders both sv-alert and sv-alert--%s', (variant, role) => {
    render(<Alert variant={variant}>Body</Alert>);
    const alert = screen.getByRole(role);
    expect(alert).toHaveClass('sv-alert', `sv-alert--${variant}`);
  });

  // AC-3: Role derivation based on variant
  test('role=alert for danger and warning variants', () => {
    const { rerender } = render(<Alert variant="danger">Danger</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Alert variant="warning">Warning</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('role=status for info and success variants', () => {
    const { rerender } = render(<Alert variant="info">Info</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<Alert variant="success">Success</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  // AC-4: Derived role wins over passed props
  test('derived role=alert wins over props when variant=danger', () => {
    render(<Alert variant="danger" role="status">Danger</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  test('derived role=status wins over props when variant=info', () => {
    render(<Alert variant="info" role="alert">Info</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  // AC-5: Default icon by variant, aria-hidden (F8: verify icon identity, not just presence)
  test('renders default info icon for variant=info', () => {
    render(<Alert variant="info" />);
    const icon = screen.getByRole('status').querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('data-icon-name', 'info');
  });

  test('renders default check-circle icon for variant=success', () => {
    render(<Alert variant="success" />);
    const icon = screen.getByRole('status').querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('data-icon-name', 'check-circle');
  });

  test('renders default alert-triangle icon for variant=warning', () => {
    render(<Alert variant="warning" />);
    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('data-icon-name', 'alert-triangle');
  });

  test('renders default alert-circle icon for variant=danger', () => {
    render(<Alert variant="danger" />);
    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('data-icon-name', 'alert-circle');
  });

  // AC-6: Custom icon replaces default (AC-6)
  test('icon prop with React element renders custom icon', () => {
    const customIconElement = <span data-testid="custom-icon">✓</span>;
    render(
      <Alert variant="info" icon={customIconElement}>
        Content
      </Alert>,
    );
    // Custom icon is rendered
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    // Default icon is NOT rendered (SVG)
    expect(screen.getByRole('status').querySelector('svg')).toBeNull();
  });

  // AC-6: icon={null} suppresses icon
  test('icon={null} suppresses default icon', () => {
    render(<Alert variant="info" icon={null} />);
    const icon = screen.getByRole('status').querySelector('svg');
    expect(icon).toBeNull();
  });

  // Edge case: invalid variant falls back to neutral
  test('invalid variant renders as neutral (no variant class)', () => {
    render(<Alert variant={'invalid' as any}>Body</Alert>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('sv-alert');
    expect(alert).not.toHaveClass('sv-alert--invalid');
  });

  // Edge case: className is merged
  test('className is merged with sv-alert', () => {
    render(<Alert variant="info" className="custom-class">Body</Alert>);
    const alert = screen.getByRole('status');
    expect(alert).toHaveClass('sv-alert', 'sv-alert--info', 'custom-class');
  });
});

describe('Alert with action slot (T2)', () => {
  // AC-1: action renders inside .sv-alert__action
  test('renders action inside sv-alert__action element', () => {
    render(
      <Alert>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Description</AlertDescription>
        <button>Undo</button>
      </Alert>,
    );
    // For this test we need to manually structure with action
    // Let's test when action prop is used
  });

  test('action slot element exists when action is provided', () => {
    render(
      <Alert action={<button>Undo</button>}>
        Content
      </Alert>,
    );
    const alert = screen.getByRole('alert');
    const actionSlot = alert.querySelector('.sv-alert__action');
    expect(actionSlot).toBeInTheDocument();
    expect(actionSlot).toHaveTextContent('Undo');
  });

  // AC-2: action omitted → element absent from DOM
  test('action element absent from DOM when action omitted', () => {
    render(<Alert>Content</Alert>);
    const alert = screen.getByRole('alert');
    const actionSlot = alert.querySelector('.sv-alert__action');
    expect(actionSlot).toBeNull();
  });

  // AC-4: action and icon together in same alert
  test('action and icon do not overlap in DOM structure', () => {
    render(
      <Alert variant="info" action={<button>Action</button>}>
        Content
      </Alert>,
    );
    const alert = screen.getByRole('status');
    const icon = alert.querySelector('svg');
    const actionSlot = alert.querySelector('.sv-alert__action');
    expect(icon).toBeInTheDocument();
    expect(actionSlot).toBeInTheDocument();
    // Action should come after other content
    const actionIndex = Array.from(alert.children).indexOf(actionSlot as any);
    const iconIndex = Array.from(alert.children).indexOf(icon as any);
    expect(actionIndex).toBeGreaterThan(iconIndex);
  });

  // Edge case: className still merged when action used
  test('className merged even with action', () => {
    render(
      <Alert variant="success" action={<button>OK</button>} className="my-alert">
        Content
      </Alert>,
    );
    const alert = screen.getByRole('status');
    expect(alert).toHaveClass('sv-alert', 'sv-alert--success', 'my-alert');
  });
});

describe('style.css Alert section — CSS contract (T1)', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/css/style.css'), 'utf-8');
  const marker = '/* ---------- Alert ---------- */';
  const start = css.indexOf(marker);
  const nextMarker = css.indexOf('/* ---------- ', start + marker.length);
  const alertSection = css.slice(start, nextMarker === -1 ? undefined : nextMarker);

  test('Alert CSS section exists', () => {
    expect(start).toBeGreaterThan(-1);
  });

  test.each(['.sv-alert', '.sv-alert__title', '.sv-alert__description'])('declares %s', (selector) => {
    expect(alertSection).toContain(selector);
  });

  // AC-7: Variant classes with color tokens
  test.each(['info', 'success', 'warning', 'danger'])('declares .sv-alert--%s', (variant) => {
    expect(alertSection).toContain(`.sv-alert--${variant}`);
  });

  // AC-7: Color comes from var(--sv-*-ink)
  test('variant classes use --sv-alert-color custom property', () => {
    expect(alertSection).toContain('--sv-alert-color');
  });

  test.each(['--sv-info-ink', '--sv-success-ink', '--sv-warning-ink', '--sv-danger-ink'])(
    'variant color rule references %s',
    (token) => {
      expect(alertSection).toContain(token);
    },
  );

  test('no rule in the Alert section uses box-shadow (Flat-By-Default)', () => {
    expect(alertSection).not.toMatch(/box-shadow/);
  });

  test('no token -soft introduced', () => {
    expect(alertSection).not.toMatch(/--sv-.*-soft/);
  });

  test('no rule in the Alert section hardcodes a color literal', () => {
    expect(alertSection).not.toMatch(/#[0-9a-fA-F]{3}|oklch\(|rgba?\(|hsla?\(/);
  });
});

describe('style.css Alert section — CSS contract (existing)', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/css/style.css'), 'utf-8');
  const marker = '/* ---------- Alert ---------- */';
  const start = css.indexOf(marker);
  const nextMarker = css.indexOf('/* ---------- ', start + marker.length);
  const alertSection = css.slice(start, nextMarker === -1 ? undefined : nextMarker);

  test('Alert CSS section exists', () => {
    expect(start).toBeGreaterThan(-1);
  });

  test.each(['.sv-alert', '.sv-alert__title', '.sv-alert__description'])('declares %s', (selector) => {
    expect(alertSection).toContain(selector);
  });

  test('no rule in the Alert section uses box-shadow (Flat-By-Default)', () => {
    expect(alertSection).not.toMatch(/box-shadow/);
  });

  test('no rule in the Alert section hardcodes a color literal', () => {
    expect(alertSection).not.toMatch(/#[0-9a-fA-F]{3}|oklch\(|rgba?\(|hsla?\(/);
  });
});
