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
        gold: '#C8A050',
        'gold-bright': '#dcb464',
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
