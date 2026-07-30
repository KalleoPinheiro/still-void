import { render } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { cleanup } from '@testing-library/react';
import { ThemeScript } from '../src/react/components/ThemeScript';
import { DEFAULT_STORAGE_KEY } from '../src/behaviors/themeManager';

afterEach(cleanup);

function scriptContent(container: HTMLElement): string {
  return container.querySelector('script')?.innerHTML ?? '';
}

describe('ThemeScript', () => {
  test('embeds the default storage key when none is passed', () => {
    const { container } = render(<ThemeScript />);
    expect(scriptContent(container)).toContain(JSON.stringify(DEFAULT_STORAGE_KEY));
  });

  test('embeds a custom storage key', () => {
    const { container } = render(<ThemeScript storageKey="my-app-theme" />);
    expect(scriptContent(container)).toContain('"my-app-theme"');
  });

  test('JSON.stringify-escapes a key containing quotes rather than injecting raw script', () => {
    const { container } = render(<ThemeScript storageKey={'x"};alert(1);//'} />);
    const content = scriptContent(container);
    expect(content).toContain(JSON.stringify('x"};alert(1);//'));
    expect(content).not.toMatch(/[^\\]"\};alert/);
  });

  test('forwards a CSP nonce to the script tag', () => {
    const { container } = render(<ThemeScript nonce="abc123" />);
    expect(container.querySelector('script')).toHaveAttribute('nonce', 'abc123');
  });

  test('only references known theme modes and accent names', () => {
    const { container } = render(<ThemeScript />);
    const content = scriptContent(container);
    expect(content).toContain('["dark","light"]');
    expect(content).toContain('["cyan","violet","mint","amber"]');
  });
});
