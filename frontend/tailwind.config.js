/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'foodmatch-black': '#1a1a1a',
        'foodmatch-red': '#DC2626',
      }
    },
  },
  plugins: [],
}
