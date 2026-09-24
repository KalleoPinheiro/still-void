import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

/**
 * The narrow-viewport work (Table stack, touch targets, .sv-layout fix) adds
 * public API, so it must ship as a minor — never folded into a patch.
 */
describe('release contract', () => {
  test('changeset minor para layout mobile', () => {
    const dir = resolve(process.cwd(), '.changeset');
    const entries = readdirSync(dir)
      .filter((name) => name.endsWith('.md') && name !== 'README.md')
      .map((name) => readFileSync(resolve(dir, name), 'utf-8'));
    const match = entries.find((text) => text.includes('`stack`') && text.includes('label'));
    if (match) {
      expect(match).toMatch(/^---\s*\n"@still-void\/ui":\s*minor\s*\n---/);
      return;
    }
    // After `changeset version` consumes the file, the entry must sit under a
    // "Minor Changes" heading of the changelog instead.
    const changelog = readFileSync(resolve(process.cwd(), 'CHANGELOG.md'), 'utf-8');
    const at = changelog.indexOf('`Table` accepts `stack`');
    expect(at, 'Table stack in a changeset or in the changelog').toBeGreaterThan(-1);
    const before = changelog.slice(0, at);
    expect(before.lastIndexOf('### Minor Changes')).toBeGreaterThan(before.lastIndexOf('### Patch Changes'));
  });
});
