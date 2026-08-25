import { cx } from './cx';

/**
 * Field recipe: the single source of truth for the form-field frame shared by
 * Input, Textarea, NativeSelect and FileInput. Pure function — Server
 * Component safe, and exported so consumers composing their own markup style
 * a field the same way the components do instead of mirroring the CSS by hand.
 */

export type FieldVariant = 'input' | 'textarea' | 'select' | 'file';

export interface FieldOptions {
  variant?: FieldVariant;
}

export function field(options: FieldOptions = {}): string {
  // 'input' is the base shape, so it adds no modifier — the plain frame is
  // already what a single-line input needs.
  return cx(
    'sv-field',
    options.variant && options.variant !== 'input' && `sv-field--${options.variant}`,
  );
}

export const fieldClasses = {
  choice: 'sv-choice',
  srOnly: 'sv-sr-only',
} as const;

/**
 * Invalid state is read from the native `aria-invalid` attribute rather than
 * a boolean prop: Input/Textarea/NativeSelect/FileInput already spread
 * `...props`, so `<Input aria-invalid="true" />` alone paints the danger
 * border with zero component changes — composition over configuration.
 */
export type FieldMessageVariant = 'hint' | 'error';

export interface FieldMessageOptions {
  variant?: FieldMessageVariant;
}

/**
 * Helper/error text meant to sit under a field, associated to it via
 * `aria-describedby` on the field itself.
 */
export function fieldMessage(options: FieldMessageOptions = {}): string {
  return cx('sv-field-message', options.variant === 'error' && 'sv-field-message--error');
}
