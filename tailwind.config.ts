import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#080808',
        ink: '#f0f0f0',
        // Monochrome system — the interface is black/white/grey so product
        // photography carries all the colour. `accent` marks live/interactive
        // elements; CTAs use it as a high-contrast bone fill on black.
        accent: '#f5f5f5',
        'accent-bright': '#ffffff',
        smoke: '#8a8a88', // mid-grey for secondary labels (was the gold tint)
        // Light "white sections" for the storefront body (dark hero, white shop)
        paper: '#ffffff',
        'paper-2': '#f4f2ec', // warm off-white for alternating bands
        coal: '#0d0d0d', // near-black text on light sections
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'var(--font-cairo)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
        arabic: ['var(--font-cairo)', 'var(--font-space-grotesk)', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.25em',
        wide: '0.14em',
      },
      keyframes: {
        ticker: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'ticker-rtl': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(50%)' },
        },
        hint: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.9' },
        },
        reveal: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        ticker: 'ticker 22s linear infinite',
        'ticker-rtl': 'ticker-rtl 22s linear infinite',
        hint: 'hint 2.4s ease-in-out infinite',
        reveal: 'reveal 0.8s ease both',
      },
    },
  },
  plugins: [],
};

export default config;
