import { DEFAULT_STORAGE_KEY } from '../../behaviors/themeManager';
import { accentNames, themeModes } from '../../tokens/colors';

export interface ThemeScriptProps {
  /** Must match the `storageKey` passed to `<ThemeProvider>` (or `createThemeManager`). */
  storageKey?: string;
  /** CSP nonce forwarded to the inline `<script>`. */
  nonce?: string;
}

/**
 * Render once, as early as possible in `<head>` or right after `<html>` opens
 * (before the rest of the document): a blocking inline script that applies a
 * stored theme preference to `<html>` before first paint.
 *
 * Without this, the first paint uses whatever `data-theme`/`data-accent` the
 * server rendered — `<ThemeProvider>` only reconciles localStorage on mount,
 * so a returning visitor who chose light mode sees a dark flash until
 * hydration. This component is server-safe (no hooks, no browser APIs at
 * render time) and can be composed inside `<html>` from a Server Component.
 */
/**
 * `JSON.stringify` doesn't escape `<`, so a value containing `</script>`
 * (e.g. a `storageKey` derived from user input) would close the real
 * `<script>` tag early and let whatever follows run as raw HTML — a classic
 * JSON-in-script-tag XSS. `<` is a valid JS string escape the parser
 * decodes back to `<` at runtime, so this is purely a serialization-time
 * fix with no effect on the parsed value.
 */
function toScriptLiteral(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function ThemeScript({ storageKey = DEFAULT_STORAGE_KEY, nonce }: ThemeScriptProps = {}) {
  const modes = toScriptLiteral(themeModes);
  const accents = toScriptLiteral(accentNames);
  const key = toScriptLiteral(storageKey);

  const script = `(function(){try{var s=JSON.parse(localStorage.getItem(${key})||"null");if(!s)return;var m=${modes},a=${accents},r=document.documentElement;if(m.indexOf(s.mode)!==-1)r.setAttribute("data-theme",s.mode);if(a.indexOf(s.accent)!==-1)r.setAttribute("data-accent",s.accent);}catch(e){}})();`;

  // eslint-disable-next-line react/no-danger
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: script }} />;
}
