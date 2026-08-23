import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Every entry points at the custom property declared in theme.css
        // rather than repeating its value. Literals here froze the whole
        // Tailwind layer on the dark palette: a component using bg-sv-surface
        // stayed near-black under [data-theme='light']. Binding to the
        // variable makes the theme (and the accent) switch propagate for free.
        'sv-bg': 'var(--sv-bg)',
        'sv-bg-elev': 'var(--sv-bg-elev)',
        'sv-surface': 'var(--sv-surface)',
        'sv-surface-2': 'var(--sv-surface-2)',
        'sv-border': 'var(--sv-border)',
        'sv-border-strong': 'var(--sv-border-strong)',
        'sv-text': 'var(--sv-text)',
        'sv-text-2': 'var(--sv-text-2)',
        'sv-text-3': 'var(--sv-text-3)',

        // The nine *-light aliases that used to live here are gone: the
        // variable above already resolves to the light value under
        // [data-theme='light'], so a second set of keys was inert.

        // Accents (via data-accent)
        'sv-signal-cyan': 'var(--sv-accent-cyan)',
        'sv-twilight-violet': 'var(--sv-accent-violet)',
        'sv-quiet-mint': 'var(--sv-accent-mint)',
        'sv-warm-amber': 'var(--sv-accent-amber)',
      },
      fontFamily: {
        'sv-display': 'Sora, ui-sans-serif, system-ui, sans-serif',
        'sv-body': 'Manrope, ui-sans-serif, system-ui, sans-serif',
        'sv-mono': 'JetBrains Mono, ui-monospace, SF Mono, monospace',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        14: '56px',
        16: '64px',
        18: '72px',
      },
      borderRadius: {
        'sv-sm': '6px',
        'sv-md': '8px',
        'sv-lg': '12px',
        'sv-xl': '16px',
        'sv-full': '9999px',
      },
    },
  },
  corePlugins: {
    preflight: false, // Disable Tailwind's preflight to avoid conflicts with Still Void styles
  },
  plugins: [],
}

export default config
