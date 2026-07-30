/**
 * Still Void z-index scale. Named steps instead of arbitrary numbers so new
 * layered components (dropdown, modal, toast, tooltip) stack predictably
 * against the existing sticky header and reading progress bar.
 */
export const zIndex = {
  dropdown: 10,
  sticky: 20,
  backdrop: 30,
  modal: 40,
  toast: 50,
  tooltip: 60,
} as const;

export type ZIndexStep = keyof typeof zIndex;
