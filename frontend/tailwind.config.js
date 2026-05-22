/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette: same tokens as foodmatch.es marketing site.
        paper: '#f8f1e5',     // page background, warm cream
        cream: '#f8f1e5',
        creamy: '#f2e9d8',    // alt surface for cards / inputs
        tinta: '#1f1814',     // primary text and primary CTA
        tinta2: '#2a2218',    // slightly lighter tinta
        tomate: '#e63946',    // primary brand accent
        tomateDeep: '#b72c39',
        mostaza: '#f2a93b',   // secondary accent
        oliva: '#5c6b2f',
        fresco: '#3fae6b',    // positive / match indicator
        azulejo: '#1f4e5f',   // deep accent surface
        ceramica: '#d9694d',
        // Compat: keep lime token so any stale ref renders sensibly during transition.
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
