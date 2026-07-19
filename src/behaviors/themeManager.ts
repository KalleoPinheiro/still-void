import {
  DEFAULT_ACCENT,
  DEFAULT_MODE,
  accentNames,
  themeModes,
  type AccentName,
  type ThemeMode,
} from '../tokens/colors';

export interface ThemeState {
  mode: ThemeMode;
  accent: AccentName;
}

export interface ThemeManagerOptions {
  /** Element receiving data-theme / data-accent. Defaults to <html>. */
  root?: HTMLElement;
  defaultMode?: ThemeMode;
  defaultAccent?: AccentName;
  /** localStorage key. Pass null to disable persistence. */
  storageKey?: string | null;
}

export interface ThemeManager {
  getState: () => ThemeState;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentName) => void;
  toggleMode: () => void;
  subscribe: (listener: (state: ThemeState) => void) => () => void;
  destroy: () => void;
}

const DEFAULT_STORAGE_KEY = 'quiet-tech-theme';

function isMode(value: unknown): value is ThemeMode {
  return themeModes.includes(value as ThemeMode);
}

function isAccent(value: unknown): value is AccentName {
  return accentNames.includes(value as AccentName);
}

function readStorage(key: string): Partial<ThemeState> {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const { mode, accent } = parsed as Record<string, unknown>;
    return {
      ...(isMode(mode) ? { mode } : {}),
      ...(isAccent(accent) ? { accent } : {}),
    };
  } catch {
    return {};
  }
}

/**
 * Framework-agnostic theme controller. Applies `data-theme` and `data-accent`
 * attributes; theme.css does the rest via CSS vars. If the server already
 * rendered the attributes (RSC/SSR), those win over defaults, so there is
 * no flash of wrong theme.
 */
export function createThemeManager(options: ThemeManagerOptions = {}): ThemeManager {
  const root = options.root ?? document.documentElement;
  const storageKey = options.storageKey === null ? null : (options.storageKey ?? DEFAULT_STORAGE_KEY);

  const ssrMode = root.getAttribute('data-theme');
  const ssrAccent = root.getAttribute('data-accent');
  const stored = storageKey ? readStorage(storageKey) : {};

  let state: ThemeState = {
    mode: stored.mode ?? (isMode(ssrMode) ? ssrMode : (options.defaultMode ?? DEFAULT_MODE)),
    accent:
      stored.accent ?? (isAccent(ssrAccent) ? ssrAccent : (options.defaultAccent ?? DEFAULT_ACCENT)),
  };

  const listeners = new Set<(state: ThemeState) => void>();

  function apply(): void {
    root.setAttribute('data-theme', state.mode);
    root.setAttribute('data-accent', state.accent);
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {
        // storage unavailable (private mode, quota) — theme still applies
      }
    }
    for (const listener of listeners) listener(state);
  }

  apply();

  return {
    getState: () => state,
    setMode(mode) {
      state = { ...state, mode };
      apply();
    },
    setAccent(accent) {
      state = { ...state, accent };
      apply();
    },
    toggleMode() {
      state = { ...state, mode: state.mode === 'dark' ? 'light' : 'dark' };
      apply();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      listeners.clear();
    },
  };
}
