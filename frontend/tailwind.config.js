/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ChatGPT-style warm gray surfaces. Neutral, calm, high readability.
        ink: {
          950: '#1a1a1a',  // page background
          900: '#1f1f1f',  // alt section background
          800: '#262626',  // card background
          700: '#2f2f2f',  // elevated surface (inputs, sticky bars)
          600: '#3a3a3a',  // hover surface
          500: '#525252',  // dividers
          400: '#737373',
          300: '#929292',
          200: '#b3b3b3',  // secondary text
          100: '#d4d4d4',  // muted primary text
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
        cream: '#ececec',  // ChatGPT-style off-white for primary text
        warn: '#f0b864',
        bad: '#f87171',
      },
      fontFamily: {
        display: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"Geist"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glass: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.05)',
        glow: '0 0 16px -8px rgba(163, 255, 18, 0.25)',
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
