import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { ThemeProvider } from '../src/react/client/ThemeProvider';
import { ThemeToggle } from '../src/react/client/ThemeToggle';

afterEach(cleanup);

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-accent');
});

describe('ThemeToggle', () => {
  test('shows "Light" label and aria-label to switch to light while in dark mode', async () => {
    render(
      <ThemeProvider storageKey={null} defaultMode="dark">
        <ThemeToggle />
      </ThemeProvider>,
    );
    const button = await screen.findByRole('button', { name: 'Switch to light theme' });
    expect(button).toHaveTextContent('Light');
  });

  test('clicking toggles to light mode and flips label/aria-label', async () => {
    render(
      <ThemeProvider storageKey={null} defaultMode="dark">
        <ThemeToggle />
      </ThemeProvider>,
    );
    const button = await screen.findByRole('button', { name: 'Switch to light theme' });
    fireEvent.click(button);
    expect(await screen.findByRole('button', { name: 'Switch to dark theme' })).toHaveTextContent(
      'Dark',
    );
  });
});
