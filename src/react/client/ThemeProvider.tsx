import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  createThemeManager,
  type ThemeManager,
  type ThemeState,
} from '../../behaviors/themeManager';
import {
  DEFAULT_ACCENT,
  DEFAULT_MODE,
  type AccentName,
  type ThemeMode,
} from '../../tokens/colors';

export interface ThemeContextValue {
  mode: ThemeMode;
  accent: AccentName;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentName) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  defaultAccent?: AccentName;
  /** localStorage key; null disables persistence. */
  storageKey?: string | null;
}

/**
 * Wraps the app and drives data-theme/data-accent on <html> via the
 * framework-agnostic theme manager. For zero-flash SSR, also render the
 * attributes on <html> in your root layout:
 *   <html data-theme="dark" data-accent="cyan" suppressHydrationWarning>
 */
export function ThemeProvider({
  children,
  defaultMode = DEFAULT_MODE,
  defaultAccent = DEFAULT_ACCENT,
  storageKey,
}: ThemeProviderProps) {
  const managerRef = useRef<ThemeManager | null>(null);
  const [state, setState] = useState<ThemeState>({ mode: defaultMode, accent: defaultAccent });

  useEffect(() => {
    const manager = createThemeManager({ defaultMode, defaultAccent, storageKey });
    managerRef.current = manager;
    setState(manager.getState());
    const unsubscribe = manager.subscribe(setState);
    return () => {
      unsubscribe();
      manager.destroy();
      managerRef.current = null;
    };
    // Recreating the manager on default changes would clobber user choice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode: state.mode,
      accent: state.accent,
      setMode: (mode) => managerRef.current?.setMode(mode),
      setAccent: (accent) => managerRef.current?.setAccent(accent),
      toggleMode: () => managerRef.current?.toggleMode(),
    }),
    [state],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
