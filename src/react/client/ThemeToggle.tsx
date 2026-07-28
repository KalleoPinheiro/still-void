import type { ComponentPropsWithoutRef } from 'react';
import { cx } from '../../recipes/cx';
import { useTheme } from './ThemeProvider';

export interface ThemeToggleProps extends ComponentPropsWithoutRef<'button'> {}

/** Dark/light toggle. Compose into <Header actions={...} />. */
export function ThemeToggle({ className, ...rest }: ThemeToggleProps) {
  const { mode, toggleMode } = useTheme();
  const next = mode === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={toggleMode}
      className={cx('sv-header__link', className)}
      aria-label={`Switch to ${next} theme`}
      {...rest}
    >
      {mode === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
