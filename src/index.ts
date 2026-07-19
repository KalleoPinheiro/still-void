/**
 * @quiet-tech/ui — framework-agnostic core.
 * Tokens and recipes are pure data/functions (Server Component safe).
 * Behaviors touch the DOM only when called — import anywhere, call on the client.
 */

// tokens
export * from './tokens/colors';
export * from './tokens/typography';
export * from './tokens/spacing';
export * from './tokens/motion';
export * from './tokens/categories';

// data contracts
export * from './types';

// recipes (class-name builders)
export * from './recipes/cx';
export * from './recipes/shell';
export * from './recipes/content';
export * from './recipes/article';

// behaviors (vanilla DOM, client-side)
export * from './behaviors/themeManager';
export * from './behaviors/scrollSpy';
export * from './behaviors/readingProgress';
export * from './behaviors/clipboard';
