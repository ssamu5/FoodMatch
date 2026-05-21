/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Liquid dark surfaces
        ink: {
          950: '#070a09',
          900: '#0d1311',
          800: '#131a17',
          700: '#1a221e',
          600: '#222a26',
          500: '#2a332e',
          400: '#3a4540',
          300: '#5a6660',
          200: '#9aa6a0',
          100: '#c8d2cd',
        },
        // Neon lime accent (Hyperliquid-inspired)
        lime: {
          DEFAULT: '#a3ff12',
          50: '#f4ffe5',
          100: '#e8ffcc',
          200: '#d4ff99',
          300: '#bdff5e',
          400: '#a3ff12',
          500: '#8ee500',
          600: '#73b800',
          700: '#5a8e00',
          800: '#3f6300',
          900: '#243800',
        },
        cream: '#f1ede4',
        warn: '#ffb84d',
        bad: '#ff5a5a',
      },
      fontFamily: {
        display: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glass: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.05)',
        glow: '0 0 24px -4px rgba(163, 255, 18, 0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s cubic-bezier(.2,.7,.2,1)',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
