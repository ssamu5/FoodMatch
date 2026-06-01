/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand palette: same tokens as foodmatch.es marketing site.
        // Dynamic tokens (flip with theme) use CSS variables so existing
        // utility classes (bg-paper, text-tinta, etc.) work in both modes.
        paper: 'rgb(var(--paper) / <alpha-value>)',     // page background (cream)
        surface: 'rgb(var(--surface) / <alpha-value>)', // lifted warm surface for cards/inputs (not white)
        creamy: 'rgb(var(--creamy) / <alpha-value>)',   // deeper warm (hover, bubbles)
        tinta: 'rgb(var(--tinta) / <alpha-value>)',     // primary text
        tinta2: 'rgb(var(--tinta2) / <alpha-value>)',   // slightly lighter tinta

        // Static tokens (never flip) used for elements over image gradients.
        // cream stays light so text-cream and bg-cream remain readable on
        // dark image overlays regardless of theme.
        cream: '#f8f1e5',
        ink: '#1f1814',       // permanent warm-dark for badges over images

        // Brand accents (kept static so brand identity is consistent).
        tomate: '#e63946',
        tomateDeep: '#b72c39',
        mostaza: '#f2a93b',
        oliva: '#5c6b2f',
        fresco: '#3fae6b',
        azulejo: '#1f4e5f',
        ceramica: '#d9694d',
        warn: '#d9694d',
        // Compat: keep lime token so any stale ref renders sensibly.
        lime: '#3fae6b',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Bricolage Grotesque"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        stamp: '6px 6px 0 0 rgba(31, 24, 20, 0.18)',
        stampLg: '10px 10px 0 0 rgba(31, 24, 20, 0.18)',
        warm: '0 14px 36px -12px rgba(230, 57, 70, 0.4)',
        glow: '0 0 18px -6px rgba(230, 57, 70, 0.45)',
        glass: '0 1px 0 0 rgba(31,24,20,0.04) inset, 0 0 0 1px rgba(31,24,20,0.06)',
        // Soft diffuse elevation (Uber x ChatGPT calm). Use over hard offsets.
        soft: 'var(--shadow-sm)',
        softMd: 'var(--shadow-md)',
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
