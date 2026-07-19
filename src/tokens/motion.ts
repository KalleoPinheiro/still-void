/**
 * Quiet Tech motion tokens.
 * Hover transitions use the signature easing; the reading progress bar is linear.
 */
export const easings = {
  hover: 'cubic-bezier(.3,.7,.4,1)',
  linear: 'linear',
} as const;

export const durations = {
  fast: '120ms',
  base: '200ms',
  slow: '320ms',
} as const;

export type Easing = keyof typeof easings;
export type Duration = keyof typeof durations;
