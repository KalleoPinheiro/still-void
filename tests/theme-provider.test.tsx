import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ThemeProvider, useTheme } from '../src/react/client/ThemeProvider';

afterEach(cleanup);

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-accent');
});

function Consumer() {
  const { mode, accent, setMode, setAccent, toggleMode } = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="accent">{accent}</span>
      <button onClick={() => setMode('light')}>set-light</button>
      <button onClick={() => setAccent('violet')}>set-violet</button>
      <button onClick={toggleMode}>toggle</button>
    </div>
  );
}

describe('useTheme', () => {
  test('throws when used outside a ThemeProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow('useTheme must be used within ThemeProvider');
    spy.mockRestore();
  });
});

describe('ThemeProvider', () => {
  test('provides default mode and accent to consumers', async () => {
    render(
      <ThemeProvider storageKey={null}>
        <Consumer />
      </ThemeProvider>,
    );
    expect(await screen.findByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('accent')).toHaveTextContent('cyan');
  });

  test('setMode updates the consumer and the <html> attribute', async () => {
    render(
      <ThemeProvider storageKey={null}>
        <Consumer />
      </ThemeProvider>,
    );
    await screen.findByTestId('mode');
    fireEvent.click(screen.getByText('set-light'));
    expect(await screen.findByTestId('mode')).toHaveTextContent('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  test('setAccent updates the consumer', async () => {
    render(
      <ThemeProvider storageKey={null}>
        <Consumer />
      </ThemeProvider>,
    );
    await screen.findByTestId('accent');
    fireEvent.click(screen.getByText('set-violet'));
    expect(await screen.findByTestId('accent')).toHaveTextContent('violet');
  });

  test('toggleMode flips dark/light', async () => {
    render(
      <ThemeProvider storageKey={null}>
        <Consumer />
      </ThemeProvider>,
    );
    await screen.findByTestId('mode');
    fireEvent.click(screen.getByText('toggle'));
    expect(await screen.findByTestId('mode')).toHaveTextContent('light');
  });

  test('unmount cleans up without throwing (subscription and manager destroyed)', async () => {
    const { unmount } = render(
      <ThemeProvider storageKey={null}>
        <Consumer />
      </ThemeProvider>,
    );
    await screen.findByTestId('mode');
    expect(() => unmount()).not.toThrow();
  });
});
