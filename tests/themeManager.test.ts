import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { createThemeManager, type ThemeManager } from '../src/behaviors/themeManager';

describe('createThemeManager', () => {
  let manager: ThemeManager | null = null;

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-accent');
  });

  afterEach(() => {
    manager?.destroy();
    manager = null;
  });

  test('applies defaults to <html> attributes', () => {
    manager = createThemeManager({ storageKey: null });
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement).toHaveAttribute('data-accent', 'cyan');
  });

  test('respects server-rendered attributes over defaults', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-accent', 'mint');
    manager = createThemeManager({ storageKey: null });
    expect(manager.getState()).toEqual({ mode: 'light', accent: 'mint' });
  });

  test('stored preference wins over server-rendered attributes', () => {
    window.localStorage.setItem('still-void-theme', JSON.stringify({ mode: 'light', accent: 'amber' }));
    document.documentElement.setAttribute('data-theme', 'dark');
    manager = createThemeManager();
    expect(manager.getState()).toEqual({ mode: 'light', accent: 'amber' });
  });

  test('toggleMode flips between dark and light and notifies subscribers', () => {
    manager = createThemeManager({ storageKey: null });
    const seen: string[] = [];
    manager.subscribe((state) => seen.push(state.mode));
    manager.toggleMode();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    manager.toggleMode();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(seen).toEqual(['light', 'dark']);
  });

  test('persists state to localStorage', () => {
    manager = createThemeManager();
    manager.setAccent('violet');
    const stored = JSON.parse(window.localStorage.getItem('still-void-theme') ?? '{}');
    expect(stored.accent).toBe('violet');
  });

  test('ignores corrupted storage payloads', () => {
    window.localStorage.setItem('still-void-theme', 'not-json{');
    manager = createThemeManager();
    expect(manager.getState().mode).toBe('dark');
  });
});
