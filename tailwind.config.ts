import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode (default)
        'sv-bg': '#0A0A0C',
        'sv-bg-elev': '#111114',
        'sv-surface': '#16161B',
        'sv-surface-2': '#1C1C22',
        'sv-border': 'rgba(255, 255, 255, 0.08)',
        'sv-border-strong': 'rgba(255, 255, 255, 0.14)',
        'sv-text': '#EDEDF0',
        'sv-text-2': '#8B8B96',
        'sv-text-3': '#83838F',

        // Light mode (via data-theme="light" or prefers-color-scheme)
        'sv-bg-light': '#F7F7F5',
        'sv-bg-elev-light': '#FFFFFF',
        'sv-surface-light': '#FFFFFF',
        'sv-surface-2-light': '#F2F2EF',
        'sv-border-light': 'rgba(0, 0, 0, 0.08)',
        'sv-border-strong-light': 'rgba(0, 0, 0, 0.14)',
        'sv-text-light': '#16161B',
        'sv-text-2-light': '#5A5A66',
        'sv-text-3-light': '#6F6F78',

        // Accents (via data-accent)
        'sv-signal-cyan': 'oklch(0.78 0.12 210)',
        'sv-twilight-violet': 'oklch(0.72 0.14 295)',
        'sv-quiet-mint': 'oklch(0.78 0.10 160)',
        'sv-warm-amber': 'oklch(0.78 0.12 75)',
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
