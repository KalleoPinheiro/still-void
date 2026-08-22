/**
 * @still-void/ui/react — Server Component safe React adapter.
 * Nothing here uses hooks, state, or browser APIs, so every component can
 * render inside a Next.js Server Component. Interactive pieces live in
 * '@still-void/ui/react/client'.
 */
export * from './components/Shell';
export * from './components/Content';
export * from './components/Article';
export * from './components/ThemeScript';

// Server-safe shadcn/ui components (no hooks, no state, no browser APIs)
export { Button, type ButtonProps } from '../components/ui/button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../components/ui/card';
export { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
export { Badge, type BadgeProps } from '../components/ui/badge';
export { Input, type InputProps } from '../components/ui/input';

// Re-export data contracts and recipe types consumers need for props.
export type { PostSummary, TocItem, NavItem } from '../types';

// Design tokens — pure data, server-safe.
export * from '../tokens/colors';
export * from '../tokens/typography';
export * from '../tokens/spacing';
export * from '../tokens/motion';
export * from '../tokens/categories';
export * from '../tokens/zIndex';

// Recipes — pure class-name builders, server-safe.
export * from '../recipes/cx';
export * from '../recipes/shell';
export * from '../recipes/content';
export * from '../recipes/article';
