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
export { Icon, type IconProps, type IconName } from '../components/ui/icon';
export { Input, type InputProps } from '../components/ui/input';
export { Textarea, type TextareaProps } from '../components/ui/textarea';
export { NativeSelect, type NativeSelectProps } from '../components/ui/native-select';
export { FileInput, type FileInputProps } from '../components/ui/file-input';
export { Checkbox, type CheckboxProps } from '../components/ui/checkbox';
export { Separator, type SeparatorProps } from '../components/ui/separator';
export { Progress, type ProgressProps } from '../components/ui/progress';
export {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupProps,
  type RadioGroupItemProps,
} from '../components/ui/radio-group';
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  type TableProps,
  type TableHeaderProps,
  type TableBodyProps,
  type TableFooterProps,
  type TableRowProps,
  type TableHeadProps,
  type TableCellProps,
  type TableCaptionProps,
} from '../components/ui/table';

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
export * from '../recipes/field';
export * from '../recipes/table';
