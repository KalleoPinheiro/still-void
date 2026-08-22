/**
 * @still-void/ui/react/client — Client Components.
 * The build prepends 'use client' to this entry; import from here only what
 * needs interactivity and compose into Server Components via slots.
 */
export * from './ThemeProvider';
export * from './ThemeToggle';
export * from './CopyButton';
export * from './TableOfContents';
export * from './ReadingProgress';
export * from './hooks';

// Client-only shadcn/ui components (require state, browser APIs, Radix UI interactivity)
export * from './shadcn';

// DOM/localStorage behaviors — client-only.
export * from '../../behaviors/themeManager';
export * from '../../behaviors/scrollSpy';
export {
  createReadingProgress,
  type ReadingProgressOptions,
  type ReadingProgress as ReadingProgressController,
} from '../../behaviors/readingProgress';
export * from '../../behaviors/clipboard';
