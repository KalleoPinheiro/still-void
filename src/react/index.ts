/**
 * @quiet-tech/ui/react — Server Component safe React adapter.
 * Nothing here uses hooks, state, or browser APIs, so every component can
 * render inside a Next.js Server Component. Interactive pieces live in
 * '@quiet-tech/ui/react/client'.
 */
export * from './components/Shell';
export * from './components/Content';
export * from './components/Article';

// Re-export data contracts and recipe types consumers need for props.
export type { PostSummary, TocItem, NavItem } from '../types';
export type { CalloutKind } from '../recipes/article';
export type { ThemeMode, AccentName } from '../tokens/colors';
