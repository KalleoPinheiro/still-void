import { afterEach, describe, expect, test, vi } from 'vitest';
import { copyToClipboard } from '../src/behaviors/clipboard';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('copyToClipboard', () => {
  test('resolves true when writeText succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    await expect(copyToClipboard('hello')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  test('resolves false when navigator.clipboard is absent', async () => {
    vi.stubGlobal('navigator', {});
    await expect(copyToClipboard('hello')).resolves.toBe(false);
  });

  test('resolves false when writeText rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    await expect(copyToClipboard('hello')).resolves.toBe(false);
  });

  test('resolves false when navigator itself is undefined', async () => {
    vi.stubGlobal('navigator', undefined);
    await expect(copyToClipboard('hello')).resolves.toBe(false);
  });
});
